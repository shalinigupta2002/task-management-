import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOTIFICATION_TYPES = [
  "TASK_ASSIGNED", "TASK_UPDATED", "TASK_COMPLETED", "TASK_REMINDER",
  "DUE_TODAY", "OVERDUE", "EXTENSION_REQUESTED", "NEW_MESSAGE", "SYSTEM",
];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const MESSAGE_SAMPLES = [
  "Please review the latest task update.",
  "Can we schedule a quick sync?",
  "I've completed the assigned items.",
  "Need clarification on the deadline.",
  "Sharing the updated document.",
  "Thanks for the quick response!",
  "Following up on yesterday's discussion.",
  "The report is ready for review.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack = 30) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

async function getAllowedPairs(users) {
  const byRole = {};
  for (const u of users) {
    const role = u.role.name;
    if (!byRole[role]) byRole[role] = [];
    byRole[role].push(u);
  }

  const pairs = [];
  const addPairs = (roleA, roleB) => {
    for (const a of byRole[roleA] || []) {
      for (const b of byRole[roleB] || []) {
        if (a.id !== b.id && (a.companyId === b.companyId || roleA === "SUPER_ADMIN" || roleB === "SUPER_ADMIN")) {
          pairs.push([a, b]);
        }
      }
    }
  };

  addPairs("SUPER_ADMIN", "MAIN_ADMIN");
  addPairs("MAIN_ADMIN", "SUB_ADMIN");
  addPairs("MAIN_ADMIN", "EMPLOYEE");
  addPairs("SUB_ADMIN", "EMPLOYEE");

  return pairs;
}

async function main() {
  console.log("Seeding Chat & Notification data...\n");

  const users = await prisma.user.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    include: { role: true },
  });

  if (users.length < 4) {
    throw new Error("Not enough users. Run `npm run db:seed` first.");
  }

  await prisma.onlineUser.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();

  const pairs = await getAllowedPairs(users);
  if (pairs.length === 0) throw new Error("No valid chat pairs found.");

  const conversations = [];
  const usedPairs = new Set();

  for (let i = 0; i < 20 && i < pairs.length; i++) {
    let pair = pairs[i % pairs.length];
    let key = [pair[0].id, pair[1].id].sort().join(":");
    let attempts = 0;
    while (usedPairs.has(key) && attempts < pairs.length) {
      pair = pairs[(i + attempts) % pairs.length];
      key = [pair[0].id, pair[1].id].sort().join(":");
      attempts++;
    }
    usedPairs.add(key);

    const [userA, userB] = pair;
    const companyId = userA.companyId || userB.companyId;
    if (!companyId) continue;

    const conversation = await prisma.conversation.create({
      data: {
        companyId,
        conversationType: "DIRECT",
        participants: {
          create: [{ userId: userA.id }, { userId: userB.id }],
        },
      },
    });
    conversations.push({ conversation, userA, userB });
  }
  console.log(`Created ${conversations.length} conversations`);

  let messageCount = 0;
  for (const { conversation, userA, userB } of conversations) {
    const msgPerConvo = Math.floor(500 / conversations.length) + 1;
    for (let m = 0; m < msgPerConvo && messageCount < 500; m++) {
      const sender = m % 2 === 0 ? userA : userB;
      const receiver = sender.id === userA.id ? userB : userA;
      messageCount++;
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: sender.id,
          receiverId: receiver.id,
          message: `${pick(MESSAGE_SAMPLES)} (#${messageCount})`,
          messageType: "TEXT",
          isRead: Math.random() > 0.4,
          readAt: Math.random() > 0.4 ? randomDate(5) : null,
          createdAt: randomDate(20),
        },
      });
    }
  }
  console.log(`Created ${messageCount} messages`);

  const allUsers = users.filter((u) => u.role.name !== "SUPER_ADMIN" || u.companyId);
  for (const user of allUsers) {
    await prisma.notificationPreference.create({
      data: {
        userId: user.id,
        taskReminder: true,
        overdueReminder: true,
        messageNotification: true,
        systemNotification: true,
        emailNotification: false,
        inAppNotification: true,
      },
    });
  }
  console.log(`Created ${allUsers.length} notification preferences`);

  const tasks = await prisma.task.findMany({ take: 50, where: { deletedAt: null } });

  for (let i = 0; i < 300; i++) {
    const user = pick(allUsers.length ? allUsers : users);
    const task = tasks.length ? pick(tasks) : null;
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: pick(["Task Update", "Reminder", "New Message", "System Alert"]),
        message: `Sample notification #${i + 1} for testing the notification module.`,
        type: pick(NOTIFICATION_TYPES),
        priority: pick(PRIORITIES),
        referenceType: task ? "TASK" : "SYSTEM",
        referenceId: task?.id ?? null,
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? randomDate(10) : null,
        createdAt: randomDate(30),
      },
    });
  }
  console.log("Created 300 notifications");

  console.log("\nChat & Notification seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
