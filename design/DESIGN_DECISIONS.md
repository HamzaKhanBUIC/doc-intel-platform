# Design Decision Records (DDR)
## AI Product Factory — Session 03 — Document Intelligence

## DDR-001: Dual-Pane Synchronized Split Layout
- **Decision**: Reject multi-tab modal switching in favor of a permanent side-by-side split screen (PDF Viewer Left / Form Right).
- **Rationale**: Context switching between tabs or modal overlays causes severe cognitive fatigue for clerks. Side-by-side viewing enables immediate peripheral verification.

## DDR-002: SVG Vector Bounding-Box Overlay Layer
- **Decision**: Render bounding boxes as responsive SVG overlay vectors aligned to canvas pixel coordinates rather than raster image burn-ins.
- **Rationale**: Allows smooth CSS transitions, interactive hover animations, dynamic color changes (blue $ightarrow$ green $ightarrow$ red), and crisp rendering at any zoom level.

## DDR-003: Monospace Font for All Numeric Financials
- **Decision**: Enforce `JetBrains Mono` for all currency, amount, tax, and line-item numerical figures.
- **Rationale**: Monospaced tabular digits ensure strict decimal point vertical alignment across line item grids, making digit misalignments immediately visible to the human eye.
