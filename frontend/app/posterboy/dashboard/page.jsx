import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import PosterBoyDashboard from "@/views/posterboy/PosterBoyDashboard";
export const dynamic = "force-dynamic";

export default function PosterBoyDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["POSTER_BOY"]}>
      <DashboardLayout>
        <PosterBoyDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
