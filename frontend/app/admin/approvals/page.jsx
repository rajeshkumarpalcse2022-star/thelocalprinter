import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminApprovals from "@/views/admin/AdminApprovals";
export const dynamic = "force-dynamic";

export default function AdminApprovalsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminApprovals />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
