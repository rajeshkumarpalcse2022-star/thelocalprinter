import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserWishlist from "@/views/user/UserWishlist";
export const dynamic = "force-dynamic";

export default function UserWishlistPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserWishlist />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
