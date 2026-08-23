# Deterministic Validation & Business Correctness
## AI Product Factory — Session 03 — Document Intelligence

## 1. Validation Hierarchy
Deterministic rule validation is ALWAYS preferred over probabilistic AI judgment.

## 2. Validation Rules Catalog

### A. Financial Arithmetic Invariants
1. **Line Item Cross-Multiplication**:
   $$\forall i \in \text{LineItems}: \quad |(\text{Quantity}_i \times \text{UnitPrice}_i) - \text{Amount}_i| \le 0.01$$
2. **Subtotal Summation**:
   $$|\sum_{i} \text{Amount}_i - \text{Subtotal}| \le 0.01$$
3. **Tax & Discount Balance**:
   $$|\text{Subtotal} + \text{TaxAmount} - \text{DiscountAmount} - \text{TotalAmount}| \le 0.01$$

### B. Format & Syntactic Invariants
1. **Dates**: Valid calendar date, not in future beyond 30 days, ISO-8601 representation (`YYYY-MM-DD`).
2. **Currencies**: Valid ISO-4217 currency code (e.g. `USD`, `EUR`, `GBP`, `CAD`).
3. **Identifiers**: Non-empty invoice/PO number with valid alphanumeric formatting.
4. **Vendor / Customer**: Non-empty name and parsed address tokens.

## 3. Discrepancy Classification
- **FATAL ERROR**: Total mathematical mismatch > $0.05. Disables auto-approval.
- **WARNING**: Missing non-mandatory field (e.g., PO Number on direct receipt).
- **CONFIDENCE FLAG**: Field confidence $< 0.85$. Highlights field in review UI.
