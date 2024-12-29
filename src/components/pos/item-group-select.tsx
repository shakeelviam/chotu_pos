import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ItemGroupSelect() {
  return (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select item group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Items</SelectItem>
        <SelectItem value="products">Products</SelectItem>
        <SelectItem value="services">Services</SelectItem>
      </SelectContent>
    </Select>
  );
}
