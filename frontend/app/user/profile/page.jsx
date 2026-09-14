import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserProfile from "@/views/user/UserProfile";
export const dynamic = "force-dynamic";

export default function UserProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
