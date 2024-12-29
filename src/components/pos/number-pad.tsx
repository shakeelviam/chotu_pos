import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onDot: () => void;
  onQuantity?: () => void;
  onRate?: () => void;
  onDiscount?: () => void;
  activeInput: "quantity" | "rate" | "discount";
  className?: string;
}

export function NumberPad({
  onNumberClick,
  onBackspace,
  onClear,
  onDot,
  onQuantity,
  onRate,
  onDiscount,
  activeInput,
  className,
}: NumberPadProps) {
  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

  return (
    <div className={cn("grid gap-2", className)}>
      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={activeInput === "quantity" ? "default" : "outline"}
          className="h-10"
          onClick={onQuantity}
        >
          Quantity
        </Button>
        <Button
          variant={activeInput === "rate" ? "default" : "outline"}
          className="h-10"
          onClick={onRate}
        >
          Rate
        </Button>
        <Button
          variant={activeInput === "discount" ? "default" : "outline"}
          className="h-10"
          onClick={onDiscount}
        >
          Discount
        </Button>
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            className={cn(
              "h-10 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors",
              num === "0" && "col-span-2"
            )}
            onClick={() => onNumberClick(num)}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-10 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={onDot}
        >
          .
        </Button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-10 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          className="h-10 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={onBackspace}
        >
          ←
        </Button>
      </div>
    </div>
  );
}
