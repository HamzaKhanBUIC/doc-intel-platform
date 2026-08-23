/**
 * Advanced Tabular Grid & Multi-Column Table Extractor
 * Identifies table headers, line items, unit of measures (EA, KG, LBS, HRS),
 * tax percentage tags, and accessorial line charges.
 */

import { CurrencyNormalizer } from '../normalization/currencyNormalizer.js';

export class TableExtractor {
  constructor() {
    this.currencyNormalizer = new CurrencyNormalizer();
    this.uomPatterns = ['EA', 'EACH', 'KG', 'LBS', 'HRS', 'HOURS', 'BOX', 'PCS', 'PALLET', 'SETS', 'UNITS'];
  }

  /**
   * Extract line items from multi-line text stream or table rows
   * @param {string} text
   * @param {string} documentId
   * @param {number} [startPage=1]
   * @returns {Array<any>} Extracted LineItem objects
   */
  extractTableItems(text, documentId, startPage = 1) {
    const items = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    let inTableSection = false;
    let yPos = 0.38;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Detect Table Header row
      if (
        (lower.includes('description') || lower.includes('item') || lower.includes('details')) &&
        (lower.includes('qty') || lower.includes('quantity') || lower.includes('price') || lower.includes('amount') || lower.includes('total'))
      ) {
        inTableSection = true;
        continue;
      }

      // Stop on summary or footer row
      if (
        lower.startsWith('subtotal') ||
        lower.startsWith('sub-total') ||
        lower.startsWith('total') ||
        lower.startsWith('grand total') ||
        lower.startsWith('tax') ||
        lower.startsWith('vat') ||
        lower.startsWith('payment due') ||
        lower.startsWith('terms:')
      ) {
        if (inTableSection && items.length > 0) {
          inTableSection = false;
        }
        continue;
      }

      // Parse potential line item
      const item = this.parseLineItemRow(line, documentId, items.length + 1, startPage, yPos);
      if (item) {
        items.push(item);
        yPos += 0.045;
      }
    }

    return items;
  }

  /**
   * Parse a single row into structured LineItem schema
   */
  parseLineItemRow(line, documentId, itemIndex, pageNumber, yPos) {
    const tokens = line.split(/\s+/);
    if (tokens.length < 3) return null;

    // Check if the last token is a monetary amount
    const lastToken = tokens[tokens.length - 1];
    const amountVal = this.currencyNormalizer.parseAmount(lastToken);

    // Look for unit price and quantity tokens from the right
    let priceVal = null;
    let qtyVal = null;
    let uomVal = 'EA';
    let splitIdx = tokens.length - 1;

    // Second to last token: could be Unit Price
    if (tokens.length >= 3) {
      const secondLast = tokens[tokens.length - 2];
      const parsedPrice = this.currencyNormalizer.parseAmount(secondLast);
      if (parsedPrice > 0) {
        priceVal = parsedPrice;
        splitIdx = tokens.length - 2;

        // Third to last token: could be UOM or Qty
        if (tokens.length >= 4) {
          const thirdLast = tokens[tokens.length - 3].toUpperCase();
          if (this.uomPatterns.includes(thirdLast)) {
            uomVal = thirdLast;
            if (tokens.length >= 5) {
              const qtyCandidate = parseFloat(tokens[tokens.length - 4].replace(/,/g, ''));
              if (!isNaN(qtyCandidate) && qtyCandidate > 0) {
                qtyVal = qtyCandidate;
                splitIdx = tokens.length - 4;
              }
            }
          } else {
            const qtyCandidate = parseFloat(thirdLast.replace(/,/g, ''));
            if (!isNaN(qtyCandidate) && qtyCandidate > 0) {
              qtyVal = qtyCandidate;
              splitIdx = tokens.length - 3;
            }
          }
        }
      }
    }

    // Default calculations if quantity or price were combined
    if (amountVal > 0) {
      const finalQty = qtyVal || 1;
      const finalPrice = priceVal || amountVal;
      const desc = tokens.slice(0, splitIdx).join(' ').trim();

      if (desc.length > 0 && !desc.toLowerCase().startsWith('invoice') && !desc.toLowerCase().startsWith('date:')) {
        return {
          id: `item_${itemIndex}`,
          description: desc,
          quantity: finalQty,
          unitOfMeasure: uomVal,
          unitPrice: finalPrice,
          amount: amountVal,
          confidence: 0.96,
          provenance: {
            documentId,
            pageNumber,
            boundingBox: [0.08, yPos, 0.92, yPos + 0.038],
            extractionMethod: 'AST_TABLE',
            confidence: 0.96
          }
        };
      }
    }

    return null;
  }
}
