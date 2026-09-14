import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserExplore from "@/views/user/UserExplore";
export const dynamic = "force-dynamic";

export default function UserExplorePage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserExplore />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
