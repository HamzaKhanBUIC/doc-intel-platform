/**
 * Xero Accounting ERP Export Adapter
 * Converts validated InvoiceData into Xero API Invoices (ACCPAY Accounts Payable) schema.
 */

export class XeroAdapter {
  constructor() {}

  /**
   * Convert document into Xero ACCPAY Invoice schema
   * @param {any} document
   * @returns {any} Xero Invoice Payload
   */
  exportToInvoice(document) {
    const data = document.extractedData || {};

    const lineItems = (data.lineItems || []).map(item => ({
      Description: item.description,
      Quantity: item.quantity,
      UnitAmount: item.unitPrice,
      LineAmount: item.amount,
      AccountCode: '300', // Default Direct Costs
      TaxType: data.taxAmount > 0 ? 'INPUT' : 'NONE',
      TaxAmount: Math.round((item.amount * ((data.taxRate || 0) / 100)) * 100) / 100
    }));

    return {
      Invoice: {
        Type: 'ACCPAY', // Accounts Payable Bill
        Contact: {
          Name: data.vendorName?.value || 'Unknown Vendor',
          TaxNumber: data.vendorTaxId?.value || undefined
        },
        InvoiceNumber: data.invoiceNumber?.value || document.id,
        Date: data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        DueDate: data.dueDate?.value || data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        CurrencyCode: data.currency || 'USD',
        Status: 'AUTHORISED',
        LineAmountTypes: 'Exclusive',
        SubTotal: data.subtotal || 0,
        TotalTax: data.taxAmount || 0,
        Total: data.totalAmount || 0,
        LineItems: lineItems,
        Reference: `DOC_INTEL_${document.id}`
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        targetSystem: 'Xero Accounting API v2.0',
        documentId: document.id
      }
    };
  }
}
