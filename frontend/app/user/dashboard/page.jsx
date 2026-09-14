import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import UserDashboard from "@/views/user/UserDashboard";
export const dynamic = "force-dynamic";

export default function UserDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
