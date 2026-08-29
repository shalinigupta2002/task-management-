import prisma from "../config/database.js";
import {
  parsePagination,
  buildPaginationMeta,
  parseSort,
} from "../utils/pagination.js";
import { handlePrismaError } from "../utils/prismaError.js";
import { TASK_SORT_FIELDS } from "../constants/task.constants.js";
import {
  getNearingDueWindow,
  nearingDueWhere,
  todayDueWhere,
  overdueWhere,
} from "../utils/nearingDue.js";

const taskInclude = {
  category: { select: { id: true, categoryName: true } },
  frequency: { select: { id: true, frequencyName: true, daysInterval: true, numberOfDays: true } },
  department: { select: { id: true, departmentName: true, departmentCode: true } },
  company: { select: { id: true, companyName: true, companyCode: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
  approver: { select: { id: true, firstName: true, lastName: true, email: true } },
  assignments: {
    where: { status: { not: "CANCELLED" } },
    orderBy: { assignedDate: "desc" },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  _count: {
    select: {
      comments: true,
      attachments: true,
      activities: true,
      extensionRequests: true,
      occurrences: true,
    },
  },
};

const taskDetailInclude = {
  ...taskInclude,
  assignments: {
    orderBy: { assignedDate: "desc" },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, departmentId: true } },
      assignedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  updatedBy: { select: { id: true, firstName: true, lastName: true } },
  statusHistory: { orderBy: { changedAt: "desc" }, take: 20 },
  occurrences: {
    orderBy: { occurrenceDate: "asc" },
    include: {
      assignees: {
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          completedBy: { select: { id: true, firstName: true, lastName: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  },
};

class TaskRepository {
  buildWhere(query, scope = {}) {
    const where = { deletedAt: null, ...scope };

    if (query.companyId) where.companyId = query.companyId;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.frequencyId) where.frequencyId = query.frequencyId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    if (query.dueWindow === "nearingDue") {
      Object.assign(where, nearingDueWhere());
    } else if (query.dueWindow === "today") {
      Object.assign(where, todayDueWhere());
    } else if (query.dueWindow === "overdue") {
      Object.assign(where, overdueWhere());
    } else if (query.dueDateFrom || query.dueDateTo) {
      where.dueDate = {};
      if (query.dueDateFrom) where.dueDate.gte = new Date(query.dueDateFrom);
      if (query.dueDateTo) where.dueDate.lte = new Date(query.dueDateTo);
    }

    if (query.startDateFrom || query.startDateTo) {
      where.startDate = {};
      if (query.startDateFrom) where.startDate.gte = new Date(query.startDateFrom);
      if (query.startDateTo) where.startDate.lte = new Date(query.startDateTo);
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { taskCode: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (query.assignedToId) {
      const assigneeFilter = {
        some: { assignedToId: query.assignedToId, status: { not: "CANCELLED" } },
      };
      // Do not overwrite an existing assignment scope (e.g. employee self-scope)
      if (where.assignments) {
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : []),
          { assignments: where.assignments },
          { assignments: assigneeFilter },
        ];
        delete where.assignments;
      } else {
        where.assignments = assigneeFilter;
      }
    }

    return where;
  }

  async findAll(query, scope = {}) {
    try {
      const { page, limit, skip } = parsePagination(query);
      const where = this.buildWhere(query, scope);
      const orderBy = parseSort(query, TASK_SORT_FIELDS, "createdAt");

      const [items, total] = await Promise.all([
        prisma.task.findMany({ where, skip, take: limit, orderBy, include: taskInclude }),
        prisma.task.count({ where }),
      ]);

      return { items, meta: buildPaginationMeta(total, page, limit) };
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id, tx = prisma, options = {}) {
    try {
      return await tx.task.findFirst({
        where: { id, deletedAt: null },
        include: options.lite ? taskInclude : taskDetailInclude,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async generateTaskCode(companyId, tx = prisma) {
    const count = await tx.task.count({ where: { companyId } });
    return `TSK-${String(count + 1).padStart(4, "0")}`;
  }

  async create(data, tx = prisma, options = {}) {
    try {
      if (options.lite) {
        return await tx.task.create({
          data,
          select: {
            id: true,
            title: true,
            taskCode: true,
            companyId: true,
            departmentId: true,
            approverId: true,
          },
        });
      }
      return await tx.task.create({ data, include: taskDetailInclude });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id, data, tx = prisma, options = {}) {
    try {
      if (options.lite) {
        return await tx.task.update({
          where: { id },
          data,
          select: { id: true },
        });
      }
      return await tx.task.update({ where: { id }, data, include: taskDetailInclude });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async softDelete(id, tx = prisma) {
    try {
      return await tx.task.update({
        where: { id },
        data: { deletedAt: new Date(), status: "CANCELLED" },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createAssignment(data, tx = prisma, options = {}) {
    try {
      if (options.lite) {
        return await tx.taskAssignment.create({
          data,
          select: { id: true, taskId: true, assignedToId: true },
        });
      }
      return await tx.taskAssignment.create({
        data,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async cancelActiveAssignments(taskId, tx = prisma) {
    return tx.taskAssignment.updateMany({
      where: { taskId, status: { in: ["PENDING", "ACCEPTED"] } },
      data: { status: "REASSIGNED" },
    });
  }

  async createStatusHistory(data) {
    return prisma.taskStatusHistory.create({ data });
  }

  async getDashboardStats(filters = {}) {
    const where = { deletedAt: null, ...filters };
    const now = new Date();
    const { todayStart, todayEnd, thresholdDays } = getNearingDueWindow(now);

    const [
      total,
      pending,
      completed,
      overdue,
      todayTasks,
      nearingDue,
      byDepartment,
      byEmployee,
    ] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.task.count({
        where: {
          ...where,
          ...overdueWhere(now),
        },
      }),
      prisma.task.count({
        where: { ...where, dueDate: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.task.count({
        where: {
          ...where,
          ...nearingDueWhere(now, thresholdDays),
        },
      }),
      prisma.task.groupBy({
        by: ["departmentId"],
        where,
        _count: { id: true },
      }),
      prisma.taskAssignment.groupBy({
        by: ["assignedToId"],
        where: { task: where, status: { not: "CANCELLED" } },
        _count: { id: true },
      }),
    ]);

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      pendingTasks: pending,
      completedTasks: completed,
      overdueTasks: overdue,
      todayTasks,
      nearingDueTasks: nearingDue,
      nearingDueThresholdDays: thresholdDays,
      completionPercentage,
      departmentWise: byDepartment,
      employeeWise: byEmployee,
    };
  }
}

export default new TaskRepository();
