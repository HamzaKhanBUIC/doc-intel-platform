# Failure Recovery & Resiliency Specification
## AI Product Factory — Session 03 — Document Intelligence

## 1. Failure Taxonomy
1. **Transient Network / Model Failure**: API rate limits, temporary socket timeout.
   - *Mitigation*: Exponential backoff with jitter (max 3 retries: 1s, 2s, 4s).
2. **Corrupted / Unparseable Document**: Truncated PDF stream, unreadable image.
   - *Mitigation*: Mark document as `PARSE_FAILED`, capture structured error code, route to manual re-upload / manual entry queue.
3. **Validation Failure (Math Mismatch)**: Extraction succeeded but line items do not sum to total.
   - *Mitigation*: Keep extracted data intact, mark validation as `FAILED`, route to Review Queue with highlighted mismatch.
4. **Host Resource Constraint**: Memory threshold exceeded during large PDF rendering.
   - *Mitigation*: Process pages sequentially or downsample resolution to 150 DPI.
