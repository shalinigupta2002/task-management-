import prisma from "../src/config/database.js";
import TaskFrequencyRepository from "../src/repositories/TaskFrequencyRepository.js";

async function run() {
  try {
    console.log("Querying prisma.taskFrequency...");
    const direct = await prisma.taskFrequency.findMany();
    console.log("Direct query result count:", direct.length);

    console.log("Querying TaskFrequencyRepository.findAll()...");
    const repo = await TaskFrequencyRepository.findAll({});
    console.log("Repository query result count:", repo.items.length);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

run().then(() => process.exit(0));
