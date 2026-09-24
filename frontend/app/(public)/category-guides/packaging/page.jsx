import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function PackagingPage() {
  return <CategoryDetail content={categoryDetails["packaging"]} />;
}
