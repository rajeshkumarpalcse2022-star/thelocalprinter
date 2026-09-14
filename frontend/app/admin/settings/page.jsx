import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminSettings from "@/views/admin/AdminSettings";
export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminSettings />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
