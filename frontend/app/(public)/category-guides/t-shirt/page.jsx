import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function TShirtPage() {
  return <CategoryDetail content={categoryDetails["t-shirt"]} />;
}
