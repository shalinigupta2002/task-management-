import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const taskCount = await prisma.task.count();
  const userCount = await prisma.user.count();
  console.log(`Current counts in database:`);
  console.log(`Tasks: ${taskCount}`);
  console.log(`Users: ${userCount}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
