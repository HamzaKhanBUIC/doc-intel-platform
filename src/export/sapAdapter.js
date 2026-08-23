/**
 * SAP S/4HANA ERP Export Adapter
 * Converts validated InvoiceData into SAP BAPI_INCOMINGINVOICE_CREATE / IDoc INVOIC02 structure.
 */

export class SapAdapter {
  constructor() {}

  /**
   * Convert document into SAP S/4HANA BAPI Incoming Invoice payload
   * @param {any} document
   * @returns {any} SAP S/4HANA Invoice Payload
   */
  exportToSapInvoice(document) {
    const data = document.extractedData || {};

    const itemData = (data.lineItems || []).map((item, idx) => ({
      INVOICE_DOC_ITEM: String(idx + 1).padStart(6, '0'),
      PO_NUMBER: data.invoiceNumber?.value?.startsWith('PO') ? data.invoiceNumber.value : undefined,
      PO_ITEM: String(idx + 1).padStart(5, '0'),
      ITEM_TEXT: item.description.substring(0, 40),
      QUANTITY: item.quantity,
      PO_UNIT: 'ST', // Pieces / Stück
      ITEM_AMOUNT: item.amount,
      TAX_CODE: data.taxAmount > 0 ? 'V1' : 'V0'
    }));

    return {
      HEADERDATA: {
        INVOICE_IND: 'X',
        DOC_TYPE: 'RE', // Vendor Invoice
        DOC_DATE: (data.invoiceDate?.value || '').replace(/-/g, ''),
        PSTNG_DATE: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        REF_DOC_NO: data.invoiceNumber?.value || document.id,
        COMP_CODE: '1000', // Standard Company Code
        GROSS_AMOUNT: data.totalAmount || 0,
        CURRENCY: data.currency || 'USD',
        CALC_TAX_IND: 'X',
        PMNTTRMS: 'ZB01',
        HEADER_TXT: `DocIntel ${document.id}`
      },
      ITEMDATA: itemData,
      TAXDATA: data.taxAmount > 0 ? [
        {
          TAX_CODE: 'V1',
          TAX_AMOUNT: data.taxAmount
        }
      ] : [],
      metadata: {
        exportedAt: new Date().toISOString(),
        targetSystem: 'SAP S/4HANA BAPI_INCOMINGINVOICE_CREATE',
        documentId: document.id
      }
    };
  }
}
