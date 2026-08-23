import test from 'node:test';
import assert from 'node:assert';
import { TableExtractor } from '../../src/extraction/tableExtractor.js';

test('TableExtractor - Multi-Column Table Extraction with UOM', () => {
  const extractor = new TableExtractor();

  const multiTableText = `Delta Precision Machine Tools Corp
Bill To: Acme Mfg
Invoice Number: INV-77291
Date: 2026-08-20

Description Qty UOM Unit Price Amount
Heavy Duty CNC Drill Bit 5 EA $40.00 $200.00
Coolant Fluid 50L Drum 2 BOX $150.00 $300.00
Calibration Labor Services 4 HRS $75.00 $300.00

Subtotal: $800.00
Tax: $64.00
Total: $864.00`;

  const items = extractor.extractTableItems(multiTableText, 'doc_tbl_01');
  assert.strictEqual(items.length, 3);
  assert.strictEqual(items[0].description, 'Heavy Duty CNC Drill Bit');
  assert.strictEqual(items[0].quantity, 5);
  assert.strictEqual(items[0].unitOfMeasure, 'EA');
  assert.strictEqual(items[0].unitPrice, 40.00);
  assert.strictEqual(items[0].amount, 200.00);

  assert.strictEqual(items[1].description, 'Coolant Fluid 50L Drum');
  assert.strictEqual(items[1].unitOfMeasure, 'BOX');

  assert.strictEqual(items[2].description, 'Calibration Labor Services');
  assert.strictEqual(items[2].unitOfMeasure, 'HRS');
  assert.strictEqual(items[2].amount, 300.00);
});
