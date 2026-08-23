import test from 'node:test';
import assert from 'node:assert';
import { CurrencyNormalizer } from '../../src/normalization/currencyNormalizer.js';
import { DateParser } from '../../src/normalization/dateParser.js';

test('CurrencyNormalizer - Symbol Detection & European Decimal Parsing', () => {
  const norm = new CurrencyNormalizer();

  assert.strictEqual(norm.detectCurrency('Total: €1.450,20'), 'EUR');
  assert.strictEqual(norm.detectCurrency('Amount: £250.00'), 'GBP');
  assert.strictEqual(norm.detectCurrency('Grand Total: $1,200.50'), 'USD');

  // European decimal parsing (1.234,56 -> 1234.56)
  assert.strictEqual(norm.parseAmount('1.234,56'), 1234.56);
  assert.strictEqual(norm.parseAmount('€ 4.500,00'), 4500.00);

  // Standard US decimal parsing (1,234.56 -> 1234.56)
  assert.strictEqual(norm.parseAmount('$1,234.56'), 1234.56);
});

test('DateParser - Multi-Locale & Textual Month Normalization', () => {
  const parser = new DateParser();

  // ISO Format
  assert.strictEqual(parser.normalizeDate('2026-08-24'), '2026-08-24');

  // US Format (MM/DD/YYYY)
  assert.strictEqual(parser.normalizeDate('08/24/2026'), '2026-08-24');

  // European Format (DD/MM/YYYY)
  assert.strictEqual(parser.normalizeDate('24/08/2026'), '2026-08-24');

  // Textual English & French
  assert.strictEqual(parser.normalizeDate('August 15, 2026'), '2026-08-15');
  assert.strictEqual(parser.normalizeDate('15 Aug 2026'), '2026-08-15');
});
