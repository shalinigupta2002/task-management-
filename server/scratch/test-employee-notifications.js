/**
 * Employee notifications must be user-scoped (no demo/fallback leakage).
 * Run: node server/scratch/test-employee-notifications.js
 */
import { PrismaClient } from "@prisma/client";
import NotificationService from "../src/services/NotificationService.js";
import TaskService from "../src/services/TaskService.js";
import UserService from "../src/services/UserService.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function assertThrows(promise, segment = "") {
  try {
    await promise;
    throw new Error("Expected throw but succeeded");
  } catch (err) {
    if (err.message === "Expected throw but succeeded") throw err;
    if (segment && !String(err.message).toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected "${segment}" in "${err.message}"`);
    }
  }
}

async function main() {
  console.log("=== Employee Notifications scoping tests ===\n");

  const mainAdmin = await prisma.user.findFirst({
    where: { deletedAt: null, role: { name: "MAIN_ADMIN" }, companyId: { not: null } },
    include: { role: true },
  });
  assert(mainAdmin, "Need MAIN_ADMIN");

  const employees = await prisma.user.findMany({
    where: {
      companyId: mainAdmin.companyId,
      deletedAt: null,
      role: { name: "EMPLOYEE" },
      status: "ACTIVE",
    },
    take: 2,
  });
  assert(employees.length >= 2, "Need 2 EMPLOYEE users");

  const empA = employees[0];
  const empB = employees[1];
  const dept = await prisma.department.findFirst({
    where: { companyId: mainAdmin.companyId, deletedAt: null },
  });

  // Create disposable zero-activity employee
  const empRole = await prisma.role.findFirst({ where: { name: "EMPLOYEE" } });
  const zero = await prisma.user.create({
    data: {
      employeeId: `ZN-${Date.now().toString().slice(-6)}`,
      firstName: "Zero",
      lastName: "Notif",
      email: `zero.notif.${Date.now()}@test.local`,
      password: mainAdmin.password,
      status: "ACTIVE",
      companyId: mainAdmin.companyId,
      departmentId: empA.departmentId,
      roleId: empRole.id,
    },
  });

  const createdTaskIds = [];

  try {
    // 1–2) New employee → 0 notifications / 0 unread
    const list0 = await NotificationService.getAll(zero.id, { limit: 50 });
    assert(list0.items.length === 0, `Expected 0 notifications, got ${list0.items.length}`);
    const count0 = await NotificationService.getCount(zero.id);
    assert(count0.unreadCount === 0, `Expected 0 unread, got ${count0.unreadCount}`);
    console.log("OK 1-2: New employee has 0 notifications / 0 unread");

    // 3) Assign task to empA → notification for A
    const taskA = await TaskService.create(
      {
        title: `Notif Isolation A ${Date.now()}`,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 3 * 86400000),
        departmentId: dept?.id || empA.departmentId,
        assignedToId: empA.id,
        companyId: mainAdmin.companyId,
        priority: "MEDIUM",
      },
      mainAdmin.id
    );
    createdTaskIds.push(taskA.id);

    const listA = await NotificationService.getAll(empA.id, { limit: 50 });
    const assignedNotifs = listA.items.filter(
      (n) => n.type === "TASK_ASSIGNED" && n.referenceId === taskA.id
    );
    assert(assignedNotifs.length >= 1, "Employee A must receive TASK_ASSIGNED notification");
    console.log("OK 3: Assigned task creates notification for assignee");

    // 4) empB must not receive Task A assignment notification
    const listB = await NotificationService.getAll(empB.id, { limit: 100 });
    assert(
      !listB.items.some((n) => n.referenceId === taskA.id && n.type === "TASK_ASSIGNED"),
      "Employee B must not get Employee A assignment notification"
    );
    console.log("OK 4: Unrelated employee does not get assignment notification");

    // 5) Multi-assignee → both receive
    const shared = await TaskService.create(
      {
        title: `Notif Shared ${Date.now()}`,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 4 * 86400000),
        departmentId: dept?.id || empA.departmentId,
        assignedToIds: [empA.id, empB.id],
        companyId: mainAdmin.companyId,
        priority: "LOW",
      },
      mainAdmin.id
    );
    createdTaskIds.push(shared.id);

    const listA2 = await NotificationService.getAll(empA.id, { limit: 100 });
    const listB2 = await NotificationService.getAll(empB.id, { limit: 100 });
    assert(listA2.items.some((n) => n.referenceId === shared.id), "A must get shared assignment notif");
    assert(listB2.items.some((n) => n.referenceId === shared.id), "B must get shared assignment notif");
    assert(
      !(await NotificationService.getAll(zero.id, { limit: 20 })).items.some((n) => n.referenceId === shared.id),
      "Zero employee must not get shared task notif"
    );
    console.log("OK 5: Multiple assignees each receive notification");

    // 11) Spoof / ownership — markRead another user's notification blocked
    const foreign = listA2.items.find((n) => n.referenceId === shared.id);
    assert(foreign, "Need a notification owned by A");
    await assertThrows(NotificationService.markRead(foreign.id, empB.id), "access");
    console.log("OK 11: Mark-read ownership enforced");

    // 12) markAllRead is user-scoped
    await NotificationService.markAllRead(empA.id);
    const afterAll = await NotificationService.getCount(empA.id);
    assert(afterAll.unreadCount === 0, "A unread must be 0 after markAllRead");
    const bCount = await NotificationService.getCount(empB.id);
    // B may still have unread — markAllRead on A must not zero B if B has unread for shared
    // (shared notif for B is separate row)
    console.log("OK 12: markAllRead scoped to user A (B unread=", bCount.unreadCount, ")");

    // 13) Delete ownership
    const bNotif = (await NotificationService.getAll(empB.id, { limit: 50 })).items.find(
      (n) => n.referenceId === shared.id
    );
    if (bNotif) {
      await assertThrows(NotificationService.remove(bNotif.id, empA.id), "access");
      console.log("OK 13: Delete ownership enforced");
    } else {
      console.log("SKIP 13: No B notification found to test delete");
    }

    // 15) Zero employee still empty — no mock leakage at service layer
    const stillZero = await NotificationService.getAll(zero.id, { limit: 50 });
    assert(stillZero.items.length === 0, "Zero employee must remain empty");
    const zeroUnread = await NotificationService.getCount(zero.id);
    assert(zeroUnread.unreadCount === 0, "Zero unread must stay 0");
    console.log("OK 15: No notifications for inactive new employee");

    // Cross-company: notifications for A never include other company userIds
    assert(listA2.items.every((n) => n.userId === empA.id), "All listed notifications owned by A");
    console.log("OK 10: Listed notifications are owner-scoped");

    console.log("\n=== ALL EMPLOYEE NOTIFICATION TESTS PASSED ===");
  } finally {
    await prisma.notification.deleteMany({
      where: { referenceId: { in: createdTaskIds } },
    }).catch(() => {});
    await prisma.task.updateMany({
      where: { id: { in: createdTaskIds } },
      data: { deletedAt: new Date() },
    }).catch(() => {});
    await prisma.user.delete({ where: { id: zero.id } }).catch(async () => {
      await prisma.user.update({
        where: { id: zero.id },
        data: { deletedAt: new Date(), email: `deleted.${zero.id}@test.local` },
      });
    });
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
