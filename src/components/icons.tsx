import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Minus,
  Trash,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsUpDown: ChevronsUpDown,
  plus: Plus,
  minus: Minus,
  trash: Trash,
} as const;
