# Functional & Technical Requirements
## AI Product Factory — Session 03 — Document Intelligence

## 1. Functional Requirements (FR)

### FR-1: Multi-Format Ingestion
- Must accept PDF (`application/pdf`), PNG (`image/png`), JPEG (`image/jpeg`), and CSV (`text/csv`).
- Must enforce maximum file size (25MB) and reject malformed/corrupted files with clear error codes.
- Must generate SHA-256 hash upon upload and prevent identical byte duplicate processing.

### FR-2: Multimodal Extraction & Spatial Provenance
- Must extract header fields: `Invoice/PO Number`, `Invoice Date`, `Due Date`, `Vendor Name`, `Vendor Tax ID`, `Customer Name`, `Currency`.
- Must extract line items: `Description`, `Quantity`, `Unit Price`, `Line Total`.
- Must extract summary financials: `Subtotal`, `Tax Rate/Amount`, `Discount`, `Shipping`, `Grand Total`.
- Must associate every extracted field with its spatial bounding box `[x1, y1, x2, y2]` and page number.

### FR-3: Deterministic Validation Engine
- Must verify that $\sum LineTotals == Subtotal$ within $\pm \$0.01$.
- Must verify that $Subtotal + Tax - Discount + Shipping == Grand Total$ within $\pm \$0.01$.
- Must verify that $orall 	ext{line}: Qty 	imes UnitPrice == LineTotal$ within $\pm \$0.01$.
- Must flag any math failure or field confidence $<0.85$ for human review.

### FR-4: Interactive Review Queue UI
- Must provide dual-pane interface: Document Previewer (Canvas/SVG) on the left, Editable Form on the right.
- Clicking any field must highlight and zoom to its corresponding document bounding box.
- Must support keyboard shortcuts: `Alt+A` (Approve), `Alt+R` (Reject), `Tab` (Next Field), `Alt+N` (Next Document).

### FR-5: Search & Reporting Engine
- Full-text and structured filter search (by vendor, date range, status, amount range).
- Export capabilities to CSV, structured JSON, and financial summary reports.

---

## 2. Non-Functional Requirements (NFR)

### NFR-1: Processing Performance & Latency
- Native digital PDF stream parsing $<200	ext{ms}$ per page.
- Scanned OCR processing $<2.5	ext{s}$ per page.
- UI initial load time $<800	ext{ms}$; bounding box interaction latency $<50	ext{ms}$.

### NFR-2: Security & Privacy
- Zero-trust input handling; zero execution of scripts or prompt injections found in document text.
- Zero secrets or customer data in logs.

### NFR-3: Reliability & Auditability
- 100% traceable lineage trail from raw bytes to normalized values to final approved state.
- Graceful recovery and structured error reporting on corrupt files.
