import test from 'node:test';
import assert from 'node:assert';
import { ExtractionEngine } from '../../src/extraction/extractionEngine.js';

test('ExtractionEngine - Benchmark accuracy across multiple document variants', async () => {
  const extractor = new ExtractionEngine();

  // Test Case 1: Standard Digital Clean Invoice
  const cleanDoc = `Acme Industrial Tools LLC
Tax ID: US-88990011
Bill To: Frontier Engineering
Invoice #: INV-88120
Date: 2026-08-01
Heavy Duty Torque Wrench 2 $150.00 $300.00
Hex Key Multi-Pack 10 $15.00 $150.00
Subtotal: $450.00
Tax: $36.00
Total: $486.00`;

  const ext1 = await extractor.extractDocument(cleanDoc, 'doc_bench_01', 'INVOICE');
  assert.strictEqual(ext1.invoiceNumber.value, 'INV-88120');
  assert.strictEqual(ext1.subtotal, 450.00);
  assert.strictEqual(ext1.taxAmount, 36.00);
  assert.strictEqual(ext1.totalAmount, 486.00);
  assert.strictEqual(ext1.lineItems.length, 2);

  // Test Case 2: Multi-Item Table Format
  const multiItemDoc = `Apex Logistics Solutions
Bill To: Quantum Retailers
INV-99201
Date: 2026-07-20
Pallet Storage Tier A 5 $50.00 $250.00
Cross-Dock Transfer 2 $120.00 $240.00
Packaging Material Kit 1 $60.00 $60.00
Subtotal: $550.00
Tax: $44.00
Total: $594.00`;

  const ext2 = await extractor.extractDocument(multiItemDoc, 'doc_bench_02', 'INVOICE');
  assert.strictEqual(ext2.subtotal, 550.00);
  assert.strictEqual(ext2.totalAmount, 594.00);
  assert.strictEqual(ext2.lineItems.length, 3);
  assert.ok(ext2.lineItems.every(item => item.confidence >= 0.90));
});
