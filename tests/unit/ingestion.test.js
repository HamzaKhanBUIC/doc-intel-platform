import test from 'node:test';
import assert from 'node:assert';
import { IngestionService } from '../../src/ingestion/ingestionService.js';

test('IngestionService - Valid PDF Ingestion & Hashing', async () => {
  const service = new IngestionService('./data/test_storage');
  const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF');
  
  const result = await service.ingestDocument(dummyPdf, 'invoice_001.pdf', 'application/pdf');
  
  assert.ok(result.id.startsWith('doc_'));
  assert.strictEqual(result.filename, 'invoice_001.pdf');
  assert.strictEqual(result.mimeType, 'application/pdf');
  assert.strictEqual(result.sha256.length, 64);
  assert.strictEqual(result.documentType, 'INVOICE');
});

test('IngestionService - Rejects empty file buffer', async () => {
  const service = new IngestionService('./data/test_storage');
  await assert.rejects(
    async () => await service.ingestDocument(Buffer.alloc(0), 'empty.pdf', 'application/pdf'),
    /INGESTION_ERROR: Empty file buffer/
  );
});

test('IngestionService - Rejects spoofed or unsupported MIME type', async () => {
  const service = new IngestionService('./data/test_storage');
  const maliciousExe = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
  
  await assert.rejects(
    async () => await service.ingestDocument(maliciousExe, 'malware.exe', 'application/x-msdownload'),
    /INGESTION_ERROR: Unsupported or spoofed MIME/
  );
});

test('IngestionService - Correctly categorizes Receipts and Purchase Orders by heuristic', async () => {
  const service = new IngestionService('./data/test_storage');
  const pdfBuffer = Buffer.from('%PDF-1.4 sample content %%EOF');
  
  const receiptDoc = await service.ingestDocument(pdfBuffer, 'fuel_receipt_tx102.pdf', 'application/pdf');
  assert.strictEqual(receiptDoc.documentType, 'RECEIPT');

  const poDoc = await service.ingestDocument(pdfBuffer, 'purchase_order_998.pdf', 'application/pdf');
  assert.strictEqual(poDoc.documentType, 'PURCHASE_ORDER');
});
