import { CartItem, POSInvoice } from "@/types";

export function createInvoice(
  items: CartItem[],
  customer: string = "Cash Customer",
  payments: Array<{ mode_of_payment: string; amount: number }>,
  additionalDiscount: number = 0
): POSInvoice {
  // Calculate totals
  const netTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const itemDiscounts = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const additionalDiscountAmount = additionalDiscount ? (netTotal - itemDiscounts) * (additionalDiscount / 100) : 0;
  const grandTotal = netTotal - itemDiscounts - additionalDiscountAmount;

  const now = new Date();
  
  return {
    posting_date: now.toISOString().split('T')[0],
    posting_time: now.toTimeString().split(' ')[0],
    customer,
    total: netTotal,
    net_total: netTotal,
    grand_total: grandTotal,
    discount_amount: itemDiscounts + additionalDiscountAmount,
    status: 'Paid',
    is_return: false,
    pos_profile: "Default",
    company: "Your Company",
    warehouse: "Default Warehouse",
    currency: "KWD",
    items,
    payments,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export function formatInvoiceNumber(id: number): string {
  return `INV-${String(id).padStart(5, '0')}`;
}

export function calculateInvoiceTotals(items: CartItem[]) {
  const netTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const itemDiscounts = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  
  return {
    netTotal,
    itemDiscounts,
  };
}

export async function printInvoice(invoice: POSInvoice): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      // Write the print content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice #${invoice.name}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 12px;
              }
              .print-content {
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 4px;
                text-align: left;
              }
              .text-right {
                text-align: right;
              }
              .border-t {
                border-top: 1px solid #ddd;
              }
              .border-b {
                border-bottom: 1px solid #ddd;
              }
              .text-center {
                text-align: center;
              }
              .font-bold {
                font-weight: bold;
              }
              .mb-4 {
                margin-bottom: 16px;
              }
              .text-sm {
                font-size: 0.875rem;
              }
            </style>
          </head>
          <body>
            <div class="print-content">
              <!-- Company Header -->
              <div class="text-center mb-4">
                <h1 class="font-bold">${invoice.company}</h1>
                <div class="text-sm">${invoice.warehouse}</div>
              </div>

              <!-- Invoice Details -->
              <div class="mb-4">
                <table>
                  <tr>
                    <td>Invoice #:</td>
                    <td class="text-right">${invoice.name}</td>
                  </tr>
                  <tr>
                    <td>Date:</td>
                    <td class="text-right">${new Date(invoice.posting_date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Time:</td>
                    <td class="text-right">${invoice.posting_time}</td>
                  </tr>
                  <tr>
                    <td>Customer:</td>
                    <td class="text-right">${invoice.customer_name || invoice.customer}</td>
                  </tr>
                </table>
              </div>

              <!-- Items -->
              <div class="border-t border-b mb-4">
                <table>
                  <thead>
                    <tr class="border-b">
                      <th>Item</th>
                      <th class="text-right">Qty</th>
                      <th class="text-right">Price</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoice.items.map((item) => `
                      <tr class="border-b">
                        <td>${item.item_name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.rate)}</td>
                        <td class="text-right">${formatCurrency(item.amount)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Totals -->
              <div class="mb-4">
                <table>
                  <tr>
                    <td>Net Total:</td>
                    <td class="text-right">${formatCurrency(invoice.net_total)}</td>
                  </tr>
                  ${invoice.discount_amount > 0 ? `
                    <tr>
                      <td>Discount:</td>
                      <td class="text-right">- ${formatCurrency(invoice.discount_amount)}</td>
                    </tr>
                  ` : ''}
                  ${invoice.tax_amount > 0 ? `
                    <tr>
                      <td>Tax:</td>
                      <td class="text-right">${formatCurrency(invoice.tax_amount)}</td>
                    </tr>
                  ` : ''}
                  <tr class="border-t font-bold">
                    <td>Grand Total:</td>
                    <td class="text-right">${formatCurrency(invoice.grand_total)}</td>
                  </tr>
                </table>
              </div>

              <!-- Payments -->
              <div class="mb-4">
                <div class="font-bold">Payments</div>
                <table>
                  ${invoice.payments.map((payment) => `
                    <tr>
                      <td>${payment.mode_of_payment}:</td>
                      <td class="text-right">${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>

              <!-- Footer -->
              <div class="text-center text-sm">
                <div>Thank you for your business!</div>
                <div>${new Date().toLocaleString()}</div>
              </div>
            </div>
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export async function emailInvoice(invoice: POSInvoice, email: string) {
  // TODO: Implement email functionality
  console.log('Emailing invoice to:', email);
}

export async function downloadInvoice(invoice: POSInvoice) {
  // TODO: Implement download functionality
  console.log('Downloading invoice:', invoice.name);
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}
