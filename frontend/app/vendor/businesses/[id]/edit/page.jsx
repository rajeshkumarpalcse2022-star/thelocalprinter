import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import VendorBusinessForm from "@/views/vendor/VendorBusinessForm";
export const dynamic = "force-dynamic";

export default function VendorEditBusinessPage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <DashboardLayout>
        <VendorBusinessForm />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
