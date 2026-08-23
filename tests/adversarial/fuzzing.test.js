import test from 'node:test';
import assert from 'node:assert';
import { IterationEngine } from '../../src/iteration/iterationEngine.js';

test('Fuzzing - OCR Character Transposition Perturbation Engine', async () => {
  const engine = new IterationEngine();

  const sampleCorpus = [
    {
      id: 'fuzz_01',
      name: 'Fuzz_Invoice',
      type: 'INVOICE',
      rawText: `Acme Industrial Supplies Inc.
Invoice #: INV-5501
Date: 2026-08-24
Hydraulic Valve 2 EA $50.00 $100.00
Subtotal: $100.00
Tax: $8.00
Total: $108.00`,
      groundTruth: {
        invoiceNumber: 'INV-5501',
        vendorName: 'Acme Industrial Supplies Inc.',
        invoiceDate: '2026-08-24',
        lineItemCount: 1,
        totalAmount: 108.00
      }
    }
  ];

  // Test Round with 2% Synthetic Noise
  const res = await engine.runIterationRound(sampleCorpus, 0.02);
  assert.strictEqual(res.totalDocuments, 1);
  assert.ok(res.latency.avgMs < 100);
  assert.ok(res.overallF1Score >= 75.0);
});
