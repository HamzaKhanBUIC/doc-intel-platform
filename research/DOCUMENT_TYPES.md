# Comprehensive Document Taxonomy & Layout Variation Matrix
## AI Product Factory — Session 03 — Document Intelligence

## 1. Document Archetype & Challenge Classification

```
+---------------------------------------------------------------------------------------------------+
|                                   DOCUMENT COMPLEXITY SPECTRUM                                    |
+------------------------------------+------------------------------------+-------------------------+
| Level 1: Structured / Digital      | Level 2: Semi-Structured Tables    | Level 3: Unstructured / |
| (Digital PDFs, CSVs, Spreadsheets) | (Invoices, Receipts, POs, BOLs)    | Degraded Scans & Faxes  |
+------------------------------------+------------------------------------+-------------------------+
| Fast Stream Parsing (<50ms)        | Spatial Tokenizer + Bounding Boxes | OCR / Vision + Review   |
+------------------------------------+------------------------------------+-------------------------+
```

---

## 2. Deep Investigation of Target Document Types

### 1. Invoices (Accounts Payable / Receivable)
- **Structural Archetypes**: Multi-page line item grids, nested tables, headerless columns, multi-currency notations, VAT breakdown tables.
- **Key Fields**: `Invoice Number`, `Invoice Date`, `Due Date`, `Vendor Name & Address`, `Vendor Tax ID / VAT`, `Customer Name`, `Line Items (Desc, Qty, Unit Price, Line Total)`, `Subtotal`, `Tax Rate & Amount`, `Total Amount`.
- **Primary Failure Modes**:
  - Line item table splitting across page boundaries with repeating headers.
  - Discount applied at line level vs document total level.
  - European format (`1.250,50 €` / `15.04.2026`) vs US format (`$1,250.50` / `04/15/2026`).
  - Font stream encoding anomalies (missing ToUnicode table emitting glyph IDs instead of ASCII).

### 2. Receipts (Point-of-Sale & Travel Expenses)
- **Structural Archetypes**: Narrow vertical thermal paper strips, mobile camera photos with perspective skew, wrinkled/faded paper.
- **Key Fields**: `Merchant Name`, `Transaction Date & Time`, `Payment Method (Visa ****1234)`, `Tax / Tip`, `Total Paid`.
- **Primary Failure Modes**:
  - Thermal paper fading (low contrast).
  - Background clutter (wood table, fingers holding receipt).
  - Missing line items due to vertical fold creases.

### 3. Purchase Orders (Procurement)
- **Structural Archetypes**: Formal grid forms, delivery terms (Incoterms), buyer/seller shipping addresses, scheduled delivery dates.
- **Key Fields**: `PO Number`, `PO Date`, `Vendor Code`, `Ship-To Address`, `Line Items (Part #, Description, Order Qty, Unit Price)`, `Payment Terms (Net 30)`.
- **Primary Failure Modes**: Multi-column address blocks aligned horizontally causing left-to-right text stream merging.

### 4. Logistics Documents (Bills of Lading, Packing Lists, Air Waybills)
- **Structural Archetypes**: Dense pre-printed box forms, hand-written signatures, stamps covering text, hazardous material codes, weight/pallet matrices.
- **Key Fields**: `BOL Number`, `Carrier Name & SCAC`, `Shipper Address`, `Consignee Address`, `Pallet Count`, `Gross Weight (lbs/kg)`, `Freight Class`, `Special Instructions`.
- **Primary Failure Modes**: Rubber stamps overlapping text, handwritten piece count corrections, multi-party routing addresses.

### 5. Bank & Financial Documents (Statements, Settlement Sheets)
- **Structural Archetypes**: Dense multi-page tables, running balance ledgers, interest breakdown, credit/debit columns.
- **Key Fields**: `Account Number`, `Statement Period`, `Opening Balance`, `Closing Balance`, `Transaction Rows (Date, Description, Debit, Credit, Balance)`.
- **Primary Failure Modes**: Minus sign after number (`500.00-`), parentheses indicating negative amounts (`(500.00)`), transaction descriptions wrapping onto 2-3 lines.

### 6. Spreadsheets & Email Attachments (CSV, XLSX, EML)
- **Structural Archetypes**: Tabular sheets with formula cells, merged title banners, multi-tab workbooks, inline email tables.
- **Key Fields**: Dynamic table headers, row records, timestamp metadata.
- **Primary Failure Modes**: Formula errors (`#REF!`, `#VALUE!`), date serial numbers (e.g. `45678` in Excel), merged header rows offset from data columns.
