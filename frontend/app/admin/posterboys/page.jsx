import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminPosterBoys from "@/views/admin/AdminPosterBoys";
export const dynamic = "force-dynamic";

export default function AdminPosterBoysPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminPosterBoys />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
