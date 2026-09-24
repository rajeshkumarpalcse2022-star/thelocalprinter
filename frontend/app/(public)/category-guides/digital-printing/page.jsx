import CategoryDetail from "@/components/categories/CategoryDetail";
import { categoryDetails } from "@/data/categoryDetails";

export default function DigitalPrintingPage() {
  return <CategoryDetail content={categoryDetails["digital-printing"]} />;
}
