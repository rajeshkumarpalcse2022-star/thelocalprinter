import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserBusinessDetails from "@/views/user/UserBusinessDetails";
export const dynamic = "force-dynamic";

export default function UserBusinessDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserBusinessDetails />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
