/**
 * Analytics, Spend Aggregation, and Export Service
 */

export class ReportingService {
  constructor() {}

  /**
   * Generate aggregated financial summary across all approved documents
   * @param {Array<any>} documents
   */
  generateFinancialSummary(documents) {
    const approvedDocs = documents.filter(d => d.status === 'APPROVED' && d.extractedData);
    
    let totalSpend = 0;
    let totalTax = 0;
    const vendorMap = {};
    const categoryMap = {};

    for (const doc of approvedDocs) {
      const data = doc.extractedData;
      totalSpend += data.totalAmount || 0;
      totalTax += data.taxAmount || 0;

      const vendor = data.vendorName?.value || 'Unknown Vendor';
      vendorMap[vendor] = (vendorMap[vendor] || 0) + (data.totalAmount || 0);

      const category = doc.category || 'General';
      categoryMap[category] = (categoryMap[category] || 0) + (data.totalAmount || 1);
    }

    const topVendors = Object.entries(vendorMap)
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }));

    return {
      totalDocuments: documents.length,
      approvedCount: approvedDocs.length,
      reviewRequiredCount: documents.filter(d => d.status === 'REVIEW_REQUIRED').length,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      topVendors,
      categoryBreakdown
    };
  }

  /**
   * Export documents to CSV format
   * @param {Array<any>} documents
   */
  exportToCsv(documents) {
    const headers = ['Document ID', 'Status', 'Invoice Number', 'Invoice Date', 'Vendor', 'Subtotal', 'Tax', 'Total', 'Currency', 'Line Items Count'];
    const rows = documents.map(d => {
      const data = d.extractedData || {};
      return [
        d.id,
        d.status,
        data.invoiceNumber?.value || '',
        data.invoiceDate?.value || '',
        `"${(data.vendorName?.value || '').replace(/"/g, '""')}"`,
        data.subtotal || 0,
        data.taxAmount || 0,
        data.totalAmount || 0,
        data.currency || 'USD',
        data.lineItems?.length || 0
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
