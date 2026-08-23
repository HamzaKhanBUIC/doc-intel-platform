/**
 * Categorization, Lineage Ledger, and Audit Tracker
 */

export class CategorizationService {
  constructor() {}

  /**
   * Classify document into accounting / operational categories
   * @param {any} invoiceData
   * @returns {string} Category tag
   */
  categorizeSpend(invoiceData) {
    if (!invoiceData) return 'General Expense';
    const text = (invoiceData.vendorName?.value + ' ' + (invoiceData.lineItems?.map(l => l.description).join(' ') || '')).toLowerCase();

    if (text.includes('freight') || text.includes('logistics') || text.includes('carrier') || text.includes('shipping')) {
      return 'Logistics & Freight';
    }
    if (text.includes('hardware') || text.includes('valve') || text.includes('fitting') || text.includes('parts') || text.includes('industrial')) {
      return 'Cost of Goods Sold (COGS) - Supplies';
    }
    if (text.includes('software') || text.includes('saas') || text.includes('cloud') || text.includes('hosting')) {
      return 'Software & Technology';
    }
    if (text.includes('hotel') || text.includes('airline') || text.includes('restaurant') || text.includes('meal')) {
      return 'Travel & Entertainment';
    }
    return 'Office & General Operations';
  }

  /**
   * Create an audit lineage entry
   */
  createAuditEntry(actor, action, note = '') {
    return {
      timestamp: new Date().toISOString(),
      actor,
      action,
      note
    };
  }
}
