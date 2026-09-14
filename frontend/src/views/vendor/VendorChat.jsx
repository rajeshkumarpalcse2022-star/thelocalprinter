"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  getConversations,
  getMessages,
  getOrCreateAdminConversation,
  sendMessage,
  markAsRead,
} from "../../services/chatService";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Send,
  ArrowLeft,
  MessageCircle,
  Circle,
  CircleDot,
  Search,
} from "lucide-react";
import CopyableId from "../../components/admin/CopyableId";

const VendorChat = () => {
  const { user } = useAuth();
  const {
    connected,
    onlineUsers,
    typingUsers,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
    emitMarkRead,
    onEvent,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [activeTab, setActiveTab] = useState("ADMIN");

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await getConversations(activeTab);
      setConversations(res.data.data.conversations);
    } catch {
    } finally {
      setLoadingConversations(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const init = async () => {
      try {
        await getOrCreateAdminConversation();
      } catch {
      }
      fetchConversations();
    };
    init();
  }, []);

  useEffect(() => {
    setLoadingConversations(true);
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversation) return;
    const cleanup1 = onEvent("new_message", (msg) => {
      if (msg.conversationId === activeConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
        emitMarkRead(activeConversation._id);
      }
      fetchConversations();
    });
    const cleanup2 = onEvent("messages_read", ({ conversationId }) => {
      if (conversationId === activeConversation._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.readAt ? m : { ...m, readAt: new Date().toISOString() }
          )
        );
      }
    });
    return () => {
      cleanup1();
      cleanup2();
    };
  }, [activeConversation, onEvent, scrollToBottom, emitMarkRead, fetchConversations]);

  const selectConversation = useCallback(
    async (conv) => {
      if (activeConversation) leaveConversation(activeConversation._id);
      setActiveConversation(conv);
      setMessages([]);
      setLoadingMessages(true);

      try {
        const res = await getMessages(conv._id);
        setMessages(res.data.data.messages);
        scrollToBottom();
        joinConversation(conv._id);
        emitMarkRead(conv._id);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id ? { ...c, unreadCount: 0 } : c
          )
        );
        messageInputRef.current?.focus();
      } catch {
      } finally {
        setLoadingMessages(false);
      }
    },
    [activeConversation, leaveConversation, joinConversation, emitMarkRead, scrollToBottom]
  );

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage("");
    try {
      const res = await sendMessage(activeConversation._id, msgText);
      const sentMsg = res.data.data.message;
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });
      scrollToBottom();
      emitTypingStop(activeConversation._id);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: msgText, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      setNewMessage(msgText);
    } finally {
      setSending(false);
    }
  }, [newMessage, activeConversation, sending, emitTypingStop, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleTyping = useCallback(() => {
    if (!activeConversation) return;
    emitTypingStart(activeConversation._id);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(
      () => emitTypingStop(activeConversation._id),
      2000
    );
    setTypingTimeout(timeout);
  }, [activeConversation, emitTypingStart, emitTypingStop, typingTimeout]);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      conv.otherUser?.fullName?.toLowerCase().includes(q) ||
      conv.otherUser?.publicId?.toLowerCase().includes(q) ||
      conv.otherUser?.email?.toLowerCase().includes(q)
    );
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-white px-4 py-3 dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Chat</h2>
          {user?.publicId && <CopyableId id={user.publicId} />}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {connected ? (
              <>
                <CircleDot className="h-2 w-2 fill-green-500 text-green-500" />
                Connected
              </>
            ) : (
              <>
                <Circle className="h-2 w-2 text-gray-400" />
                Connecting...
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-b-lg border bg-white shadow-sm dark:bg-gray-950">
        {/* Left panel */}
        <div
          className={`${
            activeConversation ? "hidden md:flex" : "flex"
          } w-full flex-col border-r md:w-[360px]`}
        >
          {/* Tabs */}
          <div className="border-b">
            <div className="flex items-center justify-between px-3 pt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="ADMIN" className="text-xs">
                    Support
                  </TabsTrigger>
                  <TabsTrigger value="USER" className="text-xs">
                    Users
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2 p-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  className="h-8 pl-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No results found" : "No conversations yet"}
                </p>
                {!searchQuery && activeTab === "USER" && (
                  <p className="text-xs text-muted-foreground">
                    Waiting for users to start a conversation
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${
                    activeConversation?._id === conv._id
                      ? "bg-orange-50 dark:bg-orange-950"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={
                          conv.otherUser?.role === "VENDOR"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {conv.otherUser?.fullName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(conv.otherUser?._id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-950" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {conv.otherUser?.fullName}
                      </span>
                      <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.otherUser?.publicId && (
                        <CopyableId id={conv.otherUser.publicId} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs text-muted-foreground">
                        {conv.lastMessage || "No messages yet"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <Badge className="ml-2 h-5 min-w-[20px] shrink-0 rounded-full px-1.5 text-[10px]">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right panel */}
        <div
          className={`${
            activeConversation ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => {
                    leaveConversation(activeConversation._id);
                    setActiveConversation(null);
                    setMessages([]);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback
                      className={
                        activeConversation.otherUser?.role === "VENDOR"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {activeConversation.otherUser?.fullName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(activeConversation.otherUser?._id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-950" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {activeConversation.otherUser?.fullName}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConversation.otherUser?.publicId && (
                      <CopyableId id={activeConversation.otherUser.publicId} />
                    )}
                    <span className="flex items-center gap-1">
                      {onlineUsers.has(activeConversation.otherUser?._id) ? (
                        <>
                          <CircleDot className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                          <span className="text-[10px] text-green-600">
                            Online
                          </span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-1.5 w-1.5 text-gray-400" />
                          <span className="text-[10px] text-muted-foreground">
                            Offline
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-xl px-4 py-2 ${
                              isMe
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                            <div
                              className={`mt-1 text-[10px] ${
                                isMe ? "text-orange-100" : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                              {isMe && msg.readAt && " ✓✓"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUsers[activeConversation._id] &&
                      typingUsers[activeConversation._id].userId !== user._id && (
                        <div className="flex justify-start">
                          <div className="rounded-xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
                            <span className="text-xs text-muted-foreground">
                              {typingUsers[activeConversation._id].fullName}{" "}
                              is typing...
                            </span>
                          </div>
                        </div>
                      )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Composer */}
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input
                    ref={messageInputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">
                Select a conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorChat;
