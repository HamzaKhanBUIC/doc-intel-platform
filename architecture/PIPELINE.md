# End-to-End Pipeline & Orchestration Architecture
## AI Product Factory — Session 03 — Document Intelligence

## 1. Pipeline Execution Flow
The platform executes an event-driven, stage-isolated pipeline:
1. `INGESTION_EVENT`: Receives raw document bytes, writes to storage, emits metadata.
2. `CLASSIFICATION_EVENT`: Determines document category (Invoice vs Receipt vs PO).
3. `EXTRACTION_EVENT`: Dispatches appropriate extraction adapter based on document type.
4. `NORMALIZATION_EVENT`: Transforms extracted raw text into typed canonical values.
5. `VALIDATION_EVENT`: Executes deterministic business rules and evaluates confidence.
6. `ROUTING_EVENT`: If valid and confident $\rightarrow$ `STORE_EVENT`; else $\rightarrow$ `REVIEW_EVENT`.
7. `REPORTING_EVENT`: Indexes approved document data into aggregation indices.

## 2. Concurrency & Isolation
- Each document processing job runs in isolated execution context with bounded memory.
- State transitions are atomic and recorded in the audit trail ledger.
