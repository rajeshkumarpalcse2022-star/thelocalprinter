import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorReviews from "@/views/vendor/VendorReviews";
export const dynamic = "force-dynamic";

export default function VendorReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorReviews />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
