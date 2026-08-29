import ConversationRepository from "../repositories/ConversationRepository.js";
import MessageService from "./MessageService.js";
import ApiError from "../utils/ApiError.js";
import { loadChatUser, assertCanInitiateConversation, assertConversationMember } from "../utils/chatAccess.js";
import { ROLES } from "../constants/index.js";
import { CHAT_INITIATE_TARGETS } from "../constants/chat.constants.js";
import prisma from "../config/database.js";
import { sanitizeUser } from "../utils/sanitize.js";

class ConversationService {
  resolveCompanyId(sender, receiver) {
    if (sender.roleName === ROLES.SUPER_ADMIN) {
      return receiver.companyId || sender.companyId;
    }
    if (receiver.roleName === ROLES.SUPER_ADMIN) {
      return sender.companyId;
    }
    return sender.companyId;
  }

  async getAll(userId, query) {
    const sender = await loadChatUser(userId);
    if (sender.roleName === ROLES.SUPER_ADMIN) {
      return ConversationRepository.findSuperAdminCompanyInbox(query);
    }
    return ConversationRepository.findForUser(userId, query);
  }

  async getById(id, userId) {
    await assertConversationMember(userId, id);
    const conversation = await ConversationRepository.findById(id);
    if (!conversation) throw ApiError.notFound("Conversation not found");
    return conversation;
  }

  /**
   * Strict hierarchy contact discovery:
   *   EMPLOYEE → SUB_ADMIN (same company / department)
   *   SUB_ADMIN → MAIN_ADMIN (same company)
   *   MAIN_ADMIN → SUPER_ADMIN (platform)
   *   SUPER_ADMIN → MAIN_ADMIN
   *
   * Optional query.targetRole must match the caller's only allowed initiate target(s).
   */
  async getEligibleContacts(userId, query = {}) {
    const sender = await loadChatUser(userId);
    const role = sender.roleName;
    const allowedTargets = CHAT_INITIATE_TARGETS[role] || [];

    if (allowedTargets.length === 0) {
      throw ApiError.forbidden("Your role cannot start hierarchy contact conversations");
    }

    const defaultTarget = allowedTargets[0];
    const requestedTarget = query.targetRole || null;

    if (requestedTarget && !allowedTargets.includes(requestedTarget)) {
      throw ApiError.forbidden(
        `${role} can only contact ${allowedTargets.join(" or ")}`
      );
    }

    const targetRole = requestedTarget || defaultTarget;

    const ACTION_LABELS = {
      [ROLES.SUB_ADMIN]: "Contact Sub Admin",
      [ROLES.MAIN_ADMIN]: "Contact Main Admin",
      [ROLES.SUPER_ADMIN]: "Contact Super Admin",
    };

    const actionLabel = ACTION_LABELS[targetRole] || `Contact ${targetRole}`;
    const where = {
      deletedAt: null,
      status: "ACTIVE",
      id: { not: sender.id },
      role: { name: targetRole },
    };

    if (role === ROLES.EMPLOYEE) {
      if (!sender.companyId) throw ApiError.badRequest("Employee has no company context");
      where.companyId = sender.companyId;
      if (sender.departmentId) {
        where.departmentId = sender.departmentId;
      }
    } else if (role === ROLES.SUB_ADMIN) {
      if (!sender.companyId) throw ApiError.badRequest("Sub Admin has no company context");
      where.companyId = sender.companyId;
    } else if (role === ROLES.MAIN_ADMIN) {
      // Prefer primary platform SA accounts (exclude local *.test seed duplicates)
      where.NOT = [{ email: { endsWith: ".test" } }];
    }

    const include = {
      role: { select: { id: true, name: true } },
      department: { select: { id: true, departmentName: true, departmentCode: true } },
      company: { select: { id: true, companyName: true, companyCode: true } },
    };

    const users = await prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
      take: 100,
      include,
    });

    let candidateUsers = users;
    if (targetRole === ROLES.SUPER_ADMIN && candidateUsers.length === 0 && role === ROLES.MAIN_ADMIN) {
      candidateUsers = await prisma.user.findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          id: { not: sender.id },
          role: { name: ROLES.SUPER_ADMIN },
        },
        orderBy: [{ createdAt: "asc" }],
        take: 100,
        include,
      });
    }

    const contacts = [];
    for (const user of candidateUsers) {
      const receiver = { ...user, roleName: user.role?.name };
      try {
        assertCanInitiateConversation(sender, receiver);
        contacts.push(sanitizeUser(user));
      } catch {
        /* skip unauthorized */
      }
    }

    return {
      senderRole: role,
      targetRole,
      actionLabel,
      contacts,
    };
  }

  async create(data, userId) {
    const sender = await loadChatUser(userId);
    const receiver = await loadChatUser(data.otherUserId);
    assertCanInitiateConversation(sender, receiver);

    const companyId = this.resolveCompanyId(sender, receiver);
    if (!companyId) {
      throw ApiError.badRequest("Cannot determine company for conversation");
    }

    const existing = await ConversationRepository.findByParticipants(sender.id, receiver.id);
    if (existing) {
      if (data.initialMessage) {
        await MessageService.send(
          { conversationId: existing.id, message: data.initialMessage },
          userId
        );
      }
      return ConversationRepository.findById(existing.id);
    }

    const conversation = await ConversationRepository.create(
      { companyId, conversationType: "DIRECT" },
      [sender.id, receiver.id]
    );

    if (data.initialMessage) {
      await MessageService.send(
        { conversationId: conversation.id, message: data.initialMessage },
        userId
      );
      return ConversationRepository.findById(conversation.id);
    }

    return conversation;
  }
}

export default new ConversationService();
