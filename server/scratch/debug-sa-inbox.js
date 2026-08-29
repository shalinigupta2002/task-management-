import AuthService from "../src/services/AuthService.js";
import ConversationService from "../src/services/ConversationService.js";
import MessageService from "../src/services/MessageService.js";
import prisma from "../src/config/database.js";

async function main() {
  const sa = await AuthService.login("superadmin@taskflow.com", "Admin@123456");
  let ma;
  try {
    ma = await AuthService.login("admin@xyz.test", "DevTest@2026!");
  } catch {
    ma = await AuthService.login("rajesh.kumar@techsolutions.com", "Admin@123456");
  }
  console.log("SA", sa.user.id, sa.user.role.name);
  console.log("MA", ma.user.id, ma.user.role.name, ma.user.companyId);

  const conv = await ConversationService.create(
    { otherUserId: sa.user.id, initialMessage: `hi from MA debug ${Date.now()}` },
    ma.user.id
  );
  console.log("CONV", conv.id, "company", conv.companyId);
  console.log(
    "parts",
    conv.participants?.map((p) => ({ userId: p.userId, role: p.user?.role?.name }))
  );

  const saList = await ConversationService.getAll(sa.user.id, { limit: 50 });
  console.log(
    "SA list",
    saList.items.length,
    "hasConv",
    saList.items.some((c) => c.id === conv.id)
  );

  const saListFiltered = await ConversationService.getAll(sa.user.id, {
    limit: 50,
    companyId: ma.user.companyId,
  });
  console.log(
    "SA list filtered by MA company",
    saListFiltered.items.length,
    "hasConv",
    saListFiltered.items.some((c) => c.id === conv.id)
  );

  const msgs = await MessageService.getAll(sa.user.id, { conversationId: conv.id, limit: 20 });
  console.log("SA msgs", msgs.items?.length, msgs.items?.[0]?.message);

  // How many SA users?
  const superAdmins = await prisma.user.findMany({
    where: { deletedAt: null, role: { name: "SUPER_ADMIN" } },
    select: { id: true, email: true, status: true },
  });
  console.log("All SUPER_ADMIN users:", superAdmins);

  // Recent MA↔SA conversations
  const recent = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: sa.user.id } },
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
    include: {
      participants: { include: { user: { select: { email: true, role: { select: { name: true } } } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  console.log(
    "Recent SA conversations:",
    recent.map((c) => ({
      id: c.id,
      companyId: c.companyId,
      parts: c.participants.map((p) => `${p.user.email}:${p.user.role.name}`),
      last: c.messages[0]?.message,
    }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
