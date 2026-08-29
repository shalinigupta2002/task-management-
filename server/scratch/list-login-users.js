import prisma from "./src/config/database.js";

const users = await prisma.user.findMany({
  where: { deletedAt: null, status: "ACTIVE" },
  take: 20,
  select: {
    email: true,
    firstName: true,
    lastName: true,
    role: { select: { name: true } },
    company: { select: { companyName: true } },
  },
  orderBy: { email: "asc" },
});

for (const u of users) {
  console.log(`${u.role.name.padEnd(12)} ${u.email.padEnd(40)} ${(u.company?.companyName || "-").slice(0, 30)}`);
}

await prisma.$disconnect();
