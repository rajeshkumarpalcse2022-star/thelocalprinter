"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserPackage from "@/views/user/UserPackage";

export default function UserPackagePage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserPackage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
