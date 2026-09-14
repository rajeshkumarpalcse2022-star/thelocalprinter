import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminUsers from "@/views/admin/AdminUsers";
export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminUsers />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
