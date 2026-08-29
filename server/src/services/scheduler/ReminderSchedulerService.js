import prisma from "../../config/database.js";
import config from "../../config/index.js";
import NotificationService from "../NotificationService.js";
import {
  ACTIVITY_TO_NOTIFICATION,
  NOTIFICATION_TYPE,
  REFERENCE_TYPE,
  REMINDER_INTERVALS,
} from "../../constants/notification.constants.js";

class ReminderSchedulerService {
  constructor() {
    this.intervalId = null;
    this.lastActivityPoll = new Date(0);
    this.pollIntervalMs = config.scheduler.pollIntervalMs;
  }

  start() {
    if (this.intervalId) return;
    console.log("[Scheduler] Reminder scheduler started");
    this.run().catch((err) => console.error("[Scheduler] Initial run error:", err));
    this.intervalId = setInterval(() => {
      this.run().catch((err) => console.error("[Scheduler] Run error:", err));
    }, this.pollIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async run() {
    await this.markOverdueTasks();
    await this.processDueTodayNotifications();
    await this.processOverdueNotifications();
    await this.processDueDateReminders();
    await this.processTaskActivityNotifications();
  }

  async markOverdueTasks() {
    const now = new Date();
    const result = await prisma.task.updateMany({
      where: {
        deletedAt: null,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });
    if (result.count > 0) {
      console.log(`[Scheduler] Marked ${result.count} tasks as OVERDUE`);
    }
  }

  async getTaskAssignees(taskId) {
    const assignments = await prisma.taskAssignment.findMany({
      where: { taskId, status: { not: "CANCELLED" } },
      select: { assignedToId: true },
    });
    return assignments.map((a) => a.assignedToId);
  }

  async notifyTaskUsers(task, type, title, message, category, since) {
    // Only assignees receive due/reminder/overdue alerts — not all company users
    const assignees = await this.getTaskAssignees(task.id);
    for (const userId of assignees) {
      await NotificationService.createIfNotDuplicate({
        userId,
        title,
        message,
        type,
        priority: type === NOTIFICATION_TYPE.OVERDUE ? "URGENT" : "HIGH",
        referenceType: REFERENCE_TYPE.TASK,
        referenceId: task.id,
      }, category, since);
    }
  }

  async processDueTodayNotifications() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
    });

    for (const task of tasks) {
      await this.notifyTaskUsers(
        task,
        NOTIFICATION_TYPE.DUE_TODAY,
        "Task Due Today",
        `Task "${task.title}" (${task.taskCode}) is due today`,
        "task",
        todayStart
      );
    }
  }

  async processOverdueNotifications() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        status: "OVERDUE",
        dueDate: { lt: now },
      },
    });

    for (const task of tasks) {
      await this.notifyTaskUsers(
        task,
        NOTIFICATION_TYPE.OVERDUE,
        "Task Overdue",
        `Task "${task.title}" (${task.taskCode}) is overdue`,
        "overdue",
        dayStart
      );
    }
  }

  async processDueDateReminders() {
    const now = new Date();
    const intervals = Object.values(REMINDER_INTERVALS);

    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        dueDate: { gt: now },
      },
      include: {
        assignments: { where: { status: { not: "CANCELLED" } } },
      },
    });

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const msUntilDue = task.dueDate.getTime() - now.getTime();
      const minutesUntilDue = msUntilDue / 60_000;

      for (const intervalMinutes of intervals) {
        const window = 2;
        if (minutesUntilDue <= intervalMinutes + window && minutesUntilDue >= intervalMinutes - window) {
          const since = new Date(now.getTime() - intervalMinutes * 60_000);
          await this.notifyTaskUsers(
            task,
            NOTIFICATION_TYPE.TASK_REMINDER,
            "Task due soon",
            `Task "${task.title}" is due in ${this.formatInterval(intervalMinutes)}`,
            "task",
            since
          );
        }
      }
    }
  }

  formatInterval(minutes) {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hour(s)`;
    return `${Math.round(minutes / 1440)} day(s)`;
  }

  async processTaskActivityNotifications() {
    const activities = await prisma.taskActivity.findMany({
      where: { createdAt: { gt: this.lastActivityPoll } },
      orderBy: { createdAt: "asc" },
      include: {
        task: {
          include: {
            assignments: { where: { status: { not: "CANCELLED" } } },
          },
        },
      },
    });

    if (activities.length === 0) return;

    for (const activity of activities) {
      const notifType = ACTIVITY_TO_NOTIFICATION[activity.activityType];
      if (!notifType) continue;

      const task = activity.task;
      const assignees = task.assignments.map((a) => a.assignedToId);
      const userIds = new Set([...assignees, task.createdById]);

      const titles = {
        TASK_ASSIGNED: "Task Assigned",
        TASK_UPDATED: "Task Updated",
        TASK_COMPLETED: "Task Completed",
        EXTENSION_REQUESTED: "Extension Requested",
        EXTENSION_APPROVED: "Extension Approved",
        EXTENSION_REJECTED: "Extension Rejected",
      };

      for (const userId of userIds) {
        if (userId === activity.performedById) continue;
        await NotificationService.createIfNotDuplicate({
          userId,
          title: titles[notifType] || "Task Update",
          message: activity.description,
          type: notifType,
          priority: "MEDIUM",
          referenceType: REFERENCE_TYPE.TASK,
          referenceId: task.id,
        }, "task", activity.createdAt);
      }

      if (activity.activityType === "EXTENSION_REQUESTED") {
        const mainAdmins = await prisma.user.findMany({
          where: {
            companyId: task.companyId,
            deletedAt: null,
            role: { name: "MAIN_ADMIN" },
          },
          select: { id: true },
        });
        for (const admin of mainAdmins) {
          await NotificationService.createIfNotDuplicate({
            userId: admin.id,
            title: "Extension Requested",
            message: activity.description,
            type: NOTIFICATION_TYPE.EXTENSION_REQUESTED,
            priority: "HIGH",
            referenceType: REFERENCE_TYPE.TASK,
            referenceId: task.id,
          }, "task", activity.createdAt);
        }
      }
    }

    this.lastActivityPoll = activities[activities.length - 1].createdAt;
  }
}

export default new ReminderSchedulerService();
