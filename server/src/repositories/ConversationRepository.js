import prisma from "../config/database.js";
import { parsePagination, buildPaginationMeta } from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";

const participantInclude = {
  participants: {
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          profileImage: true, role: { select: { name: true } },
        },
      },
    },
  },
  messages: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true, message: true, messageType: true, createdAt: true,
      senderId: true, isRead: true,
    },
  },
};

class ConversationRepository {
  async findById(id) {
    try {
      return await prisma.conversation.findUnique({
        where: { id },
        include: {
          ...participantInclude,
          company: { select: { id: true, companyName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByParticipants(userIdA, userIdB) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: { some: { userId: userIdA } },
          AND: [{ participants: { some: { userId: userIdB } } }],
        },
        include: participantInclude,
        orderBy: { updatedAt: "desc" },
      });
      // Prefer classic 1:1 DIRECT pair; otherwise reuse any shared thread
      // (e.g. after a second Super Admin auto-joined a support conversation).
      return conversations.find((c) => c.participants.length === 2)
        ?? conversations[0]
        ?? null;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findForUser(userId, query = {}) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = {
        participants: { some: { userId } },
        ...(query.companyId ? { companyId: query.companyId } : {}),
      };

      const [items, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            ...participantInclude,
            company: { select: { id: true, companyName: true, companyCode: true } },
          },
        }),
        prisma.conversation.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Platform Company Inbox for Super Admin:
   * all conversations that already include any Super Admin participant
   * (typically MAIN_ADMIN ↔ SUPER_ADMIN support threads), optionally filtered by company.
   */
  async findSuperAdminCompanyInbox(query = {}) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = {
        participants: {
          some: {
            user: {
              deletedAt: null,
              role: { name: "SUPER_ADMIN" },
            },
          },
        },
        ...(query.companyId ? { companyId: query.companyId } : {}),
      };

      const [items, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            ...participantInclude,
            company: { select: { id: true, companyName: true, companyCode: true } },
          },
        }),
        prisma.conversation.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(data, participantIds) {
    try {
      return await prisma.conversation.create({
        data: {
          companyId: data.companyId,
          conversationType: data.conversationType || "DIRECT",
          participants: {
            create: participantIds.map((userId) => ({ userId })),
          },
        },
        include: participantInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async touchUpdatedAt(id) {
    return prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
  }
}

export default new ConversationRepository();
