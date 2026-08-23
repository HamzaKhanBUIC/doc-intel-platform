/**
 * Deterministic Arithmetic & Cross-Field Validation Engine
 */

export class ValidationEngine {
  constructor(tolerance = 0.01) {
    this.tolerance = tolerance;
  }

  /**
   * Validate extracted invoice data against mathematical and syntactic invariants
   * @param {any} invoiceData
   * @param {Array<any>} existingDocuments
   * @returns {any} ValidationResult
   */
  validate(invoiceData, existingDocuments = []) {
    const errors = [];
    let arithmeticPassed = true;

    // 1. Check Line Item Calculations: Qty * UnitPrice == Amount
    if (invoiceData.lineItems && Array.isArray(invoiceData.lineItems)) {
      for (const item of invoiceData.lineItems) {
        const expectedAmount = Math.round(item.quantity * item.unitPrice * 100) / 100;
        const diff = Math.abs(expectedAmount - item.amount);
        if (diff > this.tolerance) {
          arithmeticPassed = false;
          errors.push({
            field: `lineItem_${item.id}`,
            message: `Line item '${item.description}' arithmetic mismatch: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${expectedAmount.toFixed(2)}, but extracted amount is $${item.amount.toFixed(2)}.`,
            severity: 'ERROR'
          });
        }
      }
    }

    // 2. Check Line Item Sum == Subtotal
    const calculatedSubtotal = invoiceData.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const subtotalDiff = Math.abs(calculatedSubtotal - invoiceData.subtotal);
    if (subtotalDiff > this.tolerance) {
      arithmeticPassed = false;
      errors.push({
        field: 'subtotal',
        message: `Subtotal mismatch: Sum of line items ($${calculatedSubtotal.toFixed(2)}) does not equal extracted Subtotal ($${invoiceData.subtotal.toFixed(2)}).`,
        severity: 'ERROR'
      });
    }

    // 3. Check Subtotal + Tax - Discount + Shipping == TotalAmount
    const expectedTotal = Math.round((invoiceData.subtotal + invoiceData.taxAmount - invoiceData.discountAmount + invoiceData.shippingAmount) * 100) / 100;
    const totalDiff = Math.abs(expectedTotal - invoiceData.totalAmount);
    if (totalDiff > this.tolerance) {
      arithmeticPassed = false;
      errors.push({
        field: 'totalAmount',
        message: `Grand total mismatch: Subtotal ($${invoiceData.subtotal.toFixed(2)}) + Tax ($${invoiceData.taxAmount.toFixed(2)}) - Discount ($${invoiceData.discountAmount.toFixed(2)}) + Shipping ($${invoiceData.shippingAmount.toFixed(2)}) = $${expectedTotal.toFixed(2)}, but extracted Total is $${invoiceData.totalAmount.toFixed(2)}.`,
        severity: 'ERROR'
      });
    }

    // 4. Duplicate Invoice Detection
    const duplicate = existingDocuments.find(d => 
      d.extractedData && 
      d.extractedData.invoiceNumber && 
      d.extractedData.invoiceNumber.value === invoiceData.invoiceNumber.value &&
      d.extractedData.vendorName &&
      d.extractedData.vendorName.value === invoiceData.vendorName.value &&
      d.id !== invoiceData.documentId
    );

    if (duplicate) {
      errors.push({
        field: 'invoiceNumber',
        message: `Duplicate invoice detected: Invoice #${invoiceData.invoiceNumber.value} for vendor '${invoiceData.vendorName.value}' already exists (Document ID: ${duplicate.id}).`,
        severity: 'ERROR'
      });
    }

    // 5. Date Sanity Check
    if (invoiceData.invoiceDate && invoiceData.invoiceDate.value) {
      const invDate = new Date(invoiceData.invoiceDate.value);
      const maxFutureDate = new Date();
      maxFutureDate.setDate(maxFutureDate.getDate() + 45); // Max 45 days in future
      if (invDate > maxFutureDate) {
        errors.push({
          field: 'invoiceDate',
          message: `Date anomaly: Invoice date ${invoiceData.invoiceDate.value} is unexpectedly far in the future.`,
          severity: 'WARNING'
        });
      }
    }

    // 6. Low Confidence Check
    const lowConfidenceFields = [];
    if (invoiceData.invoiceNumber && invoiceData.invoiceNumber.confidence < 0.85) lowConfidenceFields.push('Invoice Number');
    if (invoiceData.vendorName && invoiceData.vendorName.confidence < 0.85) lowConfidenceFields.push('Vendor Name');
    if (invoiceData.invoiceDate && invoiceData.invoiceDate.confidence < 0.85) lowConfidenceFields.push('Invoice Date');

    if (lowConfidenceFields.length > 0) {
      errors.push({
        field: 'confidence',
        message: `Low extraction confidence detected on fields: ${lowConfidenceFields.join(', ')}. Manual verification recommended.`,
        severity: 'WARNING'
      });
    }

    const isValid = errors.filter(e => e.severity === 'ERROR').length === 0;

    return {
      isValid,
      arithmeticPassed,
      errors
    };
  }
}
