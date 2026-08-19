import prisma from "../src/config/database.js";
import TaskCategoryRepository from "../src/repositories/TaskCategoryRepository.js";

async function run() {
  try {
    console.log("Querying prisma.taskCategory...");
    const direct = await prisma.taskCategory.findMany();
    console.log("Direct query result count:", direct.length);

    console.log("Querying TaskCategoryRepository.findAll()...");
    const repo = await TaskCategoryRepository.findAll({});
    console.log("Repository query result count:", repo.items.length);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

run().then(() => process.exit(0));
