import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const task = await prisma.task.findUnique({
    where: { id: "d57f3b48-2f26-4a24-a4d3-b92bf3d1f23c" } // use a valid UUID from seed
  });
  console.log("Found task by UUID:", task ? task.title : "Not Found");

  try {
    const badTask = await prisma.task.findUnique({
      where: { id: "1" }
    });
    console.log("Found task by '1':", badTask);
  } catch (err) {
    console.error("Querying by '1' failed:", err.message);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
