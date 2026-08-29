import MessageRepository from "../repositories/MessageRepository.js";
import ConversationRepository from "../repositories/ConversationRepository.js";
import NotificationService from "./NotificationService.js";
import ApiError from "../utils/ApiError.js";
import { validateSecureHttpsUrl } from "../utils/urlValidation.js";
import {
  loadChatUser, assertChatAllowed, assertConversationMember,
} from "../utils/chatAccess.js";
import { emitToUser, getIO } from "../socket/io.js";

class MessageService {
  async getAll(userId, query) {
    if (!query.conversationId) {
      throw ApiError.badRequest("conversationId is required in query");
    }
    await assertConversationMember(userId, query.conversationId);
    return MessageRepository.findAll(query);
  }

  async getById(id, userId) {
    const message = await MessageRepository.findById(id);
    if (!message) throw ApiError.notFound("Message not found");
    await assertConversationMember(userId, message.conversationId);
    return message;
  }

  async send(data, userId) {
    const sender = await loadChatUser(userId);
    await assertConversationMember(userId, data.conversationId);

    const conversation = await ConversationRepository.findById(data.conversationId);
    const otherParticipant =
      conversation.participants.find(
        (p) => p.userId !== userId && p.user?.role?.name !== "SUPER_ADMIN"
      )
      || conversation.participants.find((p) => p.userId !== userId);
    if (!otherParticipant) throw ApiError.badRequest("Invalid conversation");

    const receiver = await loadChatUser(otherParticipant.userId);
    assertChatAllowed(sender, receiver);

    if (data.attachmentUrl) {
      validateSecureHttpsUrl(data.attachmentUrl);
    }

    const message = await MessageRepository.create({
      conversationId: data.conversationId,
      senderId: sender.id,
      receiverId: receiver.id,
      message: data.message,
      messageType: data.messageType || "TEXT",
      attachmentUrl: data.attachmentUrl,
      attachmentName: data.attachmentName,
      attachmentSize: data.attachmentSize,
    });

    await ConversationRepository.touchUpdatedAt(data.conversationId);

    await NotificationService.notifyNewMessage(receiver.id, message, sender);

    const payload = { message, conversationId: data.conversationId };
    emitToUser(receiver.id, "message:new", payload);
    getIO()?.to(`conversation:${data.conversationId}`).emit("message:new", payload);

    const unreadCount = await MessageRepository.countUnread(receiver.id);
    emitToUser(receiver.id, "message:unread-count", { unreadCount });

    return message;
  }

  async update(id, data, userId) {
    const message = await MessageRepository.findById(id);
    if (!message) throw ApiError.notFound("Message not found");
    if (message.senderId !== userId) throw ApiError.forbidden("You can only edit your own messages");

    const updated = await MessageRepository.update(id, { message: data.message });
    getIO()?.to(`conversation:${message.conversationId}`).emit("message:updated", { message: updated });
    return updated;
  }

  async remove(id, userId) {
    const message = await MessageRepository.findById(id);
    if (!message) throw ApiError.notFound("Message not found");
    if (message.senderId !== userId) throw ApiError.forbidden("You can only delete your own messages");

    await MessageRepository.softDelete(id);
    getIO()?.to(`conversation:${message.conversationId}`).emit("message:deleted", { id });
    return { deleted: true };
  }

  async markRead(data, userId) {
    await assertConversationMember(userId, data.conversationId);

    if (data.messageIds?.length) {
      await MessageRepository.markRead(data.messageIds, userId);
    } else {
      await MessageRepository.markConversationRead(data.conversationId, userId);
    }

    const unreadCount = await MessageRepository.countUnread(userId);
    const conversationUnread = await MessageRepository.countUnreadByConversation(
      data.conversationId, userId
    );

    getIO()?.to(`conversation:${data.conversationId}`).emit("message:read", {
      conversationId: data.conversationId,
      readerId: userId,
      messageIds: data.messageIds,
    });

    emitToUser(userId, "message:unread-count", { unreadCount });

    return { unreadCount, conversationUnread };
  }

  async getUnreadCount(userId) {
    return { unreadCount: await MessageRepository.countUnread(userId) };
  }
}

export default new MessageService();
