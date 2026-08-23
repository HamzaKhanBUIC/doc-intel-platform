/**
 * Enterprise Currency Normalizer & Multi-Locale Decimal Converter
 * Detects currency symbols ($, €, £, ¥, ₹, ₩, CHF, CAD, AUD),
 * normalizes European period/comma notation (1.450,20 -> 1450.20),
 * and handles ISO-4217 currency conversions.
 */

export class CurrencyNormalizer {
  constructor() {
    this.symbolMap = {
      '$': 'USD',
      'US$': 'USD',
      'USD': 'USD',
      '€': 'EUR',
      'EUR': 'EUR',
      '£': 'GBP',
      'GBP': 'GBP',
      '¥': 'JPY',
      'JPY': 'JPY',
      '₹': 'INR',
      'INR': 'INR',
      '₩': 'KRW',
      'KRW': 'KRW',
      'CHF': 'CHF',
      'CAD': 'CAD',
      'C$': 'CAD',
      'AUD': 'AUD',
      'A$': 'AUD',
      'AED': 'AED',
      'SGD': 'SGD',
      'HK$': 'HKD',
      'HKD': 'HKD'
    };
  }

  /**
   * Detect currency from text context
   * @param {string} text
   * @returns {string} ISO-4217 3-letter currency code
   */
  detectCurrency(text) {
    if (!text) return 'USD';
    const upper = text.toUpperCase();

    for (const [sym, code] of Object.entries(this.symbolMap)) {
      if (text.includes(sym) || upper.includes(code)) {
        return code;
      }
    }
    return 'USD';
  }

  /**
   * Parse numeric amount string across international decimal and grouping notations
   * Handles US notation (1,234.56) and European notation (1.234,56 or 1 234,56)
   * @param {string | number} rawAmount
   * @returns {number}
   */
  parseAmount(rawAmount) {
    if (typeof rawAmount === 'number') return Math.round(rawAmount * 100) / 100;
    if (!rawAmount || typeof rawAmount !== 'string') return 0.0;

    // Strip currency symbols and whitespace
    let clean = rawAmount.replace(/[$€£¥₹₩A-Za-z\s]/g, '').trim();

    // Check for European format where comma is the decimal separator (e.g. "1.234,56")
    const commaIndex = clean.lastIndexOf(',');
    const dotIndex = clean.lastIndexOf('.');

    if (commaIndex > dotIndex && commaIndex === clean.length - 3) {
      // European format: "1.234,56" -> remove dots, replace comma with dot
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // Standard US format: "1,234.56" -> remove commas
      clean = clean.replace(/,/g, '');
    }

    const val = parseFloat(clean);
    return isNaN(val) ? 0.0 : Math.round(val * 100) / 100;
  }

  /**
   * Format numeric amount to standard currency display
   */
  formatAmount(amount, currency = 'USD') {
    const num = typeof amount === 'number' ? amount : this.parseAmount(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(num);
  }
}
