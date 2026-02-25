/**
 * Format a price in grosze (PLN minor units) to a PLN currency string.
 * Example: formatPrice(9900) → "99 zł"
 */
export const formatPrice = (grosze: number): string =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(grosze / 100);
