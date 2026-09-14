const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");
const chatController = require("../controllers/chatController");

router.get("/conversations", authenticateUser, chatController.getConversations);
router.get("/conversations/:conversationId/messages", authenticateUser, chatController.getMessages);
router.post("/conversations", authenticateUser, chatController.createConversation);
router.post("/conversations/by-public-id", authenticateUser, chatController.createConversationByPublicId);
router.post("/conversations/admin-chat", authenticateUser, chatController.getOrCreateAdminConversation);
router.post("/conversations/:conversationId/messages", authenticateUser, chatController.sendMessage);
router.patch("/conversations/:conversationId/read", authenticateUser, chatController.markAsRead);
router.get("/contacts", authenticateUser, chatController.getContacts);
router.get("/unread", authenticateUser, chatController.getUnreadCounts);

module.exports = router;
