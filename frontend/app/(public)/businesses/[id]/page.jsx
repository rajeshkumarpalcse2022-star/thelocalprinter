import UserBusinessDetails from "@/views/user/UserBusinessDetails";
export const dynamic = "force-dynamic";

export default function PublicBusinessDetailsPage() {
  return <UserBusinessDetails publicMode={true} />;
}
