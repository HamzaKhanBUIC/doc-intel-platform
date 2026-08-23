# Customer Personas & Operational Economics
## AI Product Factory — Session 03 — Document Intelligence

## 1. Ideal Customer Profiles (ICP)

### Persona A: The Accounts Payable (AP) Specialist
- **Role**: AP Clerk / AP Lead (Mid-Market to Enterprise, 1,000 - 15,000 invoices/month).
- **Core Workflow**: Download PDF invoices from emails $\rightarrow$ Re-type vendor, invoice #, date, line items, and totals into ERP (NetSuite, QuickBooks, SAP) $\rightarrow$ Check 2-way / 3-way match against PO.
- **Pain Points**:
  - Repetitive data entry causing eye strain and wrist fatigue.
  - Multi-page line-item tables with 20+ lines taking 8-12 minutes per invoice.
  - Fear of paying duplicate invoices or fat-fingering decimal places ($10,000 vs $100.00).
- **Adoption Requirement**: Must trust that if a document is marked "Auto-Approved", the arithmetic has been mathematically verified ($Total = \sum Lines + Tax$).

### Persona B: The Freight / Logistics Dispatcher
- **Role**: Freight Operations Coordinator / Customs Entry Clerk (3PL & Freight Forwarders).
- **Core Workflow**: Ingest Bills of Lading (BOLs), carrier rate confirmations, and delivery receipts (PODs) $\rightarrow$ Extract shipper, consignee, piece count, weight, and hazmat codes $\rightarrow$ Update TMS.
- **Pain Points**:
  - Documents arrive as blurry mobile photos taken on loading docks, low-res faxes, or skewed thermal scans.
  - Carrier layout variations (no two trucking companies use the same BOL format).
  - Single misread weight or container number triggers customs inspection holds costing $500+/day.
- **Adoption Requirement**: High tolerance for low-DPI scans with instant bounding-box visual review for uncertain fields.

### Persona C: The Procurement & Operations Manager
- **Role**: Procurement Lead / Back-Office Operations Director.
- **Core Workflow**: Review vendor catalog spreadsheets, purchase orders, and expense reports $\rightarrow$ Cross-reconcile contracted prices against billed prices.
- **Pain Points**:
  - Spreadsheets with missing headers, merged cells, or hidden formula columns.
  - Price creep where vendors bill $5.20/unit instead of contracted $4.80/unit.
- **Adoption Requirement**: Automated line-item extraction with unit price anomaly detection and CSV/ERP export.

---

## 2. Economic Pain Quantification

$$\text{Annual Loss} = (\text{Volume} \times \text{Manual Cost}) + (\text{Volume} \times \text{Error Rate} \times \text{Rework Cost}) + \text{Duplicate Payment Leakage}$$

### Example Case: Mid-Market Business (5,000 Invoices/Month)
- **Manual Labor Cost**: $5,000 \times \$16.00 = \$80,000/\text{month}$ ($\\$960,000/\text{year}$).
- **Rework on 2% Error Rate**: $100 \text{ errors} \times \$53.50 = \$5,350/\text{month}$ ($\\$64,200/\text{year}$).
- **Duplicate Payment Leak**: ~0.1% undetected duplicates = $\$35,000/	ext{year}$.
- **Total Annual Cost**: **$1,059,200 / year**.
- **Automated Platform Savings**: Reduces processing cost to $\$3.00/\text{doc}$, saving **$840,000+ annually** while slashing turnaround time from 14 days to 4 hours.
