import { PrismaClient } from "@prisma/client";
import TaskService from "../src/services/TaskService.js";
const prisma = new PrismaClient();

async function main() {
  const task = await prisma.task.findFirst({ where: { deletedAt: null } });
  if (!task) {
    console.log("No tasks found to update!");
    process.exit(1);
  }
  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      role: { name: "MAIN_ADMIN" },
      companyId: task.companyId
    },
    include: { role: true }
  });
  if (!user) {
    console.log("No Main Admin user found for company " + task.companyId);
    process.exit(1);
  }
  console.log(`Trying to update task ${task.id} (${task.title}) using user ${user.id} (${user.email})`);
  
  try {
    const updated = await TaskService.update(task.id, {
      title: "Updated Title Test",
      description: "Updated description test",
      priority: "HIGH"
    }, user.id);
    console.log("Update SUCCESS:", updated.title);
  } catch (err) {
    console.error("Update FAILED:", err);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
