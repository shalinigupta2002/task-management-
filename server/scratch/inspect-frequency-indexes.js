import prisma from "../src/config/database.js";

const indexes = await prisma.$queryRawUnsafe(`
  SELECT indexname, indexdef FROM pg_indexes
  WHERE tablename = 'task_frequencies'
`);
console.log("indexes:", indexes);

const constraints = await prisma.$queryRawUnsafe(`
  SELECT conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'task_frequencies'::regclass
`);
console.log("constraints:", constraints);

await prisma.$disconnect();
