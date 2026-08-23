# Phase 1 Research Conclusion & The 12 Golden Discovery Answers
## AI Product Factory — Session 03 — Document Intelligence

## The 12 Golden Discovery Questions Answered

### 1. Who is the customer?
**SMB and Mid-Market Finance Teams, Accounts Payable Specialists, and Back-Office Operations Managers** in transaction-heavy businesses (retail, manufacturing, professional services, logistics, construction).

### 2. What documents do they process?
- Multi-page supplier and vendor invoices (digital vector PDFs and scanned paper PDFs).
- Point-of-sale and travel expense receipts (thermal slips, camera photos).
- Purchase orders and receiving slips (2-way and 3-way reconciliation documents).
- Operational spreadsheets (price catalogs, transaction CSVs).

### 3. How many?
Between **500 and 5,000 documents per month** per organization (processing 25 to 250 documents per business day).

### 4. Why is processing painful?
- Staff spend **15 to 25 hours per week manually re-keying** document data into ERP/accounting software.
- High cognitive fatigue from manually cross-multiplying 10-50 line items per invoice.
- Average processing cycle takes **10 to 20 days**, causing lost early-payment discounts and vendor strain.

### 5. What information is needed?
1. **Header Metadata**: Invoice/PO Number, Invoice Date, Due Date, Vendor Name, Vendor Address, Tax ID / VAT Number, Customer Name, Currency.
2. **Line Items Grid**: Item Description, Quantity, Unit Price, Line Total, SKU / Part Code.
3. **Summary Financials**: Subtotal, Tax Rate(s), Tax Amount, Discount, Shipping/Freight, Grand Total.
4. **Audit Provenance**: Page number and spatial bounding box coordinates `[x1, y1, x2, y2]` for every extracted field.

### 6. Why is extraction difficult?
- **Multi-page table fracture**: Line-item tables split across page boundaries without repeating headers.
- **Layout entropy**: Thousands of vendor formats; borderless tables; multi-column address alignments.
- **Format variance**: European date/currency notation (`1.500,00 €` / `15.08.2026`) vs US notation (`$1,500.00` / `08/15/2026`).
- **Optical degradation**: Low DPI, skewed mobile camera angles, thermal fading.

### 7. What happens when extraction is wrong?
- **Catastrophic Downstream Impact**: Overpayment of duplicate invoices, tax audit penalties, cash flow discrepancies, and expensive manual rework ($53.50 staff cost per error).

### 8. What validation is required?
Strict deterministic arithmetic cross-verification:
$$\text{Condition 1}: \quad |(\sum \text{LineItems}) - \text{Subtotal}| \le 0.01$$
$$\text{Condition 2}: \quad |\text{Subtotal} + \text{Tax} - \text{Discount} + \text{Freight} - \text{Total}| \le 0.01$$
$$\text{Condition 3}: \quad \forall i: |(\text{Qty}_i \times \text{UnitPrice}_i) - \text{LineTotal}_i| \le 0.01$$
$$\text{Condition 4}: \quad \text{Valid ISO-8601 Date and ISO-4217 Currency}$$
$$\text{Condition 5}: \quad \text{Duplicate SHA-256 and Vendor + Invoice \# Check}$$

### 9. What existing software already solves?
- Basic optical character recognition (extracting raw text strings).
- Simple header extraction on clean, single-page digital invoices.
- File storage and folder archiving.

### 10. What remains poorly solved?
- **Line item table extraction across multi-page boundaries**.
- **Automated mathematical reconciliation and arithmetic sanity enforcement**.
- **Instant keyboard-driven visual review queues** with spatial bounding-box highlighting.
- **Zero-trust indirect prompt injection protection** against document-borne exploits.

### 11. What is the narrowest valuable MVP?
A high-accuracy, hybrid-pipeline **Document-to-Data Intelligence Platform** focused on **Invoices, Receipts, and Purchase Orders**:
1. Multi-format ingestion (PDFs, Images, Spreadsheets) with SHA-256 immutability.
2. Tiered extraction (Native Stream Parser for digital PDFs $ightarrow$ Spatial Layout OCR for scans).
3. Deterministic normalizer (dates, currencies, numbers).
4. Deterministic arithmetic validator ($Total = \sum Lines + Tax$).
5. Dual-pane visual Review Queue with reactive SVG bounding-box overlays and keyboard shortcuts (`Alt+A`, `Alt+R`).
6. Export engine (Structured JSON, CSV, and Accounting Summary Reports).

### 12. How will success be measured?
- **Touchless Rate**: $>70\%$ of clean invoices auto-approved with zero human touch.
- **Math Integrity**: $100\%$ of arithmetic discrepancies flagged; $0\%$ arithmetic errors auto-approved.
- **Review Speed**: Exception review time reduced from 5 minutes to $<15$ seconds per document.
- **End-to-End Latency**: $<200\text{ms}$ per digital PDF page; $<2\text{s}$ per scan.

---

## 3. The Definitive Product Wedge Statement

> **For SMB & Mid-Market Finance Teams**  
> **Handling vendor invoices, itemized receipts, and purchase orders**  
> **During accounts payable reconciliation and expense processing,**  
> **Eliminate 85% of manual data entry and catch 100% of arithmetic errors**  
> **While maintaining complete spatial bounding-box auditability and sub-15-second human review on exceptions.**
