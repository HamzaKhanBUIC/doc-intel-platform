import test from 'node:test';
import assert from 'node:assert';
import { QuickBooksAdapter } from '../../src/export/quickbooksAdapter.js';
import { XeroAdapter } from '../../src/export/xeroAdapter.js';
import { NetSuiteAdapter } from '../../src/export/netsuiteAdapter.js';
import { SapAdapter } from '../../src/export/sapAdapter.js';

const mockDoc = {
  id: 'doc_erp_test',
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  extractedData: {
    invoiceNumber: { value: 'INV-88991' },
    invoiceDate: { value: '2026-08-20' },
    dueDate: { value: '2026-09-20' },
    vendorName: { value: 'Acme Industrial Supplies Inc.' },
    vendorTaxId: { value: 'US-94829103' },
    currency: 'USD',
    subtotal: 1000.00,
    taxAmount: 80.00,
    taxRate: 8.0,
    totalAmount: 1080.00,
    lineItems: [
      { id: '1', description: 'Hydraulic Valve', quantity: 10, unitPrice: 100.00, amount: 1000.00 }
    ]
  }
};

test('QuickBooksAdapter - Generates valid QBO Bill schema', () => {
  const adapter = new QuickBooksAdapter();
  const res = adapter.exportToBill(mockDoc);

  assert.ok(res.Bill);
  assert.strictEqual(res.Bill.DocNumber, 'INV-88991');
  assert.strictEqual(res.Bill.TotalAmt, 1080.00);
  assert.strictEqual(res.Bill.Line.length, 1);
  assert.strictEqual(res.Bill.Line[0].Amount, 1000.00);
});

test('XeroAdapter - Generates valid Xero ACCPAY schema', () => {
  const adapter = new XeroAdapter();
  const res = adapter.exportToInvoice(mockDoc);

  assert.ok(res.Invoice);
  assert.strictEqual(res.Invoice.Type, 'ACCPAY');
  assert.strictEqual(res.Invoice.InvoiceNumber, 'INV-88991');
  assert.strictEqual(res.Invoice.Total, 1080.00);
  assert.strictEqual(res.Invoice.Contact.Name, 'Acme Industrial Supplies Inc.');
});

test('NetSuiteAdapter - Generates valid NetSuite VendorBill schema', () => {
  const adapter = new NetSuiteAdapter();
  const res = adapter.exportToVendorBill(mockDoc);

  assert.ok(res.vendorBill);
  assert.strictEqual(res.vendorBill.tranId, 'INV-88991');
  assert.strictEqual(res.vendorBill.userTotal, 1080.00);
  assert.strictEqual(res.vendorBill.itemList.item.length, 1);
});

test('SapAdapter - Generates valid SAP S/4HANA BAPI schema', () => {
  const adapter = new SapAdapter();
  const res = adapter.exportToSapInvoice(mockDoc);

  assert.ok(res.HEADERDATA);
  assert.strictEqual(res.HEADERDATA.REF_DOC_NO, 'INV-88991');
  assert.strictEqual(res.HEADERDATA.GROSS_AMOUNT, 1080.00);
  assert.strictEqual(res.ITEMDATA.length, 1);
  assert.strictEqual(res.ITEMDATA[0].ITEM_AMOUNT, 1000.00);
});
