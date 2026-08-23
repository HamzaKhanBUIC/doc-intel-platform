# Data Models & Schema Definitions
## AI Product Factory — Session 03 — Document Intelligence

## Core Entity Schemas

### 1. Document Entity
```typescript
interface DocumentRecord {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  pageCount: number;
  uploadedAt: string;
  status: 'INGESTED' | 'EXTRACTING' | 'VALIDATING' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED';
  documentType: 'INVOICE' | 'RECEIPT' | 'PURCHASE_ORDER' | 'BILL_OF_LADING' | 'UNKNOWN';
  rawStorageUri: string;
}
```

### 2. Extracted Field Provenance
```typescript
interface Provenance {
  documentId: string;
  pageNumber: number;
  boundingBox: [number, number, number, number]; // [x1, y1, x2, y2]
  extractionMethod: 'NATIVE_STREAM' | 'AST_TABLE' | 'OCR_VISION';
  ocrConfidence: number;
}
```

### 3. Invoice Structured Data Model
```typescript
interface InvoiceData {
  invoiceNumber: { value: string; raw: string; confidence: number; provenance: Provenance };
  invoiceDate: { value: string; raw: string; confidence: number; provenance: Provenance };
  dueDate?: { value: string; raw: string; confidence: number; provenance: Provenance };
  vendor: {
    name: { value: string; confidence: number; provenance: Provenance };
    taxId?: { value: string; confidence: number; provenance: Provenance };
    address?: { value: string; confidence: number; provenance: Provenance };
  };
  customer: {
    name: { value: string; confidence: number; provenance: Provenance };
    address?: { value: string; confidence: number; provenance: Provenance };
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    confidence: number;
    provenance: Provenance;
  }>;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  validationResults: {
    isValid: boolean;
    arithmeticPassed: boolean;
    errors: Array<{ field: string; message: string; severity: 'ERROR' | 'WARNING' }>;
  };
}
```
