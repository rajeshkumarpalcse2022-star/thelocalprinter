import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminCategories from "@/views/admin/AdminCategories";
export const dynamic = "force-dynamic";

export default function AdminCategoriesPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminCategories />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
