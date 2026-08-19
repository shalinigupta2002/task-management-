import BaseRepository from "./BaseRepository.js";

class TaskFrequencyRepository extends BaseRepository {
  constructor() {
    super("taskFrequency", {
      searchFields: ["frequencyName", "description"],
      sortFields: ["frequencyName", "daysInterval", "numberOfDays", "createdAt", "status"],
      defaultSort: "frequencyName",
    });
  }

  async findAll(query) {
    return super.findAll(query, {}, {
      _count: { select: { tasks: true } },
    });
  }

  async findById(id) {
    return super.findById(id, { _count: { select: { tasks: true } } });
  }

  async findByName(frequencyName) {
    return this.client.findFirst({
      where: { frequencyName, deletedAt: null },
    });
  }

  async softDelete(id) {
    try {
      return await this.client.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      const { handlePrismaError } = await import("../utils/prismaError.js");
      handlePrismaError(error);
    }
  }
}

export default new TaskFrequencyRepository();
