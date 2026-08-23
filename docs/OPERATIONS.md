# Operations & Production Runbook
## AI Product Factory — Session 03 — Document Intelligence

## 1. Operational Health & Statuses
- `INGESTED`: Document uploaded and verified.
- `EXTRACTING`: Optical / stream parsing in progress.
- `VALIDATING`: Deterministic rule validation in progress.
- `REVIEW_REQUIRED`: Low confidence (<0.85) or arithmetic discrepancy flagged.
- `APPROVED`: Passed validation or approved by human reviewer.
- `REJECTED`: Rejected during ingestion or human review.

## 2. Review Queue Triage Protocol
1. Open document in Review Queue UI.
2. Inspect highlighted red discrepancy banner (e.g. Line item sum $1,200 != Total $1,250).
3. Click highlighted field to view zoomed document bounding box.
4. Correct field value or reject invoice.
5. Click Submit (`Alt+A` / `Alt+R`).
