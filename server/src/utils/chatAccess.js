import { ROLES } from "../constants/index.js";
import {
  ALLOWED_CHAT_PAIRS,
  CHAT_INITIATE_TARGETS,
} from "../constants/chat.constants.js";
import ApiError from "./ApiError.js";
import prisma from "../config/database.js";

export async function loadChatUser(userId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, status: "ACTIVE" },
    include: {
      role: { select: { name: true } },
      department: { select: { id: true, departmentName: true, departmentCode: true } },
      company: { select: { id: true, companyName: true, companyCode: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return { ...user, roleName: user.role.name };
}

function isPairAllowed(roleA, roleB) {
  return ALLOWED_CHAT_PAIRS.some(
    ([r1, r2]) => (r1 === roleA && r2 === roleB) || (r1 === roleB && r2 === roleA)
  );
}

function assertCompanyAndDepartmentRules(sender, receiver) {
  const senderRole = sender.roleName;
  const receiverRole = receiver.roleName;

  // Super Admin is platform-scoped (companyId may be null). Skip company match when either party is Super Admin.
  if (
    senderRole !== ROLES.SUPER_ADMIN
    && receiverRole !== ROLES.SUPER_ADMIN
    && sender.companyId !== receiver.companyId
  ) {
    throw ApiError.forbidden("Cannot chat with users outside your company");
  }

  // Employee may only contact Sub Admins in their own department (when both have a department)
  if (senderRole === ROLES.EMPLOYEE && receiverRole === ROLES.SUB_ADMIN) {
    if (sender.departmentId && receiver.departmentId && sender.departmentId !== receiver.departmentId) {
      throw ApiError.forbidden("You can only contact Sub Admins in your department");
    }
  }
  if (senderRole === ROLES.SUB_ADMIN && receiverRole === ROLES.EMPLOYEE) {
    if (sender.departmentId && receiver.departmentId && sender.departmentId !== receiver.departmentId) {
      throw ApiError.forbidden("Sub Admin can only chat with employees in their department");
    }
  }
}

/**
 * Validate messaging within an existing conversation (bidirectional hierarchy edges).
 */
export function assertChatAllowed(sender, receiver) {
  if (sender.id === receiver.id) {
    throw ApiError.badRequest("Cannot start a conversation with yourself");
  }

  const senderRole = sender.roleName;
  const receiverRole = receiver.roleName;

  if (senderRole === ROLES.EMPLOYEE && receiverRole === ROLES.EMPLOYEE) {
    throw ApiError.forbidden("Employees cannot chat with other employees");
  }
  if (senderRole === ROLES.SUB_ADMIN && receiverRole === ROLES.SUB_ADMIN) {
    throw ApiError.forbidden("Sub Admins cannot chat with other Sub Admins");
  }

  if (!isPairAllowed(senderRole, receiverRole)) {
    throw ApiError.forbidden(`Chat not allowed between ${senderRole} and ${receiverRole}`);
  }

  assertCompanyAndDepartmentRules(sender, receiver);
}

/**
 * Validate who may initiate a *new* conversation (strict upward hierarchy).
 * EMPLOYEE → SUB_ADMIN only
 * SUB_ADMIN → MAIN_ADMIN only
 * MAIN_ADMIN → SUPER_ADMIN only
 * SUPER_ADMIN → MAIN_ADMIN (platform support)
 */
export function assertCanInitiateConversation(sender, receiver) {
  if (sender.id === receiver.id) {
    throw ApiError.badRequest("Cannot start a conversation with yourself");
  }

  const senderRole = sender.roleName;
  const receiverRole = receiver.roleName;
  const allowedTargets = CHAT_INITIATE_TARGETS[senderRole] || [];

  if (!allowedTargets.includes(receiverRole)) {
    throw ApiError.forbidden(
      `${senderRole} can only initiate conversations with ${allowedTargets.join(" or ") || "no roles"}`
    );
  }

  // Also require the pair to be a hierarchy edge + tenant rules
  if (!isPairAllowed(senderRole, receiverRole)) {
    throw ApiError.forbidden(`Chat not allowed between ${senderRole} and ${receiverRole}`);
  }

  assertCompanyAndDepartmentRules(sender, receiver);
}

export async function assertConversationMember(userId, conversationId) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
  if (participant) return participant;

  // Platform support: any active Super Admin may open/reply on threads that already
  // include a Super Admin (Company Inbox), even if a different SA account was messaged.
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, status: "ACTIVE" },
    include: { role: { select: { name: true } } },
  });
  if (user?.role?.name === ROLES.SUPER_ADMIN) {
    const supportThread = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            user: {
              deletedAt: null,
              role: { name: ROLES.SUPER_ADMIN },
            },
          },
        },
      },
      select: { id: true },
    });
    if (supportThread) {
      return prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        create: { conversationId, userId },
        update: {},
      });
    }
  }

  throw ApiError.forbidden("You are not a member of this conversation");
}

export default {
  loadChatUser,
  assertChatAllowed,
  assertCanInitiateConversation,
  assertConversationMember,
};
