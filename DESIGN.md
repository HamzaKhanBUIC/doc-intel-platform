# DocIntel — Enterprise Design System Specification (`DESIGN.md`)
**Version**: 2.0.0-pro  
**Archetype**: Modern Technical Financial Instrument (Fusion of Linear Precision & Stripe/Ramp Clean Slate)  
**Target Medium**: Desktop Cockpit (1440px–1920px), Tablet (768px–1024px), Mobile Triage (375px–430px)

---

## 1. Brand Essence & Visual Character

DocIntel is designed as a **high-precision accounts payable and document intelligence cockpit**. It is built for financial operators, accountants, and logistics directors who process thousands of complex documents.

### Guiding Principles:
1. **Zero Decorative Slop**: Every element, border, and badge must communicate verifiable operational data. No random purple glow meshes, floating cards without purpose, or generic AI badges.
2. **Surgical Spatial Provenance**: Direct visual coupling between the raw document canvas and structured data fields. The user must always see *where* a number came from on the source sheet.
3. **Deterministic Math Trust**: Invariant status is communicated with unambiguous visual hierarchy: Emerald (`#10B981`) when $\sum \text{Lines} == \text{Subtotal}$ and $\text{Subtotal} + \text{Tax} == \text{Total}$; Amber (`#F59E0B`) with exact dollar variance when an anomaly occurs.
4. **Keyboard-First Ergonomics**: Operators should be able to triage an entire review queue using pure keyboard shortcuts (`Alt+A`, `Alt+R`, `Alt+N`, `Alt+P`, `Ctrl+K`, `Tab`, `Enter`).

---

## 2. Color System & Semantic Tokens

The palette utilizes a layered charcoal/slate foundation engineered to minimize visual fatigue during long operational shifts while maintaining strict WCAG AAA contrast ratios.

```css
:root {
  /* Canvas & Surface Layers */
  --bg-app: #090D15;               /* Deepest void canvas */
  --bg-sidebar: #0C111C;           /* Sidebar & navigation rail */
  --bg-surface: #101623;           /* Primary panels & split viewports */
  --bg-card: #151D2E;              /* Interactive cards & containers */
  --bg-card-hover: #1B2438;        /* Hover elevation */
  --bg-input: #0B0F19;             /* Recessed input background */
  --bg-overlay: rgba(5, 8, 14, 0.75); /* Frosted modal backdrop */

  /* Boundary & Rule Tokens */
  --border-subtle: #1E283D;        /* Primary container strokes */
  --border-muted: #172033;         /* Internal table cell separators */
  --border-focus: #3B82F6;         /* Active keyboard focus stroke */
  --border-active: #60A5FA;        /* Selected tab highlight */

  /* Text & Foreground Tokens */
  --text-primary: #F8FAFC;         /* High-contrast headlines & values */
  --text-secondary: #94A3B8;       /* Labels, headers & metadata */
  --text-muted: #64748B;           /* Disabled states, placeholders */
  --text-dim: #475569;             /* Decorative symbols & slashes */

  /* Functional Accents */
  --accent-primary: #2563EB;       /* Primary CTA & interactive controls */
  --accent-primary-hover: #1D4ED8;
  --accent-success: #10B981;       /* Invariant verified / Approved */
  --accent-success-muted: rgba(16, 185, 129, 0.12);
  --accent-warning: #F59E0B;       /* Arithmetic mismatch / Review required */
  --accent-warning-muted: rgba(245, 158, 11, 0.12);
  --accent-danger: #EF4444;        /* Rejected / Severe syntax error */
  --accent-danger-muted: rgba(239, 68, 68, 0.12);
  --accent-indigo: #6366F1;        /* GL Coding & Vendor master */

  /* Spatial Provenance Coordinates */
  --bbox-default-stroke: #38BDF8;
  --bbox-default-fill: rgba(56, 189, 248, 0.10);
  --bbox-active-stroke: #F59E0B;
  --bbox-active-fill: rgba(245, 158, 11, 0.25);
  --bbox-error-stroke: #EF4444;
  --bbox-error-fill: rgba(239, 68, 68, 0.22);
}
```

---

## 3. Typography Hierarchy

A dual-font strategy: **Inter** handles all interface copy, navigation, and structural labels; **JetBrains Mono** powers all numerical figures, currencies, tax IDs, hashes, and tabular records.

| Style Role | Font Family | Size | Weight | Line Height | Tracking | Purpose |
|---|---|---|---|---|---|---|
| `display-lg` | Inter | 20px | 700 | 28px | `-0.025em` | View titles & Modal headers |
| `headline-md` | Inter | 16px | 600 | 22px | `-0.02em` | Section headers & Document titles |
| `headline-sm` | Inter | 14px | 600 | 20px | `-0.015em` | Card titles & Group headers |
| `body-md` | Inter | 13px | 400 / 500 | 18px | `-0.01em` | Standard text & descriptions |
| `body-sm` | Inter | 12px | 400 / 500 | 16px | `0` | Form labels, helper text |
| `caption` | Inter | 11px | 600 | 14px | `+0.04em` | Uppercase section badges |
| `data-mono` | JetBrains Mono | 13px | 500 / 600 | 18px | `-0.02em` | Financial figures & totals |
| `data-mono-sm` | JetBrains Mono | 11px | 500 | 14px | `0` | SHA hashes, dates, GL codes |

**Font Features**: Enforces `font-feature-settings: "tnum" 1, "cv02" 1, "cv03" 1, "cv04" 1, "cv11" 1` for perfect vertical alignment of tabular numbers.

---

## 4. Spacing Scale & Spatial Rhythm (4px Grid)

- `space-1`: 4px — Micro margins, badge padding
- `space-2`: 8px — Button gap, icon margins, small cell padding
- `space-3`: 12px — Input padding, card internal spacing
- `space-4`: 16px — Standard container padding, form gaps
- `space-5`: 20px — Header margins, panel gutters
- `space-6`: 24px — Workspace section gaps
- `space-8`: 32px — Canvas margins & document viewport gutters

---

## 5. Shape, Elevation & Depth

- **Border Radius**:
  - `radius-sm`: 4px (Buttons, badges, inputs, table cells)
  - `radius-md`: 6px (Cards, dropdowns, toolbars)
  - `radius-lg`: 8px (Modals, viewports, preview canvas)
  - `radius-full`: 9999px (Pills, indicator dots)
- **Elevation & Shadows**:
  - `shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.3)` (Buttons & inputs)
  - `shadow-md`: `0 4px 12px rgba(0, 0, 0, 0.45)` (Cards & menus)
  - `shadow-lg`: `0 12px 36px rgba(0, 0, 0, 0.65)` (Modals & Drawers)
  - `shadow-paper`: `0 16px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)` (Source document sheet)

---

## 6. Motion & Micro-Interactions

- **Duration**: `120ms` for hover/active states; `180ms` for panel transitions and modals.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (Snappy, mechanical precision).
- **Interactions**:
  - Active button press: `transform: scale(0.985)`.
  - SVG Bounding Box hover: coordinate stroke sharpens with smooth glowing transition.
  - Form validation: instant color and status update without layout jitter.
