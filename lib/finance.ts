export type Sale = {
  id: string; order: string; product: string; sku: string; platform: "Amazon" | "Flipkart";
  date: string; units: number; revenue: number; productCost: number; marketplaceFee: number;
  shipping: number; ads: number; returns: number;
};

export function calculateSaleProfit(sale: Sale) {
  return sale.revenue - sale.productCost - sale.marketplaceFee - sale.shipping - sale.ads - sale.returns;
}

export function calculateSummary(sales: Sale[]) {
  const revenue = sales.reduce((s, x) => s + x.revenue, 0);
  const productCost = sales.reduce((s, x) => s + x.productCost, 0);
  const marketplaceFees = sales.reduce((s, x) => s + x.marketplaceFee, 0);
  const shipping = sales.reduce((s, x) => s + x.shipping, 0);
  const ads = sales.reduce((s, x) => s + x.ads, 0);
  const returns = sales.reduce((s, x) => s + x.returns, 0);
  const profit = revenue - productCost - marketplaceFees - shipping - ads - returns;
  return { revenue, productCost, marketplaceFees, shipping, ads, returns, profit, margin: revenue ? profit / revenue * 100 : 0 };
}

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
