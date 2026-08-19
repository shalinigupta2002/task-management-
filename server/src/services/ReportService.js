import ReportRepository from "../repositories/ReportRepository.js";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";
import { assertResourceAccess, loadUserContext, isSubAdmin } from "../utils/taskAccess.js";

class ReportService {
  async getAll(query, userContext) {
    const q = { ...query };
    if (userContext.role !== "SUPER_ADMIN") {
      q.companyId = userContext.companyId;
    }
    return ReportRepository.findAll(q);
  }

  async getById(id, userContext) {
    const report = await ReportRepository.findById(id);
    if (!report) throw ApiError.notFound("Report not found");

    const ctx = await loadUserContext(userContext.userId);
    assertResourceAccess(ctx, report);

    return report;
  }

  async create(data, userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const payload = { ...data };

    if (ctx.roleName !== "SUPER_ADMIN") {
      payload.companyId = ctx.companyId;
    } else {
      if (!payload.companyId) throw ApiError.badRequest("companyId is required");
    }

    payload.status = "Ready";
    return ReportRepository.create(payload);
  }

  async exportReport(userContext) {
    const ctx = await loadUserContext(userContext.userId);
    const where = { deletedAt: null };
    if (ctx.roleName !== "SUPER_ADMIN") {
      if (!ctx.companyId) throw ApiError.forbidden("Company context required");
      where.companyId = ctx.companyId;
    }
    if (isSubAdmin(ctx) && ctx.departmentId) {
      where.departmentId = ctx.departmentId;
    }

    const tasks = await prisma.task.findMany({
      where,
      take: 10000,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { categoryName: true } },
        department: { select: { departmentName: true } },
      },
    });

    let csv = "Task Code,Title,Category,Department,Priority,Status,Due Date\n";
    for (const task of tasks) {
      const code = task.taskCode || "";
      const title = (task.title || "").replace(/"/g, '""');
      const cat = (task.category?.categoryName || "").replace(/"/g, '""');
      const dept = (task.department?.departmentName || "").replace(/"/g, '""');
      const priority = task.priority || "";
      const status = task.status || "";
      const dueDate = task.dueDate ? task.dueDate.toISOString() : "";
      csv += `${code},"${title}","${cat}","${dept}",${priority},${status},${dueDate}\n`;
    }

    return csv;
  }
}

export default new ReportService();
