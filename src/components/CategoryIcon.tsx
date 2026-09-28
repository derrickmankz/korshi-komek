import { TaskCategory } from "@workspace/api-client-react";
import { Dog, ShoppingBasket, Package, Sprout, PawPrint, Footprints, Sparkles, HelpCircle } from "lucide-react";

interface CategoryIconProps {
  category: TaskCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  switch (category) {
    case TaskCategory.walk_dog:
      return <Dog className={className} />;
    case TaskCategory.groceries:
      return <ShoppingBasket className={className} />;
    case TaskCategory.parcel_pickup:
      return <Package className={className} />;
    case TaskCategory.plant_care:
      return <Sprout className={className} />;
    case TaskCategory.pet_sitting:
      return <PawPrint className={className} />;
    case TaskCategory.errand:
      return <Footprints className={className} />;
    case TaskCategory.cleaning_help:
      return <Sparkles className={className} />;
    case TaskCategory.other:
    default:
      return <HelpCircle className={className} />;
  }
}
