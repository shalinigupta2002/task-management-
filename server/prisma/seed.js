import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;
const DEFAULT_PASSWORD = "Admin@123456";

async function hash(pw) {
  return bcrypt.hash(pw, SALT_ROUNDS);
}

const PERMISSIONS = [
  { name: "company.read", description: "View companies", module: "company" },
  { name: "company.write", description: "Manage companies", module: "company" },
  { name: "department.read", description: "View departments", module: "department" },
  { name: "department.write", description: "Manage departments", module: "department" },
  { name: "user.read", description: "View users", module: "user" },
  { name: "user.write", description: "Manage users", module: "user" },
  { name: "role.read", description: "View roles", module: "role" },
  { name: "role.write", description: "Manage roles", module: "role" },
  { name: "subscription.read", description: "View subscriptions", module: "subscription" },
  { name: "subscription.write", description: "Manage subscriptions", module: "subscription" },
];

const ROLES = [
  {
    name: "SUPER_ADMIN",
    description: "Platform super administrator with full access",
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: "MAIN_ADMIN",
    description: "Company main administrator",
    permissions: [
      "department.read", "department.write",
      "user.read", "user.write",
      "role.read",
      "subscription.read",
    ],
  },
  {
    name: "SUB_ADMIN",
    description: "Department sub administrator",
    permissions: ["department.read", "user.read", "user.write"],
  },
  {
    name: "EMPLOYEE",
    description: "Standard employee user",
    permissions: ["department.read", "user.read"],
  },
];

