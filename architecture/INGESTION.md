# Ingestion & Preprocessing Specification
## AI Product Factory — Session 03 — Document Intelligence

## 1. Supported Input Formats
- **PDF Documents**: Clean digital vector PDFs, hybrid scanned PDFs, multi-page documents (up to 100 pages).
- **Images**: PNG, JPEG, TIFF (scans, receipts, mobile photos).
- **Tabular Files**: CSV, XLSX, TSV.

## 2. Ingestion Pipeline & Safety Controls
1. **MIME & Magic Byte Verification**: Verify file signatures (e.g. `%PDF-`, `PNG`) to prevent executable file masking.
2. **File Size & Complexity Bounds**: Enforce max file size (e.g., 25MB) and max decompression ratio (anti-zip/PDF bomb).
3. **SHA-256 Immutability**: Generate cryptographic hash upon byte reception. Store original bytes in append-only storage.
4. **Image Preprocessing**:
   - Auto-orientation detection (0°, 90°, 180°, 270°).
   - Deskewing and contrast normalization.
   - Resolution resampling (optimal 300 DPI for OCR).

## 3. Ingestion State Model
```
[Uploaded] ---> [Magic Byte Verified] ---> [Integrity Hashed] ---> [Preprocessed] ---> [Ingested]
     |                    |                       |                     |
     +--> [Rejected: Bad Format]                  +--> [Rejected: Hash Collide]
```
