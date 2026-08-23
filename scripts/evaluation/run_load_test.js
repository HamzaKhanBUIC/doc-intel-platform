/**
 * Enterprise Load & Concurrency Stress Test Harness
 * Simulates high-throughput concurrent batch ingestion, profiling latency and memory.
 */

import { DocumentServer } from '../../src/backend/server.js';

async function runLoadTest() {
  console.log('=== ENTERPRISE CONCURRENT LOAD & STRESS TEST ===\n');

  const server = new DocumentServer(5999, './data/test_storage');
  await server.start();
  const baseUrl = 'http://localhost:5999';

  const CONCURRENT_REQUESTS = 100;
  console.log(`Firing ${CONCURRENT_REQUESTS} concurrent document ingestion uploads...`);

  const startTime = performance.now();
  const promises = [];

  for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
    const invoiceText = `%PDF-1.4
Vendor Supplier Alpha ${i}
Tax ID: US-${90000000 + i}
Invoice #: LOAD-INV-${i}
Date: 2026-08-24
Widget Item ${i} 2 EA $50.00 $100.00
Subtotal: $100.00
Tax: $8.00
Total: $108.00
%%EOF`;

    promises.push(
      fetch(`${baseUrl}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'x-filename': `Load_Invoice_${i}.pdf`,
          'content-type': 'application/pdf'
        },
        body: Buffer.from(invoiceText)
      }).then(r => r.json())
    );
  }

  const results = await Promise.all(promises);
  const totalDuration = performance.now() - startTime;

  const successful = results.filter(r => r.success).length;
  const metricsRes = await fetch(`${baseUrl}/api/metrics`);
  const metrics = await metricsRes.json();

  console.log('--------------------------------------------------');
  console.log(`Load Test Summary: ${successful}/${CONCURRENT_REQUESTS} Completed Successfully`);
  console.log(`Total Wall Duration: ${Math.round(totalDuration)}ms`);
  console.log(`Effective Throughput: ${Math.round((CONCURRENT_REQUESTS / (totalDuration / 1000)) * 10) / 10} docs/sec`);
  console.log(`Processing Latency: Avg ${metrics.latency.avgMs}ms | p50 ${metrics.latency.p50Ms}ms | p90 ${metrics.latency.p90Ms}ms | p99 ${metrics.latency.p99Ms}ms`);
  console.log(`Memory Heap Used: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`);
  console.log('--------------------------------------------------\n');

  await server.stop();
}

runLoadTest();
