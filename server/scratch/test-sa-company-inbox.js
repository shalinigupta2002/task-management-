/**
 * Main Admin ↔ Super Admin messaging + Super Admin Company Inbox.
 * Run: node server/scratch/test-sa-company-inbox.js
 */
import AuthService from "../src/services/AuthService.js";
import ConversationService from "../src/services/ConversationService.js";
import MessageService from "../src/services/MessageService.js";
import prisma from "../src/config/database.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log("=== SA Company Inbox + MA↔SA messaging ===\n");

  const ma = await AuthService.login("admin@xyz.test", "DevTest@2026!");
  const saPrimary = await AuthService.login("superadmin@taskflow.com", "Admin@123456");
  let saSecondary = null;
  try {
    saSecondary = await AuthService.login("superadmin@system.test", "DevTest@2026!");
  } catch {
    console.log("(no secondary SA — skipping dual-SA checks)");
  }

  const stamp = Date.now();
  const msg = `inbox-fix ${stamp}`;

  // 1) Eligible contacts prefer non-.test SA
  const eligible = await ConversationService.getEligibleContacts(ma.user.id);
  assert(eligible.contacts.length >= 1, "Need eligible Super Admin");
  assert(
    !eligible.contacts.some((c) => String(c.email).endsWith(".test")),
    "Eligible SA list should exclude *.test accounts when primary exists"
  );
  console.log("1. OK eligible Super Admin contacts", eligible.contacts.map((c) => c.email));

  // 2) MA creates/opens conversation + message with primary SA
  const conv = await ConversationService.create(
    { otherUserId: eligible.contacts[0].id, initialMessage: msg },
    ma.user.id
  );
  assert(conv?.id, "Conversation created");
  assert(conv.companyId === ma.user.companyId, "Conversation company scoped to Main Admin company");
  console.log("2. OK conversation", conv.id, "company", conv.companyId);

  // 3) Primary SA Company Inbox sees it
  const primaryInbox = await ConversationService.getAll(saPrimary.user.id, { limit: 100 });
  assert(primaryInbox.items.some((c) => c.id === conv.id), "Primary SA must see conversation");
  console.log("3. OK primary SA inbox count", primaryInbox.items.length);

  // 4) Secondary SA (if any) also sees Company Inbox thread
  if (saSecondary) {
    const secondaryInbox = await ConversationService.getAll(saSecondary.user.id, { limit: 100 });
    assert(
      secondaryInbox.items.some((c) => c.id === conv.id),
      "Secondary SA must see platform Company Inbox conversation"
    );
    console.log("4. OK secondary SA sees same Company Inbox thread");

    // 5) Secondary SA can open messages (auto-join) and reply
    const msgs = await MessageService.getAll(saSecondary.user.id, {
      conversationId: conv.id,
      limit: 50,
    });
    assert((msgs.items || []).some((m) => m.message === msg), "Secondary SA reads MA message");

    const replyText = `SA reply ${stamp}`;
    await MessageService.send(
      { conversationId: conv.id, message: replyText },
      saSecondary.user.id
    );

    const maMsgs = await MessageService.getAll(ma.user.id, {
      conversationId: conv.id,
      limit: 50,
    });
    assert((maMsgs.items || []).some((m) => m.message === replyText), "Main Admin sees SA reply");
    console.log("5. OK secondary SA reply visible to Main Admin");
  } else {
    const replyText = `SA reply ${stamp}`;
    await MessageService.send(
      { conversationId: conv.id, message: replyText },
      saPrimary.user.id
    );
    const maMsgs = await MessageService.getAll(ma.user.id, {
      conversationId: conv.id,
      limit: 50,
    });
    assert((maMsgs.items || []).some((m) => m.message === replyText), "Main Admin sees SA reply");
    console.log("4-5. OK primary SA reply visible to Main Admin");
  }

  // 6) No duplicate on repeat contact
  const again = await ConversationService.create(
    { otherUserId: eligible.contacts[0].id },
    ma.user.id
  );
  assert(again.id === conv.id, "Contact must reuse conversation");
  console.log("6. OK no duplicate conversation");

  // 7) mark-read works via service
  await MessageService.markRead({ conversationId: conv.id }, saPrimary.user.id);
  console.log("7. OK mark-read");

  console.log("\n=== ALL SA Company Inbox checks passed ===");
}

main()
  .catch((e) => {
    console.error("\nFAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
