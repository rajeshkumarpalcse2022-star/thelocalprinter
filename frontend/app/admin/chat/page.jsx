"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import AdminChat from "@/views/admin/AdminChat";

export default function AdminChatPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout>
              <AdminChat />
            </DashboardLayout>
          </ProtectedRoute>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
