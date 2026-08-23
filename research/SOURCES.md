# Research Sources & Primary References
## AI Product Factory — Session 03 — Document Intelligence

## 1. Industry Benchmarks & Operational Research
1. **Ardent Partners AP Metrics Benchmark Report (2025/2026)**:
   - Evaluates average cost per invoice ($15.00 - $16.50 manual vs $2.36 best-in-class automated).
   - Documents invoice cycle times (10-20 days manual vs 2-4 days automated).
   - Citation: [Ardent Partners AP Metrics](https://ardentpartners.com)
2. **Institute of Financial Management (IOFM) AP Benchmark Study**:
   - Quantifies rework cost per invoice error ($53.50 average rework cost).
   - Identifies duplicate payment incidence rate (0.1% - 0.5% of total spend).
   - Citation: [IOFM Benchmarking](https://iofm.com)
3. **DeltOCR Bench & ImageToTable IDP Independent Benchmark (Nov 2025)**:
   - Line-item table extraction accuracy comparison across AWS Textract (84.2%), Azure AI Document Intelligence (87.4%), and Google Doc AI (85.1%).
   - Citation: [DeltOCR Bench Evaluation](https://imagetotable.ai)

## 2. Technical Specifications & RFC Standards
1. **ISO 32000-1 / ISO 32000-2**: Document Management — Portable Document Format (PDF 1.7 & PDF 2.0 specifications on font glyph streams, Content Streams, and ToUnicode mappings).
2. **ISO 8601-1:2019**: Date and time representations (`YYYY-MM-DD`).
3. **ISO 4217**: Currency representation codes (`USD`, `EUR`, `GBP`, `JPY`).
4. **UN/EDIFACT & ANSI X12 Standards**: Electronic Data Interchange specifications for Purchase Orders (850), Invoices (810), and Bills of Lading (211).
5. **OWASP Top 10 for Large Language Models (LLM01: Prompt Injection)**:
   - Technical guidelines for mitigating Indirect Prompt Injection in document processing systems.
   - Citation: [OWASP LLM Security Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
