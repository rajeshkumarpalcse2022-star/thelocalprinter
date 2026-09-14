"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!token || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("online_users", ({ users }) => {
      setOnlineUsers(new Set(users));
    });

    socket.on("user_online", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("typing_start", ({ conversationId, userId, fullName }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { userId, fullName },
      }));
    });

    socket.on("typing_stop", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOnlineUsers(new Set());
      setTypingUsers({});
    };
  }, [token, user]);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit("join_conversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit("leave_conversation", conversationId);
  }, []);

  const emitMessage = useCallback((conversationId, message) => {
    socketRef.current?.emit("send_message", { conversationId, message });
  }, []);

  const emitTypingStart = useCallback((conversationId) => {
    socketRef.current?.emit("typing_start", conversationId);
  }, []);

  const emitTypingStop = useCallback((conversationId) => {
    socketRef.current?.emit("typing_stop", conversationId);
  }, []);

  const emitMarkRead = useCallback((conversationId) => {
    socketRef.current?.emit("mark_read", conversationId);
  }, []);

  const onEvent = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        connected,
        onlineUsers,
        typingUsers,
        joinConversation,
        leaveConversation,
        emitMessage,
        emitTypingStart,
        emitTypingStop,
        emitMarkRead,
        onEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
