/**
 * Helpers for role-based Contact Sub Admin / Main Admin / Super Admin flows.
 */

export function contactDisplayName(user) {
  if (!user) return "Unknown";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Unknown";
}

export function contactRoleLabel(user) {
  return user?.role?.name || user?.roleName || "User";
}

export function contactMetaLabel(user) {
  const role = contactRoleLabel(user);
  if (role === "SUPER_ADMIN") return "Platform";
  const dept = user?.department?.departmentName;
  const company = user?.company?.companyName;
  return dept || company || "";
}

/**
 * Open or create a direct conversation with an eligible contact.
 * If exactly one contact and autoSelectSingle is true, skips picker.
 */
export async function startContactConversation({
  conversationService,
  contacts,
  selectedUserId,
  loadConversations,
  setSelectedId,
  toast,
}) {
  const otherUserId = selectedUserId || (contacts.length === 1 ? contacts[0].id : null);
  if (!otherUserId) {
    throw new Error("Select a contact");
  }
  const conv = await conversationService.create({ otherUserId });
  if (typeof loadConversations === "function") {
    await loadConversations(false);
  }
  if (typeof setSelectedId === "function") {
    setSelectedId(conv.id);
  }
  toast?.success?.("Conversation opened");
  return conv;
}
