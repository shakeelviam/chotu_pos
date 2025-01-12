"use client";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Item } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  item: Item;
  onAddToCart: (item: Item) => void;
}

export function ItemCard({ item, onAddToCart }: ItemCardProps) {
  return (
    <Card
      className="relative overflow-hidden cursor-pointer hover:border-primary transition-colors"
      onClick={() => onAddToCart(item)}
    >
      {/* Stock Quantity Indicator */}
      {item.actual_qty && item.actual_qty > 0 && (
        <Badge
          variant="default"
          className="absolute right-2 top-2 bg-green-500 hover:bg-green-500"
        >
          {item.actual_qty}
        </Badge>
      )}

      {/* Scale Item Indicator */}
      {item.item_group === 'Weighed Items' && (
        <Badge
          variant="secondary"
          className="absolute left-2 top-2"
        >
          Scale
        </Badge>
      )}

      <div className="p-4 space-y-3">
        {/* Item Image */}
        <div className="relative w-full aspect-square bg-muted rounded-md overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.item_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        {/* Item Details */}
        <div className="space-y-1">
          <h3 className="font-medium leading-none truncate" title={item.item_name}>
            {item.item_name}
          </h3>

          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between items-center">
              <span>{item.item_code}</span>
              <span>{item.uom || 'Pcs'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">
                {item.standard_rate.toFixed(3)} KD{item.item_group === 'Weighed Items' ? '/kg' : ''}
              </span>
              <span className="text-xs">
                {item.warehouse}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}