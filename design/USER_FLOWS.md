# User Flows & Interaction Sequences
## AI Product Factory — Session 03 — Document Intelligence

## 1. User Flow 1: Document Ingestion & Batch Processing
1. User navigates to **Ingest** view or drags 10 PDF invoices into the drop zone.
2. System displays instantaneous upload progress bar with SHA-256 integrity verification.
3. System processes documents in parallel:
   - 7 documents pass with $>95\%$ confidence + 100% arithmetic validation $ightarrow$ Automatically assigned badge `APPROVED`.
   - 3 documents flagged with math mismatch or low confidence $ightarrow$ Assigned badge `REVIEW REQUIRED` and added to Review Queue count.
4. User clicks "Go to Review Queue (3)" or opens individual document.

---

## 2. User Flow 2: Rapid Keyboard-Driven Review
1. User enters Review Queue. Left pane displays Document 1; right pane displays parsed form.
2. Error banner announces: *"Arithmetic Discrepancy: Line items sum to $1,200.00, Tax is $100.00, but Grand Total extracted as $1,350.00"*.
3. User presses `Tab` to navigate to `Total Amount` input.
4. Left pane smoothly zooms to Page 1 Total box and pulses red.
5. User visually observes printed total is `$1,300.00` (OCR had misread `0` as `5`).
6. User enters `1300.00`. Real-time validation recalculates $ightarrow$ banner turns green *"All calculations valid"*.
7. User presses `Alt+A`.
8. Document 1 is marked `APPROVED`; audit log records edit; UI immediately loads Document 2. Total time elapsed: **9.4 seconds**.
