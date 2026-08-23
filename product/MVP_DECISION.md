# MVP Wedge Selection & Architecture Scope
## AI Product Factory — Session 03 — Document Intelligence

## 1. The Winning Wedge: Accounts Payable & Procurement Reconciliation
Based on Phase 1 research, the platform initial MVP focuses on:
**High-Volume Invoices, Point-of-Sale Receipts, and Purchase Orders with Dense Line-Item Table Reconciliation**.

---

## 2. Why This Wedge Wins
1. **Mathematical Ground Truth**: Clear arithmetic invariants ($Total = Subtotal + Tax - Discount$; $LineTotal = Qty 	imes Price$) enable 100% deterministic quality gating.
2. **Immediate Measurable ROI**: Reduces document cost from $16.00 to $2.50 per invoice, delivering positive ROI within the first 30 days.
3. **Dual-Pane Spatial Provenance**: Solving the trust gap by linking every extracted value directly to its original bounding box on the document canvas.

---

## 3. Scope Boundaries & Non-Goals

```
+-----------------------------------------------------------------------------------+
| IN-SCOPE (MVP CORE)                               | EXPLICIT NON-GOALS (OUT OF SCOPE) |
+---------------------------------------------------+-----------------------------------+
| Multi-page Invoices, Receipts, POs (PDF, PNG, JPG)| Handwritten doctor notes / charts |
| Multi-page line-item table extraction             | Audio / video transcription       |
| Deterministic arithmetic validation & checksums   | Complex multi-year legal analysis |
| Dual-pane visual review queue with SVG overlays   | Direct real-time bank wire rails  |
| Keyboard shortcuts for sub-15s exception review   | 3D CAD drawing parsing            |
| Duplicate invoice detection (SHA-256 + fuzzy)     | Legacy physical fax hardware      |
| CSV, JSON, and ERP export feeds                   | Custom proprietary ERP extensions |
+---------------------------------------------------+-----------------------------------+
```
