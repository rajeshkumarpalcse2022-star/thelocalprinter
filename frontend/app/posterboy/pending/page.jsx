import ProtectedRoute from "@/components/ProtectedRoute";
import PosterBoyPending from "@/views/posterboy/PosterBoyPending";
export const dynamic = "force-dynamic";

export default function PosterBoyPendingPage() {
  return (
    <ProtectedRoute allowedRoles={["POSTER_BOY"]}>
      <PosterBoyPending />
    </ProtectedRoute>
  );
}
