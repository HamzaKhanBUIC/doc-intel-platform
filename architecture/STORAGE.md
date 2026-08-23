# Storage Architecture & Audit Lineage
## AI Product Factory — Session 03 — Document Intelligence

## 1. Storage Tiers
- **Raw Object Store**: Immutable file storage preserving exact uploaded bytes keyed by SHA-256.
- **Document Metadata Store**: Document lifecycle state, file attributes, processing timestamps.
- **Extracted Entity Store**: Structured JSON records containing normalized values, confidence, and provenance.
- **Audit Lineage Ledger**: Immutable event trail recording every state change, manual edit, and approval.

## 2. Lineage Audit Record
```typescript
interface AuditTrailEntry {
  id: string;
  documentId: string;
  timestamp: string;
  actor: 'SYSTEM_PARSER' | 'VALIDATION_ENGINE' | 'USER_REVIEWER';
  action: 'EXTRACT' | 'NORMALIZE' | 'VALIDATE' | 'MANUAL_EDIT' | 'APPROVE' | 'REJECT';
  fieldChanged?: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
}
```
