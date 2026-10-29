import { Currency } from "../types";

export const EXCHANGE_RATES: Record<Currency, number> = {
  ALL: 1,
  EUR: 100, // Peace Corps Albania standard baseline (approx 100 ALL / EUR)
  USD: 92,  // Approx 92 ALL / USD
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ALL: "L",
  EUR: "€",
  USD: "$",
};

/**
 * Formats an amount based on currency.
 * Albanian Lekë is formatted with integer precision and trailing ' L', e.g. "1,500 L".
 * EUR and USD formatted with standard 2 decimals, e.g. "€15.00", "$15.00".
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "ALL",
  showSign: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const signPrefix = showSign ? (isNegative ? "-" : "+") : isNegative ? "-" : "";

  if (currency === "ALL") {
    const formatted = Math.round(absAmount).toLocaleString("en-US");
    return `${signPrefix}${formatted} L`;
  }

  if (currency === "EUR") {
    const formatted = absAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${signPrefix}€${formatted}`;
  }

  if (currency === "USD") {
    const formatted = absAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${signPrefix}$${formatted}`;
  }

  return `${signPrefix}${absAmount.toLocaleString("en-US")} ${currency}`;
}

/**
 * Converts any currency amount to ALL baseline.
 */
export function convertToALL(amount: number, currency: Currency): number {
  if (currency === "ALL") return Math.round(amount);
  const rate = EXCHANGE_RATES[currency] || 1;
  return Math.round(amount * rate);
}

/**
 * Converts ALL baseline amount to requested currency.
 */
export function convertFromALL(amountALL: number, currency: Currency): number {
  if (currency === "ALL") return Math.round(amountALL);
  const rate = EXCHANGE_RATES[currency] || 1;
  return Number((amountALL / rate).toFixed(2));
}

