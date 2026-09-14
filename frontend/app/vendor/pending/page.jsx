import ProtectedRoute from "@/components/ProtectedRoute";
import VendorPending from "@/views/vendor/VendorPending";
export const dynamic = "force-dynamic";

export default function VendorPendingPage() {
  return (
    <ProtectedRoute allowedRoles={["VENDOR"]}>
      <VendorPending />
    </ProtectedRoute>
  );
}
