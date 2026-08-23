# Design System & Token Specification
## AI Product Factory — Session 03 — Document Intelligence

## 1. Color Palette Tokens

```css
:root {
  /* Brand & Neutral Foundation */
  --color-canvas-bg: #0B0F17;        /* Deep Space Void */
  --color-surface-card: #131B2A;     /* Dark Slate Surface */
  --color-surface-hover: #1E293B;    /* Interactive Slate */
  --color-border-subtle: #243247;    /* Subtle Hairline Border */
  --color-border-focus: #3B82F6;     /* Bright Accent Focus */

  /* Typography */
  --color-text-primary: #F8FAFC;    /* High Contrast Pure White */
  --color-text-secondary: #94A3B8;  /* Readable Slate Gray */
  --color-text-muted: #64748B;      /* Low Contrast Helper Text */

  /* Operational Status & Confidence Colors */
  --color-status-approved: #10B981;  /* Emerald Success */
  --color-status-review: #F59E0B;    /* Amber Warning */
  --color-status-rejected: #EF4444;  /* Rose Danger */
  --color-status-parsing: #6366F1;   /* Indigo Ingestion */

  /* Spatial Provenance Bounding Box Tokens */
  --bbox-normal-stroke: #3B82F6;
  --bbox-normal-fill: rgba(59, 130, 246, 0.12);
  --bbox-focus-stroke: #60A5FA;
  --bbox-focus-fill: rgba(96, 165, 250, 0.28);
  --bbox-error-stroke: #EF4444;
  --bbox-error-fill: rgba(239, 68, 68, 0.25);
}
```

---

## 2. Typography Hierarchy
- **UI & Controls Font**: `Inter`, `-apple-system`, `sans-serif` (Optimal readability at small sizes).
- **Tabular & Financial Data Font**: `JetBrains Mono`, `Fira Code`, `monospace` (Tabular numeric figures with strict column alignment).

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `font-title-lg` | 20px (1.25rem) | 600 (Semibold) | 1.4 | Screen Header, Document Title |
| `font-body-md` | 14px (0.875rem) | 400 (Regular) | 1.5 | Form Labels, Field Values |
| `font-mono-data` | 13px (0.8125rem) | 500 (Medium) | 1.4 | Financial Amounts, Line Item Numbers |
| `font-badge-sm` | 11px (0.6875rem) | 600 (Semibold) | 1.2 | Status Badges, Confidence Percentages |

---

## 3. Spatial Rhythm & Elevation
- **Base Grid Scale**: 4px / 8px incremental scale (`p-1`: 4px, `p-2`: 8px, `p-3`: 12px, `p-4`: 16px, `p-6`: 24px).
- **Corner Radii**: `rounded-md` (6px) for inputs/buttons; `rounded-lg` (8px) for cards and modals.
- **Elevation Shadow**: Subtle dark borders (`border border-[#243247]`) with `shadow-sm` and `shadow-lg` for dropdown overlays.
