import test from 'node:test';
import assert from 'node:assert';
import { DocumentServer } from '../../src/backend/server.js';

test('Integration - Full Document Lifecycle via REST API', async () => {
  const serverInstance = new DocumentServer(4567, './data/test_storage');
  await serverInstance.start();
  const baseUrl = 'http://localhost:4567';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, 'healthy');

    // 2. Fetch Review Queue
    const queueRes = await fetch(`${baseUrl}/api/review-queue`);
    assert.strictEqual(queueRes.status, 200);
    const queueJson = await queueRes.json();
    assert.ok(Array.isArray(queueJson.queue));

    // 3. Document Ingestion Upload
    const sampleInvoiceText = `%PDF-1.4
Acme Supplies Corp
Tax ID: US-11223344
Bill To: Beta Corp
Invoice #: INV-40401
Date: 2026-08-10
Widget Alpha 2 $100.00 $200.00
Subtotal: $200.00
Tax: $16.00
Total: $216.00
%%EOF`;

    const uploadRes = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'x-filename': 'Beta_Invoice_40401.pdf',
        'content-type': 'application/pdf'
      },
      body: Buffer.from(sampleInvoiceText)
    });

    assert.strictEqual(uploadRes.status, 201);
    const uploadJson = await uploadRes.json();
    assert.ok(uploadJson.document);
    assert.strictEqual(uploadJson.document.filename, 'Beta_Invoice_40401.pdf');
    assert.strictEqual(uploadJson.document.status, 'APPROVED');

    // 4. Duplicate Upload Rejection
    const duplicateRes = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'x-filename': 'Beta_Invoice_40401.pdf',
        'content-type': 'application/pdf'
      },
      body: Buffer.from(sampleInvoiceText)
    });
    assert.strictEqual(duplicateRes.status, 409);

    // 5. Submit Manual Review Correction
    const targetDoc = queueJson.queue[0];
    if (targetDoc) {
      const reviewRes = await fetch(`${baseUrl}/api/documents/${targetDoc.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          extractedData: { totalAmount: 1568.00 }, // Correct the total
          note: 'Corrected total discrepancy in automated test'
        })
      });
      assert.strictEqual(reviewRes.status, 200);
      const reviewJson = await reviewRes.json();
      assert.strictEqual(reviewJson.document.status, 'APPROVED');
    }

    // 6. Reports Summary
    const reportRes = await fetch(`${baseUrl}/api/reports/summary`);
    assert.strictEqual(reportRes.status, 200);
    const reportJson = await reportRes.json();
    assert.ok(reportJson.totalSpend > 0);

    // 7. CSV Export
    const exportRes = await fetch(`${baseUrl}/api/export?format=csv`);
    assert.strictEqual(exportRes.status, 200);
    const csvText = await exportRes.text();
    assert.ok(csvText.includes('Document ID,Status,Invoice Number'));
  } finally {
    await serverInstance.stop();
  }
});
