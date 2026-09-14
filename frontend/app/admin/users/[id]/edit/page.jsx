"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

const AdminUserEditPage = dynamic(
  () => import("@/views/admin/AdminUserEditPage"),
  { ssr: false }
);

export default function AdminUserEdit() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminUserEditPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
