# End-to-End User Workflows & State Transitions
## AI Product Factory — Session 03 — Document Intelligence

## 1. Primary Workflow: The Zero-Touch Happy Path (60-80% Volume)

```mermaid
sequenceDiagram
    autonumber
    actor User as Vendor / Staff
    participant Ingest as Ingestion Service
    participant Extract as Tiered Extraction Engine
    participant Valid as Deterministic Validator
    participant DB as Document Database
    participant UI as Web Dashboard

    User->>Ingest: Uploads PDF / Image Document
    Ingest->>Ingest: Magic Byte Check & SHA-256 Hashing
    Ingest->>Extract: Dispatches Document Stream
    Extract->>Extract: Native Stream Parsing + Spatial Bounding Boxes
    Extract->>Valid: Emits Normalized Candidate Entities
    Valid->>Valid: Checks Math: Subtotal + Tax = Total; LineItem Qty * Price
    Valid->>Valid: Checks Duplicates & Date Sanity
    Note over Valid: 100% Math Valid + Confidence > 0.90
    Valid->>DB: Saves status: 'APPROVED' + Lineage Trail
    DB->>UI: Document appears in 'Approved' Table & Search Index
```

---

## 2. Secondary Workflow: The Exception Triage Path (20-40% Volume)

```mermaid
sequenceDiagram
    autonumber
    actor Clerk as AP Specialist
    participant UI as Review Queue UI
    participant Server as Backend API
    participant DB as Document Database

    Note over Server: Document flagged: Math Discrepancy or Confidence < 0.85
    Server->>DB: Saves status: 'REVIEW_REQUIRED' with Failure Reasons
    Clerk->>UI: Opens Review Queue (filter: REVIEW_REQUIRED)
    UI->>Clerk: Displays Side-by-Side View (PDF Left, Form Right)
    Note over UI: Red banner: "Subtotal ($1,200.00) + Tax ($100.00) != Total ($1,350.00)"
    Clerk->>UI: Clicks Total field -> PDF canvas scrolls & pulses bounding box
    Clerk->>UI: Types correct value ($1,300.00)
    UI->>UI: Real-time math recalculates -> Banner turns green
    Clerk->>UI: Presses 'Alt+A' (Approve & Next)
    UI->>Server: Submits corrected payload
    Server->>DB: Updates status to 'APPROVED', logs audit trail
    UI->>Clerk: Automatically loads next exception item in queue
```
