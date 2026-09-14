import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminBusinesses from "@/views/admin/AdminBusinesses";
export const dynamic = "force-dynamic";

export default function AdminBusinessesPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminBusinesses />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
