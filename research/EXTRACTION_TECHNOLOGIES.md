# Extraction Technologies & Architecture Comparison
## AI Product Factory — Session 03 — Document Intelligence

## 1. Comprehensive Technology Benchmark & Evaluation

| Technology Category | Tools & Libraries | Extraction Speed | Compute Cost | Table Extraction Accuracy | Spatial Provenance Support | Primary Failure Modes | Best Use-Case |
|---|---|---|---|---|---|---|---|
| **Native Digital PDF Parsers** | `pdfplumber`, `pypdf`, `pdfminer.six`, `Poppler` | **Ultra-Fast** (<50ms/page) | **Near-Zero** (CPU only) | **High** (on vector PDFs) | **Exact** (Character-level glyph boxes) | Fails completely on scanned raster images; font encoding corruption. | Digital vector PDFs, clean system-generated invoices. |
| **Traditional OCR Engines** | `Tesseract OCR`, `PaddleOCR`, `EasyOCR` | **Medium** (200-800ms/page) | **Low** (CPU / Light GPU) | **Low-to-Medium** (struggles with borderless tables) | **Good** (Word / Line bounding boxes) | Character confusion ($0$ vs $O$, $1$ vs $l$); table column bleed. | Scanned PDFs, black-and-white TIFFs, printed forms. |
| **Commercial Cloud IDP APIs** | `AWS Textract`, `Azure Doc Intelligence`, `Google Doc AI` | **Slow** (2.5 - 6.0s/page) | **High** ($15 - $50 per 1k pages) | **High** (85-95%) | **Excellent** (Polygon coordinates) | Network latency; cloud egress privacy risk; proprietary black box. | Fallback for complex unstructured enterprise scans. |
| **Multimodal Vision Models** | `LayoutLMv3`, `Donut`, `Florence-2`, `ColPali` | **Medium** (500-1500ms/page) | **Medium-to-High** (GPU required) | **High** (88-94%) | **Good** (Token-level spatial embeddings) | High memory footprint; occasional hallucination on micro-digits. | Dense forms with visual key-value layout dependencies. |
| **LLM Schema Extraction** | `Gemini 1.5/2.0`, `GPT-4o` (JSON Schema) | **Variable** (1.0 - 4.0s/call) | **Medium** ($2 - $10 per 1k calls) | **High** (Semantic parsing) | **Weak / Inferred** (unless multimodal coords provided) | Arithmetic hallucination; potential indirect prompt injection vulnerabilities. | Complex semantic categorization, messy text normalization. |
| **Deterministic Structured Parsers** | `csv`, `xlsx/openpyxl`, regex state machines | **Instant** (<5ms) | **Zero** | **100%** (on valid grids) | **Cell Row/Col coordinates** | Rigid delimiter assumptions; breaks on merged cells. | Spreadsheets, CSVs, standardized EDI/XML files. |

---

## 2. The Winning Hybrid Pipeline Architecture

$$\text{Input} \longrightarrow \text{MIME / Stream Sniffer} \longrightarrow \begin{cases} \text{Spreadsheet} & \longrightarrow \text{AST Grid Parser} \\ \text{Digital PDF} & \longrightarrow \text{Native Stream Extractor (pdfplumber)} \\ \text{Scan / Image} & \longrightarrow \text{Spatial OCR / Vision Engine} \end{cases} \longrightarrow \text{Deterministic Normalizer} \longrightarrow \text{Validation Engine}$$

### Why Hybrid Wins Over Monolithic AI
1. **Latency & Cost Efficiency**: 70% of business invoices are digital PDFs. Processing them natively takes **35 milliseconds and $0 in API fees**, whereas sending them to a vision LLM takes **3 seconds and costs money**.
2. **Deterministic Arithmetic Precision**: LLMs hallucinate floating-point arithmetic. Our hybrid architecture runs optical/stream extraction for candidate tokens, but calculates totals with **100% IEEE floating-point code**.
3. **Security Isolation**: Running extraction locally prevents document exfiltration and shields against remote LLM hijacking.
