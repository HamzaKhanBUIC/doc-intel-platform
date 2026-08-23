import http from 'http';
import fs from 'fs';
import path from 'path';
import { IngestionService } from '../ingestion/ingestionService.js';
import { ExtractionEngine } from '../extraction/extractionEngine.js';
import { ValidationEngine } from '../validation/validationEngine.js';
import { CategorizationService } from '../categorization/categorizationService.js';
import { ReportingService } from '../reporting/reportingService.js';
import { VendorMatcher } from '../normalization/vendorMatcher.js';
import { MetricsLogger } from '../telemetry/metricsLogger.js';
import { QuickBooksAdapter } from '../export/quickbooksAdapter.js';
import { XeroAdapter } from '../export/xeroAdapter.js';
import { NetSuiteAdapter } from '../export/netsuiteAdapter.js';
import { SapAdapter } from '../export/sapAdapter.js';

export class DocumentServer {
  constructor(port = 3000, storageDir = './data/storage') {
    this.port = port;
    this.storageDir = storageDir;
    this.ingestion = new IngestionService(storageDir);
    this.extractor = new ExtractionEngine();
    this.validator = new ValidationEngine();
    this.categorizer = new CategorizationService();
    this.reporter = new ReportingService();
    this.vendorMatcher = new VendorMatcher();
    this.metrics = new MetricsLogger();
    this.qboAdapter = new QuickBooksAdapter();
    this.xeroAdapter = new XeroAdapter();
    this.netsuiteAdapter = new NetSuiteAdapter();
    this.sapAdapter = new SapAdapter();

    this.documents = [];
    this.initSeedData();
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  initSeedData() {
    const doc1 = {
      id: 'doc_seed_001',
      filename: 'Acme_Industrial_INV98421.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 148291,
      sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      pageCount: 1,
      uploadedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'APPROVED',
      documentType: 'INVOICE',
      category: 'Cost of Goods Sold (COGS) - Supplies',
      extractedData: {
        documentId: 'doc_seed_001',
        invoiceNumber: { value: 'INV-98421', rawValue: 'INV-98421', confidence: 0.99, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.65, 0.12, 0.88, 0.16], extractionMethod: 'NATIVE_STREAM', confidence: 0.99 } },
        invoiceDate: { value: '2026-08-15', rawValue: '2026-08-15', confidence: 0.98, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.65, 0.17, 0.88, 0.21], extractionMethod: 'NATIVE_STREAM', confidence: 0.98 } },
        dueDate: { value: '2026-09-15', rawValue: '2026-09-15', confidence: 0.95, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.65, 0.22, 0.88, 0.26], extractionMethod: 'NATIVE_STREAM', confidence: 0.95 } },
        vendorName: { value: 'Acme Industrial Supplies Inc.', rawValue: 'Acme Industrial Supplies Inc.', confidence: 0.97, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.08, 0.08, 0.45, 0.14], extractionMethod: 'NATIVE_STREAM', confidence: 0.97 } },
        vendorTaxId: { value: 'US-94829103', rawValue: 'US-94829103', confidence: 0.96, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.08, 0.15, 0.45, 0.18], extractionMethod: 'NATIVE_STREAM', confidence: 0.96 } },
        customerName: { value: 'Global Freight & Logistics Corp.', rawValue: 'Global Freight & Logistics Corp.', confidence: 0.94, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.08, 0.25, 0.45, 0.32], extractionMethod: 'NATIVE_STREAM', confidence: 0.94 } },
        lineItems: [
          { id: 'item_1', description: 'Industrial Hydraulic Valve Assembly', quantity: 10, unitPrice: 50.00, amount: 500.00, confidence: 0.98, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.08, 0.42, 0.92, 0.46], extractionMethod: 'NATIVE_STREAM', confidence: 0.98 } },
          { id: 'item_2', description: 'High-Pressure Hose Fitting 20mm', quantity: 5, unitPrice: 140.00, amount: 700.00, confidence: 0.97, provenance: { documentId: 'doc_seed_001', pageNumber: 1, boundingBox: [0.08, 0.47, 0.92, 0.51], extractionMethod: 'NATIVE_STREAM', confidence: 0.97 } }
        ],
        currency: 'USD',
        subtotal: 1200.00,
        taxAmount: 96.00,
        taxRate: 8.0,
        discountAmount: 0.00,
        shippingAmount: 0.00,
        totalAmount: 1296.00
      },
      validationResult: { isValid: true, arithmeticPassed: true, errors: [] },
      auditTrail: [
        { timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'SYSTEM_INGEST', action: 'INGEST', note: 'Uploaded successfully' },
        { timestamp: new Date(Date.now() - 3590000).toISOString(), actor: 'SYSTEM_VALIDATOR', action: 'AUTO_APPROVE', note: 'All math checks passed (100% valid)' }
      ]
    };

    const doc2 = {
      id: 'doc_seed_002',
      filename: 'Pacific_Freight_BOL_77201.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 98124,
      sha256: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef0',
      pageCount: 1,
      uploadedAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'REVIEW_REQUIRED',
      documentType: 'INVOICE',
      category: 'Logistics & Freight',
      extractedData: {
        documentId: 'doc_seed_002',
        invoiceNumber: { value: 'PAC-77201', rawValue: 'PAC-77201', confidence: 0.94, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.65, 0.12, 0.88, 0.16], extractionMethod: 'NATIVE_STREAM', confidence: 0.94 } },
        invoiceDate: { value: '2026-08-18', rawValue: '2026-08-18', confidence: 0.92, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.65, 0.17, 0.88, 0.21], extractionMethod: 'NATIVE_STREAM', confidence: 0.92 } },
        vendorName: { value: 'Pacific Overland Logistics LLC', rawValue: 'Pacific Overland Logistics LLC', confidence: 0.95, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.08, 0.08, 0.45, 0.14], extractionMethod: 'NATIVE_STREAM', confidence: 0.95 } },
        customerName: { value: 'Global Freight & Logistics Corp.', rawValue: 'Global Freight & Logistics Corp.', confidence: 0.90, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.08, 0.25, 0.45, 0.32], extractionMethod: 'NATIVE_STREAM', confidence: 0.90 } },
        lineItems: [
          { id: 'item_1', description: 'Long-Haul Pallet Drayage (LAX -> PHX)', quantity: 4, unitPrice: 350.00, amount: 1400.00, confidence: 0.92, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.08, 0.42, 0.92, 0.46], extractionMethod: 'NATIVE_STREAM', confidence: 0.92 } },
          { id: 'item_2', description: 'Fuel Surcharge Accessorial (12%)', quantity: 1, unitPrice: 168.00, amount: 168.00, confidence: 0.90, provenance: { documentId: 'doc_seed_002', pageNumber: 1, boundingBox: [0.08, 0.47, 0.92, 0.51], extractionMethod: 'NATIVE_STREAM', confidence: 0.90 } }
        ],
        currency: 'USD',
        subtotal: 1568.00,
        taxAmount: 0.00,
        taxRate: 0.0,
        discountAmount: 0.00,
        shippingAmount: 0.00,
        totalAmount: 1650.00
      },
      validationResult: {
        isValid: false,
        arithmeticPassed: false,
        errors: [
          { field: 'totalAmount', message: 'Grand total mismatch: Subtotal ($1,568.00) + Tax ($0.00) = $1,568.00, but extracted Total is $1,650.00 (Difference: $82.00).', severity: 'ERROR' }
        ]
      },
      auditTrail: [
        { timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'SYSTEM_INGEST', action: 'INGEST', note: 'Uploaded successfully' },
        { timestamp: new Date(Date.now() - 1790000).toISOString(), actor: 'SYSTEM_VALIDATOR', action: 'FLAG_REVIEW', note: 'Routed to Review Queue: Arithmetic mismatch' }
      ]
    };

    this.documents.push(doc1, doc2);
    this.metrics.incrementCounter('documentsIngested');
    this.metrics.incrementCounter('documentsIngested');
    this.metrics.incrementCounter('documentsAutoApproved');
    this.metrics.incrementCounter('documentsReviewRequired');
  }

  async handleRequest(req, res) {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-filename');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const startTime = performance.now();

    try {
      if (pathname === '/api/health') {
        this.sendJson(res, 200, { status: 'healthy', timestamp: new Date().toISOString(), documentsCount: this.documents.length });
        return;
      }

      if (pathname === '/api/metrics') {
        const format = parsedUrl.searchParams.get('format');
        if (format === 'prometheus') {
          res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
          res.end(this.metrics.getPrometheusMetrics());
          return;
        }
        this.sendJson(res, 200, this.metrics.getMetricsSummary());
        return;
      }

      if (pathname === '/api/vendors' && method === 'GET') {
        this.sendJson(res, 200, { vendors: this.vendorMatcher.getAllVendors() });
        return;
      }

      if (pathname === '/api/documents' && method === 'GET') {
        const statusFilter = parsedUrl.searchParams.get('status');
        let results = this.documents;
        if (statusFilter) {
          results = results.filter(d => d.status === statusFilter);
        }
        this.sendJson(res, 200, { documents: results, total: results.length });
        return;
      }

      if (pathname === '/api/review-queue' && method === 'GET') {
        const queue = this.documents.filter(d => d.status === 'REVIEW_REQUIRED');
        this.sendJson(res, 200, { queue, count: queue.length });
        return;
      }

      if (pathname.startsWith('/api/documents/') && pathname.endsWith('/review') && method === 'POST') {
        const docId = pathname.split('/')[3];
        const body = await this.readJsonBody(req);
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) {
          this.sendJson(res, 404, { error: 'Document ' + docId + ' not found.' });
          return;
        }

        if (body.action === 'APPROVE') {
          if (body.extractedData) {
            doc.extractedData = { ...doc.extractedData, ...body.extractedData };
          }
          const valRes = this.validator.validate(doc.extractedData, this.documents);
          doc.validationResult = valRes;
          doc.status = 'APPROVED';
          doc.auditTrail.push(this.categorizer.createAuditEntry('USER_REVIEWER', 'MANUAL_APPROVE', body.note || 'Manually reviewed and approved'));
          this.metrics.incrementCounter('documentsAutoApproved');
        } else if (body.action === 'REJECT') {
          doc.status = 'REJECTED';
          doc.auditTrail.push(this.categorizer.createAuditEntry('USER_REVIEWER', 'REJECT', body.note || 'Rejected in review'));
          this.metrics.incrementCounter('documentsRejected');
        }

        this.sendJson(res, 200, { success: true, document: doc });
        return;
      }

      if (pathname.startsWith('/api/documents/') && method === 'GET') {
        const docId = pathname.split('/')[3];
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) {
          this.sendJson(res, 404, { error: 'Document ' + docId + ' not found.' });
          return;
        }
        this.sendJson(res, 200, doc);
        return;
      }

      if (pathname === '/api/documents/upload' && method === 'POST') {
        const body = await this.readRawBody(req);
        const filename = req.headers['x-filename'] || ('upload_' + Date.now() + '.pdf');
        const mime = req.headers['content-type'] || 'application/pdf';

        const ingested = await this.ingestion.ingestDocument(body, filename, mime);
        this.metrics.incrementCounter('documentsIngested');

        const existing = this.documents.find(d => d.sha256 === ingested.sha256);
        if (existing) {
          this.metrics.incrementCounter('duplicateDetected');
          this.sendJson(res, 409, { error: 'Duplicate document detected (matches ' + existing.id + ')', existingId: existing.id });
          return;
        }

        const textSample = body.toString('utf-8');
        const extracted = await this.extractor.extractDocument(textSample, ingested.id, ingested.documentType);
        const validationResult = this.validator.validate(extracted, this.documents);

        const status = (validationResult.isValid && validationResult.arithmeticPassed) ? 'APPROVED' : 'REVIEW_REQUIRED';
        const category = this.categorizer.categorizeSpend(extracted);

        if (status === 'APPROVED') {
          this.metrics.incrementCounter('documentsAutoApproved');
        } else {
          this.metrics.incrementCounter('documentsReviewRequired');
          this.metrics.incrementCounter('validationErrors');
        }

        const docRecord = {
          ...ingested,
          status,
          category,
          extractedData: extracted,
          validationResult,
          auditTrail: [
            this.categorizer.createAuditEntry('SYSTEM_INGEST', 'INGEST', 'File uploaded and parsed'),
            this.categorizer.createAuditEntry('SYSTEM_VALIDATOR', status === 'APPROVED' ? 'AUTO_APPROVE' : 'FLAG_REVIEW', validationResult.errors.map(e => e.message).join('; ') || 'Math valid')
          ]
        };

        this.documents.unshift(docRecord);
        const duration = performance.now() - startTime;
        this.metrics.recordLatency(duration);

        this.sendJson(res, 201, { success: true, document: docRecord });
        return;
      }

      if (pathname === '/api/reports/summary' && method === 'GET') {
        const summary = this.reporter.generateFinancialSummary(this.documents);
        this.sendJson(res, 200, summary);
        return;
      }

      if (pathname === '/api/export' && method === 'GET') {
        const format = parsedUrl.searchParams.get('format') || 'json';
        const docId = parsedUrl.searchParams.get('docId');
        const targetDoc = docId ? this.documents.find(d => d.id === docId) : this.documents[0];

        if (format === 'csv') {
          this.metrics.incrementCounter('erpExports', 'csv');
          const csv = this.reporter.exportToCsv(this.documents);
          res.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="document_intelligence_export.csv"'
          });
          res.end(csv);
          return;
        }

        if (format === 'quickbooks' && targetDoc) {
          this.metrics.incrementCounter('erpExports', 'quickbooks');
          this.sendJson(res, 200, this.qboAdapter.exportToBill(targetDoc));
          return;
        }

        if (format === 'xero' && targetDoc) {
          this.metrics.incrementCounter('erpExports', 'xero');
          this.sendJson(res, 200, this.xeroAdapter.exportToInvoice(targetDoc));
          return;
        }

        if (format === 'netsuite' && targetDoc) {
          this.metrics.incrementCounter('erpExports', 'netsuite');
          this.sendJson(res, 200, this.netsuiteAdapter.exportToVendorBill(targetDoc));
          return;
        }

        if (format === 'sap' && targetDoc) {
          this.metrics.incrementCounter('erpExports', 'sap');
          this.sendJson(res, 200, this.sapAdapter.exportToSapInvoice(targetDoc));
          return;
        }

        this.sendJson(res, 200, { documents: this.documents });
        return;
      }

      if (pathname === '/api/search' && method === 'GET') {
        const q = (parsedUrl.searchParams.get('q') || '').toLowerCase();
        const matches = this.documents.filter(d => {
          if (!q) return true;
          const fn = d.filename.toLowerCase();
          const vn = (d.extractedData?.vendorName?.value || '').toLowerCase();
          const inv = (d.extractedData?.invoiceNumber?.value || '').toLowerCase();
          const cat = (d.category || '').toLowerCase();
          return fn.includes(q) || vn.includes(q) || inv.includes(q) || cat.includes(q);
        });
        this.sendJson(res, 200, { results: matches, count: matches.length });
        return;
      }

      const BASE = 'g:/My Drive/AI Product Factory — Session 03 — Document Intelligence';
      if (pathname === '/' || pathname === '/index.html') {
        this.serveFile(res, path.join(BASE, 'src/frontend/index.html'), 'text/html');
        return;
      }
      if (pathname === '/app.js') {
        this.serveFile(res, path.join(BASE, 'src/frontend/app.js'), 'application/javascript');
        return;
      }
      if (pathname === '/style.css') {
        this.serveFile(res, path.join(BASE, 'src/frontend/style.css'), 'text/css');
        return;
      }

      this.sendJson(res, 404, { error: 'Route ' + pathname + ' not found' });
    } catch (err) {
      console.error('Server error:', err);
      this.sendJson(res, 500, { error: err.message });
    }
  }

  sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  serveFile(res, filePath, contentType) {
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File ' + filePath + ' not found');
    }
  }

  readJsonBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(new Error('Invalid JSON payload'));
        }
      });
      req.on('error', reject);
    });
  }

  readRawBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log('Document Intelligence Platform Server listening at http://localhost:' + this.port);
        resolve(this.server);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }
}

if (import.meta.url === ('file:///' + process.argv[1].replace(/\\/g, '/'))) {
  const port = process.env.PORT || 3000;
  const server = new DocumentServer(port);
  server.start();
}
