import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorProfile from "@/views/vendor/VendorProfile";
export const dynamic = "force-dynamic";

export default function VendorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorProfile />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
