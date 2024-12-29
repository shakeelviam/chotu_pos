import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ItemGridProps {
  items: Item[];
  onAddToCart: (item: Item) => void;
}

export function ItemGrid({ items, onAddToCart }: ItemGridProps) {
  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
        {items.map((item) => (
          <ItemCard
            key={item.item_code}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
