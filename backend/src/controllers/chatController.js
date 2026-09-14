const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const type = req.query.type;

    let filter = { participants: userId };
    if (type) {
      filter.participants = {
        $all: [userId],
        $elemMatch: { $ne: userId },
      };
    }

    let conversations = await Conversation.find({ participants: userId })
      .populate("participants", "fullName email role publicId isActive")
      .sort({ lastMessageAt: -1 })
      .lean();

    let result = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== userId
      );
      return {
        _id: conv._id,
        otherUser: other || null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount?.[userId] || 0,
        createdAt: conv.createdAt,
      };
    });

    if (type) {
      result = result.filter(
        (r) => r.otherUser && r.otherUser.role === type.toUpperCase()
      );
    }

    res.status(200).json({ success: true, data: { conversations: result } });
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ success: false, message: "Server error fetching conversations" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation || !conversation.participants.map(String).includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: "Server error fetching messages" });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    if (!participantId) {
      return res.status(400).json({ success: false, message: "participantId is required" });
    }

    const participant = await User.findById(participantId).lean();
    if (!participant) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (role === participant.role) {
      return res.status(403).json({ success: false, message: "Cannot chat with same role" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
    }).lean();

    if (existing) {
      return res.status(200).json({ success: true, data: { conversation: existing } });
    }

    const conversation = await Conversation.create({
      participants: [userId, participantId],
      participantRoles: {
        [userId]: role,
        [participantId]: participant.role,
      },
      unreadCount: new Map([[userId, 0], [participantId, 0]]),
    });

    res.status(201).json({ success: true, data: { conversation } });
  } catch (error) {
    console.error("createConversation error:", error);
    res.status(500).json({ success: false, message: "Server error creating conversation" });
  }
};

