import NotificationRepository from "../repositories/NotificationRepository.js";
import PreferenceRepository from "../repositories/PreferenceRepository.js";
import ApiError from "../utils/ApiError.js";
import { emitToUser } from "../socket/io.js";
import { NOTIFICATION_TYPE } from "../constants/notification.constants.js";

class NotificationService {
  async shouldNotify(userId, category) {
    const pref = await PreferenceRepository.getOrCreate(userId);
    if (!pref.inAppNotification) return false;
    const map = {
      task: pref.taskReminder,
      overdue: pref.overdueReminder,
      message: pref.messageNotification,
      system: pref.systemNotification,
    };
    return map[category] !== false;
  }

  async create(data, category = "system", force = false) {
    if (!force) {
      const notify = await this.shouldNotify(data.userId, category);
      if (!notify) return null;
    }

    const notification = await NotificationRepository.create(data);

    emitToUser(data.userId, "notification:new", {
      notification,
      unreadCount: await NotificationRepository.countUnread(data.userId),
    });

    return notification;
  }

  async createIfNotDuplicate(data, category, since) {
    if (data.referenceType && data.referenceId) {
      const exists = await NotificationRepository.existsDuplicate(
        data.userId, data.type, data.referenceType, data.referenceId, since
      );
      if (exists) return null;
    }
    return this.create(data, category);
  }

  async getAll(userId, query) {
    return NotificationRepository.findAll(userId, query);
  }

  async getUnread(userId, query) {
    return NotificationRepository.findUnread(userId, query);
  }

  async getById(id, userId) {
    const notification = await NotificationRepository.findById(id);
    if (!notification) throw ApiError.notFound("Notification not found");
    if (notification.userId !== userId) throw ApiError.forbidden("Access denied");
    return notification;
  }

  async markRead(id, userId) {
    await this.getById(id, userId);
    await NotificationRepository.markRead(id, userId);
    const unreadCount = await NotificationRepository.countUnread(userId);
    emitToUser(userId, "notification:read", { id, unreadCount });
    return { id, isRead: true, unreadCount };
  }

  async markAllRead(userId) {
    await NotificationRepository.markAllRead(userId);
    emitToUser(userId, "notification:read-all", { unreadCount: 0 });
    return { unreadCount: 0 };
  }

  async getCount(userId) {
    return { unreadCount: await NotificationRepository.countUnread(userId) };
  }

  async remove(id, userId) {
    await this.getById(id, userId);
    await NotificationRepository.remove(id, userId);
    return { deleted: true };
  }

  async notifyNewMessage(receiverId, message, sender) {
    return this.create({
      userId: receiverId,
      title: "New Message",
      message: `${sender.firstName} ${sender.lastName}: ${message.message.substring(0, 100)}`,
      type: NOTIFICATION_TYPE.NEW_MESSAGE,
      priority: "MEDIUM",
      referenceType: "MESSAGE",
      referenceId: message.id,
    }, "message");
  }
}

export default new NotificationService();
