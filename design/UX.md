# UX & Interaction Design Specification
## AI Product Factory — Session 03 — Document Intelligence

## 1. UX Philosophy: The High-Speed Operational Cockpit
The Document Intelligence UI is designed for professional operational throughput, not leisure browsing.
- **Dual-Pane Split Layout**: 50/50 default split between Document Previewer (left) and Structured Extraction Form (right).
- **Zero-Latency Spatial Feedback**: Hovering or focusing any field instantly highlights the corresponding bounding box on the original document.
- **Keyboard-First Navigation**: 100% of review actions can be executed without lifting hands from the keyboard.

---

## 2. Layout Structure & Components

```
+--------------------------------------------------------------------------------------------------+
| Top Navigation: [Logo] Document Intelligence | Ingest (Upload) | Review Queue (3) | Documents | Reports|
+--------------------------------------------------------------------------------------------------+
| Document: INV-98421.pdf (Page 1 of 2) [Zoom: 100%] [Rotate] | Status: [ REVIEW REQUIRED (Math Mismatch) ]|
+-------------------------------------------------------------+------------------------------------+
| LEFT PANE: Interactive Document Viewer                      | RIGHT PANE: Extraction Form        |
|                                                             |                                    |
| +---------------------------------------------------------+ | [!] DISCREPANCY DETECTED:          |
| | ACME SUPPLIES INC.                                      | | Subtotal + Tax ($1,300) != Total |
| |                                                         | |                                  |
| | Invoice #: [ INV-98421 (Box 1) ]                        | | Vendor Name: [ ACME SUPPLIES INC] (99%)|
| | Date:      [ 2026-08-15 (Box 2) ]                       | | Invoice #:   [ INV-98421       ] (98%)|
| |                                                         | | Invoice Date: [ 2026-08-15     ] (98%)|
| | LINE ITEMS:                                             | |                                  |
| | [ 1. Widget Pro (Qty 10) ($50.00) ($500.00) (Box 3) ]   | | Line Items (2 items):            |
| | [ 2. Gadget Max (Qty 5) ($140.00) ($700.00) (Box 4) ]   | | 1. Widget Pro: 10 x $50 = $500   |
| |                                                         | | 2. Gadget Max: 5 x $140 = $700   |
| | Subtotal:  [ $1,200.00 (Box 5) ]                        | |                                  |
| | Tax (8%):  [ $100.00   (Box 6) ]                        | | Subtotal:    [ $1,200.00       ] |
| | TOTAL:     [ $1,350.00 (Box 7 - HIGHLIGHTED RED) ]      | | Tax Amount:  [ $100.00         ] |
| +---------------------------------------------------------+ | Total Amount: [ $1,350.00 ] <ERR |
+-------------------------------------------------------------+------------------------------------+
| Quick Action Bar: [Reject (Alt+R)] [Re-extract (Alt+E)]     | [ Approve & Next Document (Alt+A) ]|
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Keyboard Shortcut Matrix

| Shortcut | Action | Scope |
|---|---|---|
| `Alt + A` | **Approve & Next Document** (Transitions to next exception in queue) | Review Screen |
| `Alt + R` | **Reject Document** (Prompts quick reason tag and archives) | Review Screen |
| `Alt + N` | **Next Document** (Skip without approving) | Review Screen |
| `Alt + P` | **Previous Document** | Review Screen |
| `Tab` / `Shift + Tab` | **Next / Previous Field** (Auto-scrolls left pane to matching bounding box) | Form Input |
| `Ctrl + +` / `Ctrl + -` | **Zoom In / Zoom Out** on document canvas | Document Viewer |
| `Ctrl + 0` | **Fit to Width** | Document Viewer |
| `Ctrl + R` | **Rotate Page 90° Clockwise** | Document Viewer |
