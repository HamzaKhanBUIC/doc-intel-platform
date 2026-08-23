# Product Opportunity Shortlist & Wedge Evaluation
## AI Product Factory — Session 03 — Document Intelligence

## 1. Candidate Opportunity Comparison Matrix

| Dimension | Candidate 1: AP Invoices & Receipts (Selected Wedge) | Candidate 2: Logistics & Freight Documents (BOLs) | Candidate 3: Procurement & Vendor Price Catalogs | Candidate 4: Legal & Contract Analysis |
|---|---|---|---|---|
| **Target Customer** | SMB & Mid-Market Finance / AP / Ops Teams | 3PLs, Freight Forwarders, Trucking Dispatch | Procurement Teams, Wholesale Distributors | Legal Ops, Corporate Counsel |
| **Document Volume** | **High** (500 - 5,000 / month / company) | **High** (1,000 - 10,000 / month) | **Medium** (100 - 1,000 / month) | **Low-Medium** (50 - 300 / month) |
| **Document Frequency** | **Daily / Continuous** | Daily / Shift-based | Weekly / Monthly | Ad-hoc / Milestone |
| **Document Variability** | **Medium-High** (Thousands of vendor templates, multi-page line item grids) | **Extreme** (Thermal faxes, dock photos, stamped BOLs) | **Medium** (Complex spreadsheets, price tables) | **High** (Free-form legal prose) |
| **Extraction Difficulty** | **Medium-High** (Line item tables, multi-tax, multi-currency) | **Extreme** (Handwriting, stamps, blurred phone scans) | **Medium** (Merged cells, formula anomalies) | **High** (Nuanced legal clauses) |
| **Validation Computability** | **100% Deterministic Math** ($Total = \sum Lines + Tax$) | **Partial / Relational** (Weight sanity, pallet checks) | **High** (Price matrix cross-check) | **Subjective / Probabilistic** |
| **Financial Consequence of Errors** | **Severe** (Duplicate payments, tax penalties, cash leakage) | **Severe** (Customs demurrage fees, freight claims) | **Medium-High** (Contract over-billing) | **High** (Breach of contract) |
| **Current Software Quality** | **Weak** (Header-only OCR, 6-month enterprise RPA setups) | **Very Weak** (Mostly manual TMS keying) | **Moderate** (Basic spreadsheet tools) | **Moderate** (AI summarizers) |
| **Sales Cycle & Time-to-Value** | **Fast** (Self-serve / <7 days) | **Slow** (1-3 months TMS integration) | **Medium** (2-4 weeks) | **Slow** (2-6 months) |
| **Willingness to Pay** | **High** ($200 - $1,500 / month) | **High** ($500 - $3,000 / month) | **Medium** ($300 - $1,000 / month) | **High** ($1,000+ / month) |
| **Overall Score & Rank** | **9.4 / 10 (RANK 1 - SELECTED WEDGE)** | **8.1 / 10 (RANK 2 - POST-MVP)** | **7.5 / 10 (RANK 3)** | **6.2 / 10 (RANK 4)** |

---

## 2. Why Candidate 1 (AP Invoices, Receipts & POs) Wins the Initial Wedge

1. **High Volume + Daily Repetitive Friction**: Every commercial organization receives invoices and receipts continuously. The operational pain is felt every single working day.
2. **Deterministic Mathematical Ground Truth**: Unlike legal or general document parsing where correctness is subjective, invoice/receipt processing has **strict, unambiguous mathematical laws**:
   - $LineItemTotal = Quantity 	imes UnitPrice$
   - $Subtotal = \sum LineItemTotal$
   - $Total = Subtotal + Tax - Discount$
   This enables 100% verifiable quality gating and prevents AI hallucinations from silently entering financial ledgers.
3. **Severe Cost of Failure + High Willingness to Pay**: A single duplicate invoice payment ($5,000 - $50,000) or tax discrepancy ($53.50 rework cost per error) pays for the entire software subscription.
4. **Weak Incumbent Solutions in Mid-Market**:
   - QuickBooks / Xero / Expensify capture only header data and fail on multi-page line item grids.
   - Enterprise tools (Coupa, Tipalti, Kofax) require $30k+ upfront contracts and 6-month consulting implementations.
   - Generic AI PDF tools lack spatial bounding boxes, keyboard review queues, and accounting validation.
