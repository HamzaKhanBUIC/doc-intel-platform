# Multimodal Extraction & Parsing Specification
## AI Product Factory — Session 03 — Document Intelligence

## 1. Layered Extraction Architecture

```
                       Input Document
                             |
                   +---------+---------+
                   |                   |
             Digital PDF           Scan / Image
                   |                   |
            [Native Stream]       [OCR Engine]
            - pdfplumber          - Tesseract / Vision
            - Vector Tables       - LayoutLM / Spatial OCR
                   |                   |
                   +---------+---------+
                             |
                     Spatial Token Stream
                 (Text, Coordinates, Confidence)
                             |
                 [Entity & Table Extractor]
                 - Header / Metadata Extractor
                 - Line Item Grid Stitcher
                 - Key-Value Associator
                             |
                     Raw Extracted Data
```

## 2. Spatial Provenance Extraction
Every candidate token must record normalized bounding box coordinates:
- `page_number`: 1-indexed page.
- `bounding_box`: `[x_min, y_min, x_max, y_max]` where coordinates are normalized $0.0 - 1.0$ relative to page width and height.
- `confidence`: Floating-point scalar $0.0 - 1.0$.

## 3. Lightest-Appropriate Extraction Principle
1. **Tier A (Fastest & Cheaper)**: Native digital text streams and structured spreadsheet grids are parsed deterministically without optical models.
2. **Tier B (Layout-Aware Parsing)**: Semi-structured forms utilize layout geometry and spatial distance token clustering.
3. **Tier C (Optical Fallback)**: Rasterized scans and degraded photos invoke OCR/vision extraction models.
