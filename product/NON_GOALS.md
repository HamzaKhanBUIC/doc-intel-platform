# Explicit Non-Goals
## AI Product Factory — Session 03 — Document Intelligence

To ensure rapid delivery, high craftsmanship, and zero scope creep, the following areas are strictly **OUT OF SCOPE** for the MVP:

1. **No Handwritten Medical Cursive**: The MVP does not attempt to parse complex unconstrained handwritten clinical doctor notes. (Constrained handwritten checkmarks and numbers on printed forms are supported).
2. **No Real-Time Bank Payment Execution**: The platform outputs validated accounting records and export feeds; it does not directly trigger ACH/wire money transfers.
3. **No General Legal Contract Interpretation**: The MVP does not perform open-ended legal clause risk assessments.
4. **No Legacy Fax Hardware Integration**: Ingestion is digital file-based (PDF, Image, CSV); direct analog fax modems are excluded.
5. **No Proprietary ERP Monolithic Plugins**: System interfaces via standard REST APIs, webhooks, and structured CSV/JSON exports rather than proprietary SAP NetWeaver ABAP extensions.
