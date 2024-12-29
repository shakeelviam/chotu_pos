export interface SaleRow {
  id: number;
  total_amount: number;
  payment_method: string;
  customer_name: string;
  created_at: string;
  synced: boolean;
  item_code: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ItemRow {
  item_code: string;
  item_name: string;
  barcode: string | null;
  standard_rate: number;
  image_url: string | null;
  current_stock: number;
  last_sync: string;
}

export interface ConfigRow {
  key: string;
  value: string;
}
