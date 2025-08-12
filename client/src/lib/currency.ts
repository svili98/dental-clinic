/**
 * Currency formatting utilities for the dental clinic management system
 * Supports EUR, RSD, and CHF currencies with proper formatting
 */

export type Currency = 'EUR' | 'RSD' | 'CHF';

export interface CurrencyAmount {
  amount: number; // in smallest currency unit (cents, paras, etc.)
  currency: Currency;
}

export interface MultiCurrencyTotal {
  [key: string]: number; // currency code -> total amount in smallest unit
}

/**
 * Format a currency amount with proper symbol and positioning
 */
export function formatCurrency(amountInSmallestUnit: number, currency: Currency): string {
  const amount = (amountInSmallestUnit / 100).toFixed(2);
  
  switch (currency) {
    case 'EUR':
      return `€${amount}`;
    case 'RSD':
      return `${amount} дин`;
    case 'CHF':
      return `Fr ${amount}`;
    default:
      return `€${amount}`;
  }
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'RSD':
      return 'дин';
    case 'CHF':
      return 'Fr';
    default:
      return '€';
  }
}

/**
 * Get currency name for display
 */
export function getCurrencyName(currency: Currency): string {
  switch (currency) {
    case 'EUR':
      return 'Euro';
    case 'RSD':
      return 'Serbian Dinar';
    case 'CHF':
      return 'Swiss Franc';
    default:
      return 'Euro';
  }
}

/**
 * Calculate totals grouped by currency
 */
export function calculateMultiCurrencyTotal(
  items: Array<{ amount: number; currency: Currency }>
): MultiCurrencyTotal {
  return items.reduce((totals, item) => {
    const currency = item.currency || 'EUR';
    totals[currency] = (totals[currency] || 0) + item.amount;
    return totals;
  }, {} as MultiCurrencyTotal);
}

/**
 * Format multi-currency total as a compact string
 */
export function formatMultiCurrencyTotal(totals: MultiCurrencyTotal): string {
  const currencies = Object.keys(totals) as Currency[];
  
  if (currencies.length === 0) {
    return formatCurrency(0, 'EUR');
  }
  
  if (currencies.length === 1) {
    return formatCurrency(totals[currencies[0]], currencies[0]);
  }
  
  // Sort currencies by absolute amount (descending) for consistent display
  const sorted = currencies
    .filter(currency => totals[currency] !== 0)
    .sort((a, b) => Math.abs(totals[b]) - Math.abs(totals[a]));
  
  return sorted
    .map(currency => formatCurrency(totals[currency], currency))
    .join(' + ');
}

/**
 * Check if amount is valid for currency operations
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= 0;
}

/**
 * Convert display amount to smallest currency unit
 */
export function toSmallestUnit(displayAmount: string | number): number {
  const num = typeof displayAmount === 'string' ? parseFloat(displayAmount) : displayAmount;
  if (!isValidAmount(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Convert from smallest currency unit to display amount
 */
export function toDisplayAmount(smallestUnitAmount: number): number {
  return smallestUnitAmount / 100;
}

/**
 * Get the primary currency from a multi-currency total (highest amount)
 */
export function getPrimaryCurrency(totals: MultiCurrencyTotal): Currency {
  const currencies = Object.keys(totals) as Currency[];
  
  if (currencies.length === 0) return 'EUR';
  if (currencies.length === 1) return currencies[0];
  
  return currencies.reduce((primary, currency) => 
    totals[currency] > totals[primary] ? currency : primary
  );
}

/**
 * Default supported currencies list
 */
export const SUPPORTED_CURRENCIES: Array<{ value: Currency; label: string; symbol: string }> = [
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'RSD', label: 'RSD (дин)', symbol: 'дин' },
  { value: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' }
];