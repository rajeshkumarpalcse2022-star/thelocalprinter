import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function InstagramTrendingPage() {
  return <CategoryDetail content={categoryDetails["instagram-trending"]} />;
}
