import AuthService from "../src/services/AuthService.js";
import ConversationService from "../src/services/ConversationService.js";
import prisma from "../src/config/database.js";

async function main() {
  const ma = await AuthService.login("admin@xyz.test", "DevTest@2026!");
  const contacts = await ConversationService.getEligibleContacts(ma.user.id);
  console.log(
    "Eligible SA contacts:",
    contacts.contacts.map((c) => ({ id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` }))
  );

  for (const email of ["superadmin@taskflow.com", "superadmin@system.test"]) {
    try {
      const pwd = email.includes("system") ? "DevTest@2026!" : "Admin@123456";
      const sa = await AuthService.login(email, pwd);
      const list = await ConversationService.getAll(sa.user.id, { limit: 50 });
      console.log(email, "inbox", list.items.length, list.items.map((c) => c.id.slice(0, 8)));
    } catch (e) {
      console.log(email, "FAIL", e.message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
