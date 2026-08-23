# Master Test Plan & Benchmark Architecture
## AI Product Factory — Session 03 — Document Intelligence

## 1. Document Variability Test Corpus
The test suite validates performance across 10 distinct document variability dimensions:

| ID | Dimension | Description | Test Target |
|---|---|---|---|
| **CORP-01** | Clean Digital PDFs | Native vector PDFs with embedded font streams | 100% extraction & field accuracy |
| **CORP-02** | Scanned PDFs | Rasterized scans with slight optical noise | $>95\%$ field accuracy |
| **CORP-03** | Low-DPI & Poor Scans | Mobile photos / faxed documents (<150 DPI) | Review queue routing on low confidence |
| **CORP-04** | Complex Tabular Grids | Multi-column, borderless, and nested header tables | Accurate line item grid stitching |
| **CORP-05** | Multi-Page Documents | Documents spanning 2 to 10 pages | Accurate page continuity & pagination |
| **CORP-06** | Rotated & Skewed Pages | Documents rotated 90°, 180°, 270° or skewed | Auto-orientation correction |
| **CORP-07** | Mixed Multi-Column Layouts | Invoices with side-by-side vendor/billing blocks | Correct key-value association |
| **CORP-08** | Corrupted & Malformed Files | Truncated bytes, bad headers, zero-byte files | Deterministic graceful rejection |
| **CORP-09** | Duplicate Documents | Exact SHA-256 byte duplicates and semantic dupes | Duplicate detection and alert |
| **CORP-10** | Adversarial Injections | Indirect prompt injections in document text | Zero prompt hijack; text parsed as data |

---

## 2. Distinct Accuracy Metrics (Never Collapsed)

1. **Extraction Accuracy**: Token-level precision, recall, and F1 across raw text stream.
2. **Field Accuracy**: Exact match and normalized match rate for specific schema fields (Invoice #, Date, Total).
3. **Document Classification Accuracy**: Percentage of documents correctly categorized (Invoice vs Receipt vs PO).
4. **Validation Accuracy**: Percentage of valid/invalid mathematical rules correctly caught.
5. **Business Outcome Accuracy**: Percentage of documents successfully processed end-to-end without manual correction.
