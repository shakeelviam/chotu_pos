import { Item } from "@/types";

export const mockItems: Item[] = [
  {
    item_code: "LAP001",
    item_name: "Laptop",
    standard_rate: 999.990,
    stock_uom: "Nos",
    actual_qty: 10,
    has_batch_no: false,
    has_serial_no: true
  },
  {
    item_code: "MOU001",
    item_name: "Wireless Mouse",
    standard_rate: 29.990,
    stock_uom: "Nos",
    actual_qty: 50,
    has_batch_no: false,
    has_serial_no: true
  },
  {
    item_code: "CAB001",
    item_name: "USB-C Cable",
    standard_rate: 19.990,
    stock_uom: "Nos",
    actual_qty: 100,
    has_batch_no: false,
    has_serial_no: false
  },
  {
    item_code: "KEY001",
    item_name: "Mechanical Keyboard",
    standard_rate: 149.990,
    stock_uom: "Nos",
    actual_qty: 15,
    has_batch_no: false,
    has_serial_no: true
  },
  {
    item_code: "MON001",
    item_name: "27\" Monitor",
    standard_rate: 299.990,
    stock_uom: "Nos",
    actual_qty: 8,
    has_batch_no: false,
    has_serial_no: true
  }
];
