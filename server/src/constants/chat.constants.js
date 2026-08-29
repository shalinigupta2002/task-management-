export const CONVERSATION_TYPE = { DIRECT: "DIRECT" };

export const MESSAGE_TYPE = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  PDF: "PDF",
  DOCX: "DOCX",
  EXCEL: "EXCEL",
};

export const ONLINE_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  AWAY: "AWAY",
};

/**
 * Bidirectional pairs allowed for messaging within an existing conversation
 * (replies along the hierarchy chain).
 *
 * Strict hierarchy edges only:
 *   EMPLOYEE ↔ SUB_ADMIN
 *   SUB_ADMIN ↔ MAIN_ADMIN
 *   MAIN_ADMIN ↔ SUPER_ADMIN
 */
export const ALLOWED_CHAT_PAIRS = [
  ["SUPER_ADMIN", "MAIN_ADMIN"],
  ["MAIN_ADMIN", "SUB_ADMIN"],
  ["SUB_ADMIN", "EMPLOYEE"],
];

/**
 * Who may *initiate* a new conversation with whom.
 * Keys are sender roles; values are allowed recipient roles.
 */
export const CHAT_INITIATE_TARGETS = {
  EMPLOYEE: ["SUB_ADMIN"],
  SUB_ADMIN: ["MAIN_ADMIN"],
  MAIN_ADMIN: ["SUPER_ADMIN"],
  SUPER_ADMIN: ["MAIN_ADMIN"],
};

export default {
  CONVERSATION_TYPE,
  MESSAGE_TYPE,
  ONLINE_STATUS,
  ALLOWED_CHAT_PAIRS,
  CHAT_INITIATE_TARGETS,
};
