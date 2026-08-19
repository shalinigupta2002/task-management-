import prisma from "../config/database.js";
import { handlePrismaError } from "../utils/prismaError.js";

class PreferenceRepository {
  async findByUserId(userId) {
    try {
      return await prisma.notificationPreference.findUnique({ where: { userId } });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async upsert(userId, data) {
    try {
      return await prisma.notificationPreference.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getOrCreate(userId) {
    let pref = await this.findByUserId(userId);
    if (!pref) {
      pref = await this.upsert(userId, {});
    }
    return pref;
  }
}

export default new PreferenceRepository();
