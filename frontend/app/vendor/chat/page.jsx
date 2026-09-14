"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SocketProvider } from "@/context/SocketContext";
import VendorChat from "@/views/vendor/VendorChat";

export default function VendorChatPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ProtectedRoute allowedRoles={["VENDOR"]}>
            <DashboardLayout>
              <VendorChat />
            </DashboardLayout>
          </ProtectedRoute>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
