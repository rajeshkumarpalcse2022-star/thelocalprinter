import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function XeroxShopPage() {
  return <CategoryDetail content={categoryDetails["xerox-shop"]} />;
}
