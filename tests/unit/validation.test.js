import test from 'node:test';
import assert from 'node:assert';
import { ValidationEngine } from '../../src/validation/validationEngine.js';

test('ValidationEngine - Passes on 100% accurate arithmetic', () => {
  const validator = new ValidationEngine();
  const invoiceData = {
    documentId: 'doc_val_01',
    invoiceNumber: { value: 'INV-100', confidence: 0.98 },
    invoiceDate: { value: '2026-08-15', confidence: 0.95 },
    vendorName: { value: 'Global Supply Corp', confidence: 0.96 },
    lineItems: [
      { id: '1', description: 'Item A', quantity: 2, unitPrice: 50.00, amount: 100.00 },
      { id: '2', description: 'Item B', quantity: 1, unitPrice: 200.00, amount: 200.00 }
    ],
    subtotal: 300.00,
    taxAmount: 24.00,
    discountAmount: 0.00,
    shippingAmount: 0.00,
    totalAmount: 324.00
  };

  const res = validator.validate(invoiceData, []);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.arithmeticPassed, true);
  assert.strictEqual(res.errors.length, 0);
});

test('ValidationEngine - Catches Line Item multiplication error', () => {
  const validator = new ValidationEngine();
  const invoiceData = {
    documentId: 'doc_val_02',
    invoiceNumber: { value: 'INV-101', confidence: 0.98 },
    invoiceDate: { value: '2026-08-15', confidence: 0.95 },
    vendorName: { value: 'Global Supply Corp', confidence: 0.96 },
    lineItems: [
      { id: '1', description: 'Item A', quantity: 3, unitPrice: 50.00, amount: 120.00 } // Should be 150.00
    ],
    subtotal: 120.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    shippingAmount: 0.00,
    totalAmount: 120.00
  };

  const res = validator.validate(invoiceData, []);
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.arithmeticPassed, false);
  assert.ok(res.errors.some(e => e.message.includes('Line item \'Item A\' arithmetic mismatch')));
});

test('ValidationEngine - Catches Grand Total mismatch', () => {
  const validator = new ValidationEngine();
  const invoiceData = {
    documentId: 'doc_val_03',
    invoiceNumber: { value: 'INV-102', confidence: 0.98 },
    invoiceDate: { value: '2026-08-15', confidence: 0.95 },
    vendorName: { value: 'Global Supply Corp', confidence: 0.96 },
    lineItems: [
      { id: '1', description: 'Item A', quantity: 1, unitPrice: 100.00, amount: 100.00 }
    ],
    subtotal: 100.00,
    taxAmount: 10.00,
    discountAmount: 0.00,
    shippingAmount: 0.00,
    totalAmount: 125.00 // Intentionally incorrect (should be 110.00)
  };

  const res = validator.validate(invoiceData, []);
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.arithmeticPassed, false);
  assert.ok(res.errors.some(e => e.field === 'totalAmount'));
});

test('ValidationEngine - Detects duplicate vendor invoice numbers', () => {
  const validator = new ValidationEngine();
  const existingDocs = [
    {
      id: 'doc_prior_01',
      extractedData: {
        invoiceNumber: { value: 'INV-9999' },
        vendorName: { value: 'Acme Logistics' }
      }
    }
  ];

  const incomingInvoice = {
    documentId: 'doc_new_02',
    invoiceNumber: { value: 'INV-9999', confidence: 0.95 },
    invoiceDate: { value: '2026-08-15', confidence: 0.95 },
    vendorName: { value: 'Acme Logistics', confidence: 0.95 },
    lineItems: [{ id: '1', description: 'Fee', quantity: 1, unitPrice: 50.00, amount: 50.00 }],
    subtotal: 50.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    shippingAmount: 0.00,
    totalAmount: 50.00
  };

  const res = validator.validate(incomingInvoice, existingDocs);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errors.some(e => e.message.includes('Duplicate invoice detected')));
});
