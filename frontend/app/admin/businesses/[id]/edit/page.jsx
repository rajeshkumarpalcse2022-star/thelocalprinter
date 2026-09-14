"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

const AdminBusinessEditPage = dynamic(
  () => import("@/views/admin/AdminBusinessEditPage"),
  { ssr: false }
);

export default function AdminBusinessEdit() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminBusinessEditPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
