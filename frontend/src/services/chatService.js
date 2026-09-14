import api from "./api";

export const getConversations = (type = "") =>
  api.get(`/chat/conversations${type ? `?type=${type}` : ""}`);
export const getMessages = (conversationId, page = 1) =>
  api.get(`/chat/conversations/${conversationId}/messages?page=${page}`);
export const createConversation = (participantId) =>
  api.post("/chat/conversations", { participantId });
export const createConversationByPublicId = (publicId) =>
  api.post("/chat/conversations/by-public-id", { publicId });
export const getOrCreateAdminConversation = () =>
  api.post("/chat/conversations/admin-chat");
export const sendMessage = (conversationId, message) =>
  api.post(`/chat/conversations/${conversationId}/messages`, { message });
export const markAsRead = (conversationId) =>
  api.patch(`/chat/conversations/${conversationId}/read`);
export const getContacts = (search = "") =>
  api.get(`/chat/contacts?search=${encodeURIComponent(search)}`);
export const getUnreadCounts = () => api.get("/chat/unread");
