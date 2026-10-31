/**
 * Converts a numeric amount to English words for official receipts in Philippine Pesos.
 * e.g., 1500 -> "ONE THOUSAND FIVE HUNDRED PESOS ONLY"
 * e.g., 2099.50 -> "TWO THOUSAND NINETY-NINE PESOS AND 50/100 ONLY"
 */

const ONES = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
];

const TENS = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY',
];

function convertThreeDigit(num: number): string {
  let result = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    result += ONES[hundreds] + ' HUNDRED ';
  }

  if (remainder > 0) {
    if (remainder < 20) {
      result += ONES[remainder] + ' ';
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result += TENS[ten] + (one > 0 ? '-' + ONES[one] : '') + ' ';
    }
  }

  return result.trim();
}

export function numberToWordsInPeso(amount: number): string {
  if (amount === 0) return 'ZERO PESOS ONLY';

  const rounded = Math.round(amount * 100) / 100;
  const wholePart = Math.floor(rounded);
  const centavos = Math.round((rounded - wholePart) * 100);

  if (wholePart === 0 && centavos > 0) {
    return `${centavos}/100 CENTAVOS ONLY`;
  }

  let words = '';
  const billions = Math.floor(wholePart / 1_000_000_000);
  const millions = Math.floor((wholePart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((wholePart % 1_000_000) / 1000);
  const remainder = wholePart % 1000;

  if (billions > 0) {
    words += convertThreeDigit(billions) + ' BILLION ';
  }
  if (millions > 0) {
    words += convertThreeDigit(millions) + ' MILLION ';
  }
  if (thousands > 0) {
    words += convertThreeDigit(thousands) + ' THOUSAND ';
  }
  if (remainder > 0) {
    words += convertThreeDigit(remainder) + ' ';
  }

  words = words.trim();

  if (centavos > 0) {
    return `${words} PESOS AND ${centavos}/100 ONLY`.toUpperCase();
  }

  return `${words} PESOS ONLY`.toUpperCase();
}

export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
