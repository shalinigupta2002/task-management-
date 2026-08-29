import prisma from "../src/config/database.js";
import ConversationService from "../src/services/ConversationService.js";
import MessageService from "../src/services/MessageService.js";
import UserService from "../src/services/UserService.js";
import ApiError from "../src/utils/ApiError.js";

async function runTests() {
  console.log("=== Employee Messages Integration & Isolation Tests ===\n");

  // Load companies
  const companyXYZ = await prisma.company.findFirst({
    where: { companyName: { contains: "XYZ" } }
  });
  const companyABC = await prisma.company.findFirst({
    where: { companyName: { contains: "ABC" } }
  });

  if (!companyXYZ || !companyABC) {
    throw new Error("Target test companies not found in DB.");
  }

  // Find or create test users
  const xyzMainAdmin = await prisma.user.findFirst({
    where: { companyId: companyXYZ.id, role: { name: "MAIN_ADMIN" } },
    include: { role: true }
  });

  let aditya = await prisma.user.findFirst({
    where: { email: "aditya.gupta@xyz.test" },
    include: { role: true }
  });

  if (!aditya) {
    // Create new test employee under XYZ
    const empRole = await prisma.role.findFirst({ where: { name: "EMPLOYEE" } });
    aditya = await prisma.user.create({
      data: {
        firstName: "aditya",
        lastName: "gupta",
        email: "aditya.gupta@xyz.test",
        password: "hashedpassword123",
        designation: "Software Engineer",
        status: "ACTIVE",
        companyId: companyXYZ.id,
        roleId: empRole.id
      },
      include: { role: true }
    });
  }

  console.log(`Test Employee Aditya Gupta: ID=${aditya.id}, Company=${companyXYZ.companyName}`);

  // Create second employee for isolation checks
  let employeeB = await prisma.user.findFirst({
    where: { email: "employeeB@xyz.test" }
  });

  if (!employeeB) {
    const empRole = await prisma.role.findFirst({ where: { name: "EMPLOYEE" } });
    employeeB = await prisma.user.create({
      data: {
        firstName: "Employee",
        lastName: "B",
        email: "employeeB@xyz.test",
        password: "hashedpassword123",
        designation: "Developer",
        status: "ACTIVE",
        companyId: companyXYZ.id,
        roleId: empRole.id
      }
    });
  }

  // Create cross-company employee (ABC company)
  let abcEmployee = await prisma.user.findFirst({
    where: { email: "abcEmployee@abc.test" }
  });

  if (!abcEmployee) {
    const empRole = await prisma.role.findFirst({ where: { name: "EMPLOYEE" } });
    abcEmployee = await prisma.user.create({
      data: {
        firstName: "ABC",
        lastName: "Employee",
        email: "abcEmployee@abc.test",
        password: "hashedpassword123",
        designation: "Staff",
        status: "ACTIVE",
        companyId: companyABC.id,
        roleId: empRole.id
      }
    });
  }

  // Load ABC Main Admin to verify cross-company scoping
  const abcMainAdmin = await prisma.user.findFirst({
    where: { companyId: companyABC.id, role: { name: "MAIN_ADMIN" } }
  });

  // Clean old chats
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: aditya.id },
        { receiverId: aditya.id },
        { senderId: employeeB.id },
        { receiverId: employeeB.id }
      ]
    }
  });

  const participations = await prisma.conversationParticipant.findMany({
    where: {
      OR: [
        { userId: aditya.id },
        { userId: employeeB.id }
      ]
    }
  });

  const convIds = participations.map(p => p.conversationId);
  if (convIds.length > 0) {
    await prisma.conversationParticipant.deleteMany({ where: { conversationId: { in: convIds } } });
    await prisma.conversation.deleteMany({ where: { id: { in: convIds } } });
  }

  // Test 1: New employee starts with zero conversations
  console.log("Running Test 1: New employee starts with zero conversations...");
  const convList = await ConversationService.getAll(aditya.id, {});
  if (convList.items.length !== 0) {
    throw new Error(`Test 1 failed: Conversations returned count is ${convList.items.length}, expected 0`);
  }
  console.log("✓ Success: Verified 0 conversations.");

  // Test 2: New employee starts with zero unread messages
  console.log("\nRunning Test 2: New employee starts with zero unread...");
  const unreadCount = await prisma.message.count({
    where: { receiverId: aditya.id, isRead: false }
  });
  if (unreadCount !== 0) {
    throw new Error(`Test 2 failed: Unread message count is ${unreadCount}, expected 0`);
  }
  console.log("✓ Success: Verified 0 unread messages.");

  // Test 3: Real incoming message appears
  console.log("\nRunning Test 3: Send a real incoming message from Main Admin to Aditya...");
  const conv = await ConversationService.create({ otherUserId: aditya.id }, xyzMainAdmin.id);
  const msg = await MessageService.send({
    conversationId: conv.id,
    message: "Welcome to TaskFlow, Aditya! Please prioritize the onboarding tasks."
  }, xyzMainAdmin.id);

  console.log(`Message created in DB. ID=${msg.id}, Text="${msg.message}"`);

  // Verify conversation lists correctly for Aditya
  const adityaConvs = await ConversationService.getAll(aditya.id, {});
  if (adityaConvs.items.length !== 1) {
    throw new Error(`Test 3 failed: Expected 1 conversation, got ${adityaConvs.items.length}`);
  }
  console.log("✓ Success: Real conversation is visible to Aditya.");

  // Test 4: Unread count updates
  console.log("\nRunning Test 4: Verification of unread count status...");
  const adityaUnread = await prisma.message.count({
    where: { receiverId: aditya.id, isRead: false }
  });
  if (adityaUnread !== 1) {
    throw new Error(`Test 4 failed: Expected 1 unread message, got ${adityaUnread}`);
  }
  console.log("✓ Success: Unread count matches exactly 1 incoming message.");

  // Test 5: Real reply persists
  console.log("\nRunning Test 5: Aditya replies back...");
  const replyMsg = await MessageService.send({
    conversationId: conv.id,
    message: "Thank you! I will review and start right away."
  }, aditya.id);

  console.log(`Reply message created in DB. ID=${replyMsg.id}, Text="${replyMsg.message}"`);

  const fetchedMessages = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" }
  });

  if (fetchedMessages.length !== 2) {
    throw new Error(`Test 5 failed: Expected 2 messages in conversation, got ${fetchedMessages.length}`);
  }
  console.log("✓ Success: Messages count is 2 and persists in database.");

  // Test 6: Message read status updating works
  console.log("\nRunning Test 6: Marking messages as read...");
  await MessageService.markRead({ conversationId: conv.id }, aditya.id);
  const postReadCount = await prisma.message.count({
    where: { receiverId: aditya.id, isRead: false }
  });
  if (postReadCount !== 0) {
    throw new Error(`Test 6 failed: Expected 0 unread messages after marking read, got ${postReadCount}`);
  }
  console.log("✓ Success: Messages marked read successfully.");

  // Test 7: Conversation isolation check for unrelated employee
  console.log("\nRunning Test 7: Unrelated employee cannot access conversation...");
  try {
    await ConversationService.getById(conv.id, employeeB.id);
    throw new Error("Test 7 failed: Unrelated employee was allowed to read Aditya's conversation.");
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 403) {
      console.log("✓ Success: Unrelated employee read access blocked with 403.");
    } else {
      throw error;
    }
  }

  // Test 8: Cross-company message restriction check
  console.log("\nRunning Test 8: Cross-company conversation initiation blocks...");
  if (abcMainAdmin) {
    try {
      await ConversationService.create({ otherUserId: abcMainAdmin.id }, aditya.id);
      throw new Error("Test 8 failed: Cross-company conversation was initialized.");
    } catch (error) {
      if (error instanceof ApiError && (error.statusCode === 400 || error.statusCode === 403)) {
        console.log(`✓ Success: Cross-company chat blocked with ${error.statusCode} (${error.message}).`);
      } else {
        throw error;
      }
    }
  } else {
    console.log("Skipping Test 8 (ABC Main Admin not found).");
  }

  console.log("\n=== ALL MESSAGE E2E INTEGRATION & ISOLATION CHECKS PASSED ===");
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
