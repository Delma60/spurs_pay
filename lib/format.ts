// Format minor units (kobo/cents) into a display string with currency symbol.
const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GHS: "₵", KES: "KSh", ZAR: "R" };

export function formatAmount(minor: number, currency: string): string {
  const symbol = SYMBOLS[currency] ?? currency + " ";
  return symbol + (minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
