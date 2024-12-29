import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onDot: () => void;
  className?: string;
}

export function NumberPad({
  onNumberClick,
  onBackspace,
  onClear,
  onDot,
  className,
}: NumberPadProps) {
  const numbers = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 p-2 bg-gradient-to-br from-card to-secondary/5 rounded-lg border",
        className
      )}
    >
      {numbers.map((num) => (
        <Button
          key={num}
          variant="outline"
          className={cn(
            "h-12 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors",
            num === "0" && "col-span-2"
          )}
          onClick={() => onNumberClick(num)}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onDot}
      >
        .
      </Button>
      <Button
        variant="outline"
        className="h-12 col-span-2 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        variant="outline"
        className="h-12 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onBackspace}
      >
        ←
      </Button>
    </div>
  );
}
