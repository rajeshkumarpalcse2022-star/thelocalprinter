import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorDashboard from "@/views/vendor/VendorDashboard";
export const dynamic = "force-dynamic";

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
