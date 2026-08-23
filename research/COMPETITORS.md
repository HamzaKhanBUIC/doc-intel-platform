# Competitive Teardown & Benchmarking Matrix
## AI Product Factory — Session 03 — Document Intelligence

## 1. Competitive Landscape Matrix

| Competitor | Engine Type | Strengths | Critical Weaknesses & Gaps | Pricing / Cost | Differentiation Angle |
|---|---|---|---|---|---|
| **AWS Textract** | Cloud OCR + Specialized APIs (AnalyzeDocument) | Strong AWS integration; solid raw printed text extraction; good table key-value detection. | 1. High latency (3-8s/page).<br>2. Weak on mathematical validation.<br>3. Silent errors on skewed tables.<br>4. No out-of-the-box review UI. | $0.015 - $0.05 / page | Our platform provides instant deterministic arithmetic validation and built-in human review queue. |
| **Azure AI Document Intelligence** | Prebuilt Neural Document Models | Highest printed text accuracy (~96%); strong prebuilt invoice & receipt models (87% line item). | 1. Heavy cloud vendor lock-in.<br>2. Struggles with non-standard European date formats.<br>3. Complex custom model training overhead. | $0.01 - $0.05 / page | Our platform provides a decoupled 6-tier hybrid pipeline that runs locally with zero mandatory cloud egress. |
| **Google Cloud Document AI** | Specialized Processors (Invoice, Form) | High handwriting accuracy; strong entity graph parsing. | 1. Expensive enterprise licensing.<br>2. Rigid processor schemas.<br>3. Black-box confidence scoring without lineage explanations. | $0.03 - $0.10 / page | Full spatial provenance and transparent transformation audit trail (`raw -> norm -> val`). |
| **Rossum / Klippa** | Vertical AP SaaS Platforms | Turnkey AP workflow; pleasant web UI review queue. | 1. Extremely expensive ($15k - $50k/yr base).<br>2. Proprietary black box.<br>3. Poor handling of non-invoice logistics/ops documents. | $0.20 - $0.80 / page | Accessible, open, modular architecture supporting multi-format documents (PDFs, spreadsheets, receipts, BOLs). |
| **Tesseract / PaddleOCR** | Open-Source OCR Engines | Free, open-source, local execution, privacy preserving. | 1. Zero semantic understanding.<br>2. Horrible table structure parsing.<br>3. Fragile token bounding boxes on low DPI. | Free / Self-hosted | We combine lightweight stream extraction with deterministic spatial tokenizers and schema validators. |

---

## 2. Key Differentiation & Moat Vectors
1. **Deterministic Validation Priority**: Unlike pure LLM or pure OCR tools, we enforce mathematical invariants ($Total = Subtotal + Tax$) before trusting model output.
2. **Hybrid Tiered Routing**: We do not run expensive OCR on clean digital vector PDFs; we extract text streams in $<50\text{ms}$ at near-zero cost.
3. **High-Speed Dual-Pane Review Queue**: Visual spatial bounding-box overlay with full keyboard shortcuts (`Alt+A`, `Tab`, `Enter`) allowing clerks to resolve exceptions in seconds.
4. **Zero-Trust Indirect Prompt Injection Defense**: Hardened parser isolation preventing malicious document instructions from hijacking system behaviors.
