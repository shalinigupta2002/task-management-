import dotenv from "dotenv";
import prisma from "../src/config/database.js";
import ConversationService from "../src/services/ConversationService.js";
import UserService from "../src/services/UserService.js";

dotenv.config();

async function main() {
  console.log("=== RUNNING SUPER ADMIN MESSAGES DEBUG ===");

  const superAdmin = await prisma.user.findUnique({
    where: { email: "superadmin@system.test" },
    include: { role: true }
  });

  if (!superAdmin) {
    console.error("Super Admin user not found. Please seed the DB.");
    return;
  }

  console.log(`Found Super Admin: id="${superAdmin.id}"`);

  // Let's call ConversationService.getAll
  try {
    const result = await ConversationService.getAll(superAdmin.id, { limit: 100 });
    console.log("Conversation list count:", result.items.length);
    console.log("Items:", JSON.stringify(result.items, null, 2));
  } catch (err) {
    console.error("Error in ConversationService.getAll:", err);
  }
}

main().catch(console.error);
