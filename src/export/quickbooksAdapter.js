/**
 * QuickBooks Online ERP Export Adapter
 * Converts validated InvoiceData entities into Intuit QuickBooks Online Bill / Purchase API JSON schema.
 */

export class QuickBooksAdapter {
  constructor() {}

  /**
   * Convert document into QuickBooks Online Bill entity
   * @param {any} document
   * @returns {any} QuickBooks Bill API Payload
   */
  exportToBill(document) {
    const data = document.extractedData || {};

    const lineItems = (data.lineItems || []).map((item, index) => ({
      Id: String(index + 1),
      LineNum: index + 1,
      Description: item.description,
      Amount: item.amount,
      DetailType: 'ItemBasedExpenseLineDetail',
      ItemBasedExpenseLineDetail: {
        ItemRef: {
          name: item.description.substring(0, 31),
          value: `ITEM_${index + 1}`
        },
        UnitPrice: item.unitPrice,
        Qty: item.quantity,
        TaxCodeRef: {
          value: data.taxAmount > 0 ? 'TAX' : 'NON'
        }
      }
    }));

    return {
      Bill: {
        DocNumber: data.invoiceNumber?.value || document.id,
        TxnDate: data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        DueDate: data.dueDate?.value || data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        VendorRef: {
          name: data.vendorName?.value || 'Unknown Vendor',
          value: `VEND_${(data.vendorName?.value || 'GEN').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}`
        },
        CurrencyRef: {
          value: data.currency || 'USD'
        },
        TotalAmt: data.totalAmount || 0,
        Line: lineItems,
        PrivateNote: `Automated Ingestion via Document Intelligence Platform | Document ID: ${document.id} | SHA-256: ${document.sha256?.substring(0, 16)}...`,
        GlobalTaxCalculation: data.taxAmount > 0 ? 'TaxExcluded' : 'NotApplicable',
        TxnTaxDetail: {
          TotalTax: data.taxAmount || 0
        }
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        targetSystem: 'QuickBooks Online v3 API',
        documentId: document.id
      }
    };
  }
}
