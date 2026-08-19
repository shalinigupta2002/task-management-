import prisma from "../config/database.js";
import { handlePrismaError } from "../utils/prismaError.js";

class OnlineUserRepository {
  async upsert(userId, socketId, status = "ONLINE") {
    try {
      await prisma.onlineUser.deleteMany({ where: { socketId } });
      return await prisma.onlineUser.create({
        data: { userId, socketId, status, lastSeen: new Date() },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, companyId: true },
          },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async removeBySocketId(socketId) {
    return prisma.onlineUser.deleteMany({ where: { socketId } });
  }

  async updateStatus(userId, status) {
    return prisma.onlineUser.updateMany({
      where: { userId },
      data: { status, lastSeen: new Date() },
    });
  }

  async findOnlineByCompany(companyId) {
    const sessions = await prisma.onlineUser.findMany({
      where: { status: "ONLINE", user: { companyId, deletedAt: null } },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true,
            profileImage: true, companyId: true,
          },
        },
      },
      distinct: ["userId"],
    });
    return sessions.map((s) => s.user);
  }

  async isUserOnline(userId) {
    const count = await prisma.onlineUser.count({
      where: { userId, status: "ONLINE" },
    });
    return count > 0;
  }
}

export default new OnlineUserRepository();
