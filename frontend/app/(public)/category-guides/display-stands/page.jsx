import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function DisplayStandsPage() {
  return <CategoryDetail content={categoryDetails["display-stands"]} />;
}
