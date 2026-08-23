/**
 * Oracle NetSuite ERP Export Adapter
 * Converts validated InvoiceData into NetSuite SuiteTalk REST / SOAP VendorBill payload.
 */

export class NetSuiteAdapter {
  constructor() {}

  /**
   * Convert document into NetSuite VendorBill entity
   * @param {any} document
   * @returns {any} NetSuite VendorBill Schema
   */
  exportToVendorBill(document) {
    const data = document.extractedData || {};

    const itemList = (data.lineItems || []).map((item, idx) => ({
      line: idx + 1,
      item: {
        id: `ITEM_${idx + 1}`,
        refName: item.description.substring(0, 50)
      },
      quantity: item.quantity,
      rate: item.unitPrice,
      amount: item.amount,
      taxCode: {
        refName: data.taxAmount > 0 ? 'AVATAX' : 'NON-TAXABLE'
      },
      memo: item.description
    }));

    return {
      vendorBill: {
        entity: {
          id: `VEND_${(data.vendorName?.value || 'GEN').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12).toUpperCase()}`,
          refName: data.vendorName?.value || 'Unknown Vendor'
        },
        tranId: data.invoiceNumber?.value || document.id,
        tranDate: data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate?.value || data.invoiceDate?.value || new Date().toISOString().split('T')[0],
        currency: {
          refName: data.currency || 'USD'
        },
        userTotal: data.totalAmount || 0,
        subTotal: data.subtotal || 0,
        taxTotal: data.taxAmount || 0,
        itemList: {
          item: itemList
        },
        memo: `Document Intelligence Sync | Hash: ${document.sha256?.substring(0, 16)}`,
        approvalStatus: {
          id: '2',
          refName: 'Approved'
        }
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        targetSystem: 'Oracle NetSuite SuiteTalk REST API 2024.1',
        documentId: document.id
      }
    };
  }
}
