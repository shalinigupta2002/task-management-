import { ROLES } from "../constants/index.js";
import { ALLOWED_CHAT_PAIRS } from "../constants/chat.constants.js";
import ApiError from "./ApiError.js";
import prisma from "../config/database.js";

export async function loadChatUser(userId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, status: "ACTIVE" },
    include: { role: { select: { name: true } } },
  });
  if (!user) throw ApiError.notFound("User not found");
  return { ...user, roleName: user.role.name };
}

function isPairAllowed(roleA, roleB) {
  return ALLOWED_CHAT_PAIRS.some(
    ([r1, r2]) => (r1 === roleA && r2 === roleB) || (r1 === roleB && r2 === roleA)
  );
}

export function assertChatAllowed(sender, receiver) {
  if (sender.id === receiver.id) {
    throw ApiError.badRequest("Cannot start a conversation with yourself");
  }

  const senderRole = sender.roleName;
  const receiverRole = receiver.roleName;

  if (senderRole === ROLES.EMPLOYEE && receiverRole === ROLES.EMPLOYEE) {
    throw ApiError.forbidden("Employees cannot chat with other employees");
  }
  if (senderRole === ROLES.SUB_ADMIN && receiverRole === ROLES.SUB_ADMIN) {
    throw ApiError.forbidden("Sub Admins cannot chat with other Sub Admins");
  }

  if (!isPairAllowed(senderRole, receiverRole)) {
    throw ApiError.forbidden(`Chat not allowed between ${senderRole} and ${receiverRole}`);
  }

  if (senderRole !== ROLES.SUPER_ADMIN && sender.companyId !== receiver.companyId) {
    throw ApiError.forbidden("Cannot chat with users outside your company");
  }
}

export async function assertConversationMember(userId, conversationId) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
  if (!participant) throw ApiError.forbidden("You are not a member of this conversation");
  return participant;
}

export default { loadChatUser, assertChatAllowed, assertConversationMember };