exports.createConversationByPublicId = async (req, res) => {
  try {
    const { publicId } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    if (!publicId || !publicId.trim()) {
      return res.status(400).json({ success: false, message: "Public ID is required" });
    }

    const targetUser = await User.findOne({ publicId: publicId.trim().toUpperCase() }).lean();
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    if (role === "ADMIN") {
      if (targetUser.role === "ADMIN") {
        return res.status(400).json({ success: false, message: "Cannot create conversation with admin" });
      }
    } else if (role === "USER") {
      if (targetUser.role !== "VENDOR") {
        return res.status(400).json({ success: false, message: "This ID does not belong to a Vendor" });
      }
    } else if (role === "VENDOR") {
      if (targetUser.role !== "USER") {
        return res.status(400).json({ success: false, message: "This ID does not belong to a User" });
      }
    }

    if (role === targetUser.role) {
      return res.status(403).json({ success: false, message: "Cannot chat with same role" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [userId, targetUser._id], $size: 2 },
    }).lean();

    if (existing) {
      const populated = await Conversation.findById(existing._id)
        .populate("participants", "fullName email role publicId isActive")
        .lean();
      const other = populated.participants.find((p) => p._id.toString() !== userId);
      return res.status(200).json({
        success: true,
        data: {
          conversation: {
            _id: populated._id,
            otherUser: other,
            lastMessage: populated.lastMessage,
            lastMessageAt: populated.lastMessageAt,
            unreadCount: populated.unreadCount?.[userId] || 0,
            createdAt: populated.createdAt,
          },
        },
      });
    }

    const conversation = await Conversation.create({
      participants: [userId, targetUser._id],
      participantRoles: {
        [userId]: role,
        [targetUser._id]: targetUser.role,
      },
      unreadCount: new Map([[userId, 0], [targetUser._id, 0]]),
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "fullName email role publicId isActive")
      .lean();

    const other = populated.participants.find((p) => p._id.toString() !== userId);

    res.status(201).json({
      success: true,
      data: {
        conversation: {
          _id: populated._id,
          otherUser: other,
          lastMessage: populated.lastMessage,
          lastMessageAt: populated.lastMessageAt,
          unreadCount: 0,
          createdAt: populated.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("createConversationByPublicId error:", error);
    res.status(500).json({ success: false, message: "Server error creating conversation" });
  }
};

exports.getOrCreateAdminConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role === "ADMIN") {
      return res.status(400).json({ success: false, message: "Admins cannot use this endpoint" });
    }

    const admin = await User.findOne({ role: "ADMIN" }).lean();
    if (!admin) {
      return res.status(404).json({ success: false, message: "No admin found" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [userId, admin._id], $size: 2 },
    })
      .populate("participants", "fullName email role publicId isActive")
      .lean();

    if (existing) {
      const other = existing.participants.find((p) => p._id.toString() !== userId);
      return res.status(200).json({
        success: true,
        data: {
          conversation: {
            _id: existing._id,
            otherUser: other,
            lastMessage: existing.lastMessage,
            lastMessageAt: existing.lastMessageAt,
            unreadCount: existing.unreadCount?.[userId] || 0,
            createdAt: existing.createdAt,
          },
        },
      });
    }

    const conversation = await Conversation.create({
      participants: [userId, admin._id],
      participantRoles: {
        [userId]: role,
        [admin._id]: "ADMIN",
      },
      unreadCount: new Map([[userId, 0], [admin._id, 0]]),
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("participants", "fullName email role publicId isActive")
      .lean();

    const other = populated.participants.find((p) => p._id.toString() !== userId);

    res.status(201).json({
      success: true,
      data: {
        conversation: {
          _id: populated._id,
          otherUser: other,
          lastMessage: populated.lastMessage,
          lastMessageAt: populated.lastMessageAt,
          unreadCount: 0,
          createdAt: populated.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("getOrCreateAdminConversation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.map(String).includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const otherUserId = conversation.participants.find((p) => p.toString() !== userId);
    const otherUser = await User.findById(otherUserId).lean();
    if (!otherUser) {
      return res.status(403).json({ success: false, message: "Recipient not found" });
    }

    if (role === otherUser.role) {
      return res.status(403).json({ success: false, message: "Cannot chat with same role" });
    }

    const newMessage = await Message.create({
      conversationId,
      senderId: userId,
      senderRole: role,
      message: message.trim(),
    });

    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();

    const currentUnread = conversation.unreadCount?.[otherUserId] || 0;
    const unreadMap = conversation.unreadCount instanceof Map
      ? conversation.unreadCount
      : new Map(Object.entries(conversation.unreadCount || {}));
    unreadMap.set(otherUserId, currentUnread + 1);
    conversation.unreadCount = unreadMap;

    await conversation.save();

    const populated = await Message.findById(newMessage._id).lean();

    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("new_message", {
        _id: populated._id.toString(),
        conversationId: conversationId.toString(),
        senderId: userId,
        senderRole: role,
        message: message.trim(),
        createdAt: populated.createdAt,
      });
    }

    res.status(201).json({ success: true, data: { message: populated } });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error sending message" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.map(String).includes(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    const unreadMap = conversation.unreadCount instanceof Map
      ? conversation.unreadCount
      : new Map(Object.entries(conversation.unreadCount || {}));
    unreadMap.set(userId, 0);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error marking messages" });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const role = req.user.role;
    const search = req.query.search || "";

    let filter = {};
    if (role === "ADMIN") {
      filter = { role: { $in: ["VENDOR", "USER"] } };
    } else if (role === "USER") {
      filter = { role: "VENDOR" };
    } else if (role === "VENDOR") {
      filter = { role: "USER" };
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { publicId: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await User.find(filter)
      .select("fullName email role publicId isActive phone")
      .sort({ fullName: 1 })
      .lean();

    res.status(200).json({ success: true, data: { contacts } });
  } catch (error) {
    console.error("getContacts error:", error);
    res.status(500).json({ success: false, message: "Server error fetching contacts" });
  }
};

exports.getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
    }).lean();

    let totalUnread = 0;
    const counts = {};
    for (const conv of conversations) {
      const unread = conv.unreadCount?.[userId] || 0;
      totalUnread += unread;
      counts[conv._id.toString()] = unread;
    }

    res.status(200).json({
      success: true,
      data: { totalUnread, conversationCounts: counts },
    });
  } catch (error) {
    console.error("getUnreadCounts error:", error);
    res.status(500).json({ success: false, message: "Server error fetching unread counts" });
  }
};
