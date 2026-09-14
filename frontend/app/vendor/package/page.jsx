"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorPackage from "@/views/vendor/VendorPackage";

export default function VendorPackagePage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorPackage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
