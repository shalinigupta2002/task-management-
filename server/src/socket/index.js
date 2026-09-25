import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import { setIO, emitToUser } from "./io.js";
import OnlineUserRepository from "../repositories/OnlineUserRepository.js";
import MessageRepository from "../repositories/MessageRepository.js";
import { assertConversationMember } from "../utils/chatAccess.js";
import config from "../config/index.js";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  setIO(io);

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required"));
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId, email, role, companyId } = socket.user;

    socket.join(`user:${userId}`);
    // Presence must stay company-scoped — never broadcast cross-tenant.
    if (companyId) {
      socket.join(`company:${companyId}`);
    }
    await OnlineUserRepository.upsert(userId, socket.id, "ONLINE");

    const presencePayload = {
      userId,
      email,
      role,
      companyId,
      status: "ONLINE",
    };
    if (companyId) {
      io.to(`company:${companyId}`).emit("user:connected", presencePayload);
    } else {
      socket.emit("user:connected", presencePayload);
    }

    const unreadMessages = await MessageRepository.countUnread(userId);
    socket.emit("message:unread-count", { unreadCount: unreadMessages });

    socket.on("conversation:join", async ({ conversationId }) => {
      try {
        await assertConversationMember(userId, conversationId);
        socket.join(`conversation:${conversationId}`);
        socket.emit("conversation:joined", { conversationId });
      } catch (err) {
        socket.emit("error", { message: err.message || "Cannot join conversation" });
      }
    });

    socket.on("conversation:leave", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("typing:start", async ({ conversationId }) => {
      try {
        await assertConversationMember(userId, conversationId);
        socket.to(`conversation:${conversationId}`).emit("typing:start", {
          conversationId,
          userId,
        });
      } catch {
        socket.emit("error", { message: "Cannot send typing indicator" });
      }
    });

    socket.on("typing:stop", async ({ conversationId }) => {
      try {
        await assertConversationMember(userId, conversationId);
        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId,
          userId,
        });
      } catch {
        /* ignore */
      }
    });

    socket.on("status:update", async ({ status }) => {
      const valid = ["ONLINE", "OFFLINE", "AWAY"];
      if (!valid.includes(status)) return;
      await OnlineUserRepository.updateStatus(userId, status);
      if (companyId) {
        io.to(`company:${companyId}`).emit("user:status", { userId, status });
      }
    });

    socket.on("disconnect", async () => {
      await OnlineUserRepository.removeBySocketId(socket.id);
      const stillOnline = await OnlineUserRepository.isUserOnline(userId);
      if (!stillOnline && companyId) {
        io.to(`company:${companyId}`).emit("user:disconnected", { userId, status: "OFFLINE" });
      }
    });
  });

  return io;
}

export default { initSocket };
