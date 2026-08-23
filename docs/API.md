# Document Intelligence API Specification
## AI Product Factory — Session 03 — Document Intelligence

## Endpoints Summary

### 1. Document Ingestion
- `POST /api/documents/upload`: Multi-part document upload with MIME validation and SHA-256 calculation.
- `GET /api/documents`: List ingested documents with pagination, status, and filter by date/type.
- `GET /api/documents/:id`: Retrieve document metadata, processing status, and raw storage URI.

### 2. Extraction & Provenance
- `POST /api/documents/:id/extract`: Trigger extraction pipeline.
- `GET /api/documents/:id/extracted`: Fetch raw extracted fields with spatial bounding boxes and confidence.

### 3. Validation & Review
- `POST /api/documents/:id/validate`: Execute deterministic validation rules and arithmetic cross-checks.
- `GET /api/review-queue`: List all documents flagged for manual review with specific failure reasons.
- `POST /api/documents/:id/review`: Submit human corrections or approval/rejection.

### 4. Search & Aggregated Reporting
- `GET /api/search?q=:query`: Full-text and structured entity search across all processed documents.
- `GET /api/reports/financial-summary`: Aggregate spend, tax breakdown, and vendor volume.
