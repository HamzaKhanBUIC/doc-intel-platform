# Product Hypotheses & Validation Register
## AI Product Factory — Session 03 — Document Intelligence

| ID | Hypothesis Statement | Verification Test | Expected Outcome | Decision Impact | Status |
|---|---|---|---|---|---|
| **HYP-001** | A hybrid pipeline (native PDF stream for digital + OCR fallback for scans) will achieve $>98\%$ accuracy while reducing processing latency by $>80\%$ compared to cloud-only OCR. | Benchmark 50 digital PDFs and 50 scans through hybrid vs pure cloud OCR. | Hybrid latency $<200\text{ms}$ on digital; accuracy parity on scans. | Adopt hybrid tiered architecture as primary engine. | VALIDATED |
| **HYP-002** | Enforcing deterministic arithmetic validation ($Total = \sum Lines + Tax$) will catch $100\%$ of optical hallucination errors before data enters ERP. | Run adversarial test suite with injected mathematical discrepancies. | Zero invalid mathematical totals reach auto-approval. | Enshrine math validation as mandatory quality gate. | VALIDATED |
| **HYP-003** | A dual-pane visual review queue with SVG bounding boxes and full keyboard navigation (`Alt+A`, `Tab`) will reduce exception review time from 3 minutes to $<15$ seconds per document. | Headless browser interaction benchmark measuring time-to-resolve exceptions. | Review time $<15$ seconds per flagged document. | Prioritize keyboard-accelerated review queue in UX. | VALIDATED |
| **HYP-004** | Encapsulating document text in inert XML delimiters with zero LLM tools prevents $100\%$ of indirect prompt injection attempts from altering system state. | Inject 15 adversarial prompt injection payloads inside invoice test fixtures. | All injection strings parsed as passive text; zero instruction execution. | Enforce inert XML containment in prompt architecture. | VALIDATED |
