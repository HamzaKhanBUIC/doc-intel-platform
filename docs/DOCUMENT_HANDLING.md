# Document Handling & Lifecycle Reference
## AI Product Factory — Session 03 — Document Intelligence

## 1. Supported Document Types & Formats
- **Digital PDFs**: Extracted via native vector font streams and character geometry.
- **Scanned PDFs & Images (PNG/JPG)**: Processed via spatial OCR engine.
- **Spreadsheets (CSV/XLSX)**: Parsed via direct AST cell grids.

## 2. Ingestion & Storage Invariants
1. Raw documents are stored immutably, addressed by their SHA-256 digest.
2. Source documents are NEVER overwritten or mutated in place.
3. Bounding box coordinates are normalized to $[0.0, 1.0]$ relative to page boundaries.
