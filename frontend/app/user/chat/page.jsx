"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import UserChat from "@/views/user/UserChat";

export default function UserChatPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ProtectedRoute allowedRoles={["USER"]}>
            <DashboardLayout>
              <UserChat />
            </DashboardLayout>
          </ProtectedRoute>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
