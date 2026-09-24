import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function MarketingMaterialsPage() {
  return <CategoryDetail content={categoryDetails["marketing-materials"]} />;
}
