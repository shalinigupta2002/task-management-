import dotenv from "dotenv";
import prisma from "../src/config/database.js";

dotenv.config();

async function main() {
  console.log("=== DUMPING ALL CONVERSATIONS AND PARTICIPANTS ===");

  const conversations = await prisma.conversation.findMany({
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: { select: { name: true } } }
          }
        }
      },
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  console.log(`Found ${conversations.length} conversations total.`);

  conversations.forEach((c, idx) => {
    console.log(`\n--- Conversation #${idx + 1} (id: ${c.id}) ---`);
    console.log("Type:", c.conversationType);
    console.log("Company ID:", c.companyId);
    console.log("Participants:");
    c.participants.forEach(p => {
      const u = p.user;
      console.log(`  - User: ${u.firstName} ${u.lastName} (${u.email}) [Role: ${u.role?.name || "None"}] (id: ${u.id})`);
    });
    console.log("Messages:");
    if (c.messages.length === 0) {
      console.log("  (None)");
    } else {
      c.messages.forEach(m => {
        console.log(`  [${m.createdAt.toISOString()}] Sender: ${m.senderId} - "${m.message}"`);
      });
    }
  });
}

main().catch(console.error);