async function main() {
  console.log("Seeding TaskFlow database...\n");

  // Clean existing data (order matters for FK constraints)
  await prisma.rolePermission.deleteMany();
  await prisma.companySubscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();

  // Permissions
  const permissionRecords = {};
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.create({ data: perm });
    permissionRecords[perm.name] = p;
  }
  console.log(`Created ${PERMISSIONS.length} permissions`);

  // Roles + role permissions
  const roleRecords = {};
  for (const roleDef of ROLES) {
    const role = await prisma.role.create({
      data: {
        name: roleDef.name,
        description: roleDef.description,
        status: "ACTIVE",
      },
    });
    roleRecords[roleDef.name] = role;

    for (const permName of roleDef.permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permissionRecords[permName].id,
        },
      });
    }
  }
  console.log(`Created ${ROLES.length} roles with permissions`);

  // Subscription Plans (2 as requested)
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      planName: "Starter",
      description: "For small teams getting started with task management",
      monthlyPrice: 29.0,
      yearlyPrice: 290.0,
      duration: "MONTHLY",
      maxEmployees: 10,
      maxDepartments: 3,
      maxActiveTasks: 100,
      features: ["Task Management", "Basic Reports", "Email Support"],
      status: "ACTIVE",
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.create({
    data: {
      planName: "Professional",
      description: "For growing organizations with advanced needs",
      monthlyPrice: 79.0,
      yearlyPrice: 790.0,
      duration: "MONTHLY",
      maxEmployees: 50,
      maxDepartments: 10,
      maxActiveTasks: 500,
      features: ["Everything in Starter", "Approvals", "Calendar", "Priority Support"],
      status: "ACTIVE",
    },
  });
  console.log("Created 2 subscription plans (Starter, Professional)");

  // Companies (2)
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        companyName: "TechSolutions Pvt Ltd",
        companyCode: "TECH-001",
        email: "admin@techsolutions.com",
        phone: "+91 98765 43210",
        website: "https://techsolutions.com",
        address: "42 MG Road",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        postalCode: "560001",
        industry: "Technology",
        status: "ACTIVE",
      },
    }),
    prisma.company.create({
      data: {
        companyName: "GreenLeaf Corp",
        companyCode: "GREEN-002",
        email: "admin@greenleaf.com",
        phone: "+91 87654 32109",
        website: "https://greenleaf.com",
        address: "15 Park Street",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400001",
        industry: "Manufacturing",
        status: "ACTIVE",
      },
    }),
  ]);
  console.log("Created 2 companies");

  // Company subscriptions
  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  await prisma.companySubscription.create({
    data: {
      companyId: companies[0].id,
      subscriptionPlanId: professionalPlan.id,
      startDate: now,
      expiryDate: oneYearLater,
      subscriptionStatus: "ACTIVE",
    },
  });
  await prisma.companySubscription.create({
    data: {
      companyId: companies[1].id,
      subscriptionPlanId: starterPlan.id,
      startDate: now,
      expiryDate: oneYearLater,
      subscriptionStatus: "ACTIVE",
    },
  });

  // Departments (10 — 5 per company)
  const deptNames = ["HR", "Engineering", "Finance", "Operations", "Sales"];
  const departments = { [companies[0].id]: [], [companies[1].id]: [] };

  for (const company of companies) {
    for (let i = 0; i < deptNames.length; i++) {
      const code = `${company.companyCode.split("-")[0]}-${deptNames[i].substring(0, 3).toUpperCase()}`;
      const dept = await prisma.department.create({
        data: {
          departmentName: deptNames[i],
          departmentCode: code,
          description: `${deptNames[i]} department at ${company.companyName}`,
          status: "ACTIVE",
          companyId: company.id,
        },
      });
      departments[company.id].push(dept);
    }
  }
  console.log("Created 10 departments (5 per company)");

  const hashedPassword = await hash(DEFAULT_PASSWORD);

  // Super Admin (1)
  await prisma.user.create({
    data: {
      employeeId: "SA-001",
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@taskflow.com",
      phone: "+91 90000 00001",
      password: hashedPassword,
      designation: "Platform Super Administrator",
      status: "ACTIVE",
      roleId: roleRecords.SUPER_ADMIN.id,
      companyId: null,
      departmentId: null,
    },
  });
  console.log("Created 1 Super Admin (superadmin@taskflow.com)");

  // Main Admins (4 — 2 per company)
  const mainAdminEmails = [
    ["Rajesh", "Kumar", "rajesh.kumar@techsolutions.com", 0],
    ["Priya", "Sharma", "priya.sharma@techsolutions.com", 0],
    ["Amit", "Patel", "amit.patel@greenleaf.com", 1],
    ["Sneha", "Reddy", "sneha.reddy@greenleaf.com", 1],
  ];
  let mainAdminCount = 0;
  for (const [firstName, lastName, email, companyIdx] of mainAdminEmails) {
    mainAdminCount++;
    await prisma.user.create({
      data: {
        employeeId: `MA-${String(mainAdminCount).padStart(3, "0")}`,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        designation: "Main Administrator",
        status: "ACTIVE",
        roleId: roleRecords.MAIN_ADMIN.id,
        companyId: companies[companyIdx].id,
        departmentId: departments[companies[companyIdx].id][0].id,
      },
    });
  }
  console.log("Created 4 Main Admins");

  // Sub Admins (8 — 4 per company)
  let subAdminCount = 0;
  for (let c = 0; c < companies.length; c++) {
    for (let i = 0; i < 4; i++) {
      subAdminCount++;
      await prisma.user.create({
        data: {
          employeeId: `SUB-${String(subAdminCount).padStart(3, "0")}`,
          firstName: `SubAdmin${subAdminCount}`,
          lastName: companies[c].companyCode.split("-")[0],
          email: `subadmin${subAdminCount}@company${c + 1}.com`,
          password: hashedPassword,
          designation: "Sub Administrator",
          status: "ACTIVE",
          roleId: roleRecords.SUB_ADMIN.id,
          companyId: companies[c].id,
          departmentId: departments[companies[c].id][i % 5].id,
        },
      });
    }
  }
  console.log("Created 8 Sub Admins");

  // Employees (20 — 10 per company)
  let empCount = 0;
  for (let c = 0; c < companies.length; c++) {
    for (let i = 0; i < 10; i++) {
      empCount++;
      await prisma.user.create({
        data: {
          employeeId: `EMP-${String(empCount).padStart(3, "0")}`,
          firstName: `Employee${empCount}`,
          lastName: "User",
          email: `employee${empCount}@company${c + 1}.com`,
          password: hashedPassword,
          designation: ["Developer", "Analyst", "Coordinator", "Executive"][i % 4],
          status: "ACTIVE",
          roleId: roleRecords.EMPLOYEE.id,
          companyId: companies[c].id,
          departmentId: departments[companies[c].id][i % 5].id,
        },
      });
    }
  }
  console.log("Created 20 Employees");

  console.log("\nSeed completed successfully!");
  console.log("─────────────────────────────────────────");
  console.log("Default password for all users:", DEFAULT_PASSWORD);
  console.log("Super Admin login: superadmin@taskflow.com");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
