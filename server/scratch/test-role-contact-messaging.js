/**
 * Role-based Contact hierarchy messaging tests.
 *
 * EMPLOYEE → SUB_ADMIN (same company / department rules)
 * SUB_ADMIN → MAIN_ADMIN (same company)
 * MAIN_ADMIN → SUPER_ADMIN (platform)
 *
 * Run: node server/scratch/test-role-contact-messaging.js
 */
import { PrismaClient } from "@prisma/client";
import ConversationService from "../src/services/ConversationService.js";
import MessageService from "../src/services/MessageService.js";

const prisma = new PrismaClient();

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function assertThrows(fn, segment = "") {
  try {
    await fn();
    throw new Error("Expected throw but succeeded");
  } catch (err) {
    if (err.message === "Expected throw but succeeded") throw err;
    if (segment && !String(err.message).toLowerCase().includes(segment.toLowerCase())) {
      throw new Error(`Expected "${segment}" in "${err.message}"`);
    }
  }
}

async function main() {
  console.log("=== Role Contact Messaging tests ===\n");

  const companyXYZ = await prisma.company.findFirst({
    where: { OR: [{ companyName: { contains: "XYZ" } }, { companyCode: { contains: "XYZ" } }] },
  });
  const companyABC = await prisma.company.findFirst({
    where: {
      OR: [{ companyName: { contains: "ABC" } }, { companyCode: { contains: "ABC" } }],
      ...(companyXYZ ? { id: { not: companyXYZ.id } } : {}),
    },
  });
  assert(companyXYZ, "Need XYZ company");
  assert(companyABC, "Need ABC company");

  const superAdmin = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      role: { name: "SUPER_ADMIN" },
      NOT: [{ email: { endsWith: ".test" } }],
    },
    include: { role: true },
  }) || await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", role: { name: "SUPER_ADMIN" } },
    include: { role: true },
  });
  assert(superAdmin, "Need SUPER_ADMIN");

  const xyzMain = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", companyId: companyXYZ.id, role: { name: "MAIN_ADMIN" } },
    include: { role: true, company: true },
  });
  const abcMain = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", companyId: companyABC.id, role: { name: "MAIN_ADMIN" } },
    include: { role: true, company: true },
  });
  assert(xyzMain, "Need XYZ MAIN_ADMIN");
  assert(abcMain, "Need ABC MAIN_ADMIN");

  const xyzSub = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", companyId: companyXYZ.id, role: { name: "SUB_ADMIN" } },
    include: { role: true, department: true },
  });
  const abcSub = await prisma.user.findFirst({
    where: { deletedAt: null, status: "ACTIVE", companyId: companyABC.id, role: { name: "SUB_ADMIN" } },
    include: { role: true },
  });
  assert(xyzSub, "Need XYZ SUB_ADMIN");
  assert(abcSub, "Need ABC SUB_ADMIN");

  let xyzEmp = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      companyId: companyXYZ.id,
      role: { name: "EMPLOYEE" },
      ...(xyzSub.departmentId ? { departmentId: xyzSub.departmentId } : {}),
    },
    include: { role: true, department: true },
  });
  if (!xyzEmp) {
    xyzEmp = await prisma.user.findFirst({
      where: { deletedAt: null, status: "ACTIVE", companyId: companyXYZ.id, role: { name: "EMPLOYEE" } },
      include: { role: true, department: true },
    });
  }
  assert(xyzEmp, "Need XYZ EMPLOYEE");

  const stamp = Date.now();
  const msgText = `Hello, I need assistance. ${stamp}`;

  // 1) Employee discovers eligible Sub Admins
  const empContacts = await ConversationService.getEligibleContacts(xyzEmp.id);
  assert(empContacts.targetRole === "SUB_ADMIN", "Employee target is SUB_ADMIN");
  assert(empContacts.actionLabel === "Contact Sub Admin", "Employee action label");
  assert(empContacts.contacts.every((c) => c.role?.name === "SUB_ADMIN"), "Only Sub Admins");
  assert(empContacts.contacts.every((c) => c.companyId === companyXYZ.id), "Same company only");
  assert(!empContacts.contacts.some((c) => c.id === abcSub.id), "No ABC Sub Admin");
  assert(!empContacts.contacts.some((c) => c.role?.name === "SUPER_ADMIN"), "No Super Admin");
  assert(empContacts.contacts.some((c) => c.id === xyzSub.id) || empContacts.contacts.length >= 1, "Has eligible Sub Admin");
  console.log(`1. OK Employee eligible Sub Admins (${empContacts.contacts.length})`);

  const targetSub = empContacts.contacts.find((c) => c.id === xyzSub.id) || empContacts.contacts[0];
  assert(targetSub, "Need at least one eligible Sub Admin for employee");

  // 2) Employee create/open conversation with Sub Admin
  const empConv1 = await ConversationService.create({ otherUserId: targetSub.id }, xyzEmp.id);
  assert(empConv1?.id, "Conversation created");
  assert(empConv1.participants.some((p) => p.userId === xyzEmp.id), "Employee participant");
  assert(empConv1.participants.some((p) => p.userId === targetSub.id), "Sub Admin participant");
  console.log("2. OK Employee ↔ Sub Admin conversation");

  // 3) Employee cannot contact another company Sub Admin
  await assertThrows(
    () => ConversationService.create({ otherUserId: abcSub.id }, xyzEmp.id),
    "company"
  );
  console.log("3. OK Employee blocked from other company Sub Admin");

  // 4) Sub Admin discovers Main Admin
  const subContacts = await ConversationService.getEligibleContacts(xyzSub.id);
  assert(subContacts.targetRole === "MAIN_ADMIN", "Sub Admin target MAIN_ADMIN");
  assert(subContacts.contacts.every((c) => c.role?.name === "MAIN_ADMIN"), "Only Main Admins");
  assert(subContacts.contacts.every((c) => c.companyId === companyXYZ.id), "Same company");
  assert(subContacts.contacts.some((c) => c.id === xyzMain.id), "Includes XYZ Main Admin");
  assert(!subContacts.contacts.some((c) => c.id === abcMain.id), "No ABC Main Admin");
  console.log(`4. OK Sub Admin eligible Main Admins (${subContacts.contacts.length})`);

  // 5) Sub Admin create/open with Main Admin
  const subConv = await ConversationService.create({ otherUserId: xyzMain.id }, xyzSub.id);
  assert(subConv?.id, "Sub ↔ Main conversation");
  console.log("5. OK Sub Admin ↔ Main Admin conversation");

  // 6) Sub Admin cannot contact other company Main Admin
  await assertThrows(
    () => ConversationService.create({ otherUserId: abcMain.id }, xyzSub.id),
    "company"
  );
  console.log("6. OK Sub Admin blocked from other company Main Admin");

  // 7) Main Admin discovers Super Admin
  const maContacts = await ConversationService.getEligibleContacts(xyzMain.id);
  assert(maContacts.targetRole === "SUPER_ADMIN", "Main Admin target SUPER_ADMIN");
  assert(maContacts.contacts.every((c) => c.role?.name === "SUPER_ADMIN"), "Only Super Admins");
  assert(maContacts.contacts.some((c) => c.id === superAdmin.id), "Includes real Super Admin");
  console.log(`7. OK Main Admin eligible Super Admins (${maContacts.contacts.length})`);

  // 8) Main Admin create/open with Super Admin
  const maConv = await ConversationService.create({ otherUserId: superAdmin.id }, xyzMain.id);
  assert(maConv?.id, "Main ↔ Super conversation");
  assert(maConv.participants.some((p) => p.userId === superAdmin.id), "Super Admin participant");
  console.log("8. OK Main Admin ↔ Super Admin conversation");

  // 9) Unauthorized bypass attempts — strict hierarchy
  await assertThrows(
    () => ConversationService.create({ otherUserId: superAdmin.id }, xyzEmp.id),
    "only initiate"
  );
  await assertThrows(
    () => ConversationService.create({ otherUserId: xyzMain.id }, xyzEmp.id),
    "only initiate"
  );
  await assertThrows(
    () => ConversationService.create({ otherUserId: superAdmin.id }, xyzSub.id),
    "only initiate"
  );
  await assertThrows(
    () => ConversationService.create({ otherUserId: xyzEmp.id }, xyzSub.id),
    "only initiate"
  );
  await assertThrows(
    () => ConversationService.create({ otherUserId: xyzSub.id }, xyzMain.id),
    "only initiate"
  );
  await assertThrows(
    () => ConversationService.create({ otherUserId: xyzEmp.id }, xyzMain.id),
    "only initiate"
  );

  // Employee cannot request Admin/SA via eligible contacts API
  await assertThrows(
    () => ConversationService.getEligibleContacts(xyzEmp.id, { targetRole: "MAIN_ADMIN" }),
    "only contact"
  );
  await assertThrows(
    () => ConversationService.getEligibleContacts(xyzEmp.id, { targetRole: "SUPER_ADMIN" }),
    "only contact"
  );
  console.log("9. OK unauthorized initiate paths blocked (403)");

  // 10) Repeated contact does not duplicate conversations
  const empConv2 = await ConversationService.create({ otherUserId: targetSub.id }, xyzEmp.id);
  assert(empConv2.id === empConv1.id, "Same conversation reused");
  const maConv2 = await ConversationService.create({ otherUserId: superAdmin.id }, xyzMain.id);
  assert(maConv2.id === maConv.id, "Main↔SA conversation reused");
  console.log("10. OK no duplicate conversations");

  // 11) First message persists
  await MessageService.send(
    { conversationId: empConv1.id, message: msgText },
    xyzEmp.id
  );
  const dbMsg = await prisma.message.findFirst({
    where: { conversationId: empConv1.id, message: msgText, deletedAt: null },
  });
  assert(dbMsg, "Message row in DB");
  assert(dbMsg.senderId === xyzEmp.id, "Sender is employee");
  console.log("11. OK first message persisted");

  // 12) Recipient sees the message
  const subList = await ConversationService.getAll(targetSub.id, { limit: 100 });
  assert(subList.items.some((c) => c.id === empConv1.id), "Sub Admin sees conversation");
  const subMsgs = await MessageService.getAll(targetSub.id, { conversationId: empConv1.id, limit: 50 });
  assert((subMsgs.items || []).some((m) => m.message === msgText), "Sub Admin sees message body");
  console.log("12. OK recipient sees message");

  // 13) Unread count updates
  const unread = await MessageService.getUnreadCount(targetSub.id);
  assert(typeof unread.unreadCount === "number", "Unread is number");
  assert(unread.unreadCount >= 1, "Unread count >= 1 after new message");
  console.log(`13. OK unread count=${unread.unreadCount}`);

  // 14) Refresh preserves conversation
  const again = await ConversationService.getById(empConv1.id, xyzEmp.id);
  assert(again.id === empConv1.id, "Conversation still exists after reload");
  console.log("14. OK conversation preserved");

  // 15) Names are from DB (no hardcoded contact list)
  assert(targetSub.firstName || targetSub.email, "Contact has real DB identity");
  assert(maContacts.contacts[0].firstName || maContacts.contacts[0].email, "SA contact from DB");
  console.log("15. OK contacts are real DB users (no hardcoded names)");

  console.log("\n=== All role-contact messaging tests passed ===");
}

main()
  .catch((err) => {
    console.error("\nFAILED:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
