import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminReviews from "@/views/admin/AdminReviews";
export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>
        <AdminReviews />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
