import prisma from "../config/database.js";
import { handlePrismaError } from "../utils/prismaError.js";

const occurrenceInclude = {
  task: {
    select: {
      id: true,
      taskCode: true,
      title: true,
      description: true,
      priority: true,
      status: true,
      startDate: true,
      dueDate: true,
      endDate: true,
      durationDays: true,
      recurrenceType: true,
      approverId: true,
      category: { select: { id: true, categoryName: true } },
      approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  },
  assignees: {
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true, departmentId: true } },
      completedBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
};

class TaskOccurrenceRepository {
  async createManyForTask(taskId, dates, assigneeIds, tx = prisma) {
    try {
      const uniqueAssignees = [...new Set(assigneeIds)];
      const results = [];

      for (let i = 0; i < dates.length; i += 1) {
        const occurrence = await tx.taskOccurrence.create({
          data: {
            taskId,
            occurrenceDate: dates[i],
            sequenceNumber: i + 1,
            assignees: {
              create: uniqueAssignees.map((assigneeId) => ({
                assigneeId,
                status: "OPEN",
              })),
            },
          },
          include: occurrenceInclude,
        });
        results.push(occurrence);
      }

      return results;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findByTask(taskId) {
    try {
      return await prisma.taskOccurrence.findMany({
        where: { taskId },
        orderBy: { occurrenceDate: "asc" },
        include: occurrenceInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id) {
    try {
      return await prisma.taskOccurrence.findUnique({
        where: { id },
        include: occurrenceInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAssigneeRecord(occurrenceId, assigneeId) {
    try {
      return await prisma.taskOccurrenceAssignee.findUnique({
        where: { occurrenceId_assigneeId: { occurrenceId, assigneeId } },
        include: {
          occurrence: { include: occurrenceInclude },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateAssigneeRecord(id, data) {
    try {
      return await prisma.taskOccurrenceAssignee.update({
        where: { id },
        data,
        include: {
          occurrence: { include: occurrenceInclude },
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          completedBy: { select: { id: true, firstName: true, lastName: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findCalendarEvents({ assigneeId, from, to, companyId, departmentId, approverId, status }) {
    try {
      const where = {
        occurrenceDate: {},
      };
      if (from) where.occurrenceDate.gte = from;
      if (to) where.occurrenceDate.lte = to;

      const assigneeWhere = { assigneeId };
      if (status) assigneeWhere.status = status;

      return await prisma.taskOccurrence.findMany({
        where: {
          ...where,
          assignees: { some: assigneeWhere },
          task: {
            deletedAt: null,
            ...(companyId ? { companyId } : {}),
            ...(departmentId ? { departmentId } : {}),
            ...(approverId ? { approverId } : {}),
          },
        },
        orderBy: { occurrenceDate: "asc" },
        include: occurrenceInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteByTaskId(taskId) {
    try {
      return await prisma.taskOccurrence.deleteMany({ where: { taskId } });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

export default new TaskOccurrenceRepository();
