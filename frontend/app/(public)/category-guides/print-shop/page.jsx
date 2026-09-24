import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function PrintShopPage() {
  return <CategoryDetail content={categoryDetails["print-shop"]} />;
}
