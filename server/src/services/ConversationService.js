import ConversationRepository from "../repositories/ConversationRepository.js";
import MessageService from "./MessageService.js";
import ApiError from "../utils/ApiError.js";
import { loadChatUser, assertChatAllowed, assertConversationMember } from "../utils/chatAccess.js";
import { ROLES } from "../constants/index.js";

class ConversationService {
  resolveCompanyId(sender, receiver) {
    if (sender.roleName === ROLES.SUPER_ADMIN) {
      return receiver.companyId || sender.companyId;
    }
    return sender.companyId;
  }

  async getAll(userId, query) {
    return ConversationRepository.findForUser(userId, query);
  }

  async getById(id, userId) {
    await assertConversationMember(userId, id);
    const conversation = await ConversationRepository.findById(id);
    if (!conversation) throw ApiError.notFound("Conversation not found");
    return conversation;
  }

  async create(data, userId) {
    const sender = await loadChatUser(userId);
    const receiver = await loadChatUser(data.otherUserId);
    assertChatAllowed(sender, receiver);

    const companyId = this.resolveCompanyId(sender, receiver);
    if (!companyId) throw ApiError.badRequest("Cannot determine company for conversation");

    const existing = await ConversationRepository.findByParticipants(sender.id, receiver.id);
    if (existing) {
      if (data.initialMessage) {
        await MessageService.send(
          { conversationId: existing.id, message: data.initialMessage },
          userId
        );
      }
      return ConversationRepository.findById(existing.id);
    }

    const conversation = await ConversationRepository.create(
      { companyId, conversationType: "DIRECT" },
      [sender.id, receiver.id]
    );

    if (data.initialMessage) {
      await MessageService.send(
        { conversationId: conversation.id, message: data.initialMessage },
        userId
      );
    }

    return ConversationRepository.findById(conversation.id);
  }
}

export default new ConversationService();
