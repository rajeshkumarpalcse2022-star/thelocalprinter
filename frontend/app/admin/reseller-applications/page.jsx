import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminResellerApplications from "@/views/admin/AdminResellerApplications";
export const dynamic = "force-dynamic";

export default function AdminResellerApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminResellerApplications />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
