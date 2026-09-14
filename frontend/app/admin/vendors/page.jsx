import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminVendors from "@/views/admin/AdminVendors";
export const dynamic = "force-dynamic";

export default function AdminVendorsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminVendors />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
