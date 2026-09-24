import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function SignBoardsPage() {
  return <CategoryDetail content={categoryDetails["sign-boards"]} />;
}
