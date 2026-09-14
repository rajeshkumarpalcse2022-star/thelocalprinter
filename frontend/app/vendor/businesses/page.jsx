import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorBusinesses from "@/views/vendor/VendorBusinesses";
export const dynamic = "force-dynamic";

export default function VendorBusinessesPage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorBusinesses />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
