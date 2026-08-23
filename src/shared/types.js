/**
 * Core Domain Types & Schemas for Document Intelligence Platform
 */

/**
 * @typedef {[number, number, number, number]} BoundingBox [x1, y1, x2, y2] normalized 0.0 - 1.0
 */

/**
 * @typedef {Object} Provenance
 * @property {string} documentId
 * @property {number} pageNumber
 * @property {BoundingBox} boundingBox
 * @property {'NATIVE_STREAM' | 'AST_TABLE' | 'OCR_VISION' | 'MANUAL_EDIT'} extractionMethod
 * @property {number} confidence
 */

/**
 * @typedef {Object} ExtractedField
 * @property {string | number} value
 * @property {string} rawValue
 * @property {number} confidence
 * @property {Provenance} provenance
 */

/**
 * @typedef {Object} LineItem
 * @property {string} id
 * @property {string} description
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} amount
 * @property {number} confidence
 * @property {Provenance} provenance
 */

/**
 * @typedef {Object} InvoiceData
 * @property {ExtractedField} invoiceNumber
 * @property {ExtractedField} invoiceDate
 * @property {ExtractedField} [dueDate]
 * @property {ExtractedField} vendorName
 * @property {ExtractedField} [vendorTaxId]
 * @property {ExtractedField} [vendorAddress]
 * @property {ExtractedField} customerName
 * @property {ExtractedField} [customerAddress]
 * @property {LineItem[]} lineItems
 * @property {string} currency
 * @property {number} subtotal
 * @property {number} taxAmount
 * @property {number} taxRate
 * @property {number} discountAmount
 * @property {number} shippingAmount
 * @property {number} totalAmount
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field
 * @property {string} message
 * @property {'ERROR' | 'WARNING'} severity
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {boolean} arithmeticPassed
 * @property {ValidationError[]} errors
 */

/**
 * @typedef {Object} DocumentRecord
 * @property {string} id
 * @property {string} filename
 * @property {string} mimeType
 * @property {number} sizeBytes
 * @property {string} sha256
 * @property {number} pageCount
 * @property {string} uploadedAt
 * @property {'INGESTED' | 'EXTRACTING' | 'VALIDATING' | 'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED'} status
 * @property {'INVOICE' | 'RECEIPT' | 'PURCHASE_ORDER' | 'BILL_OF_LADING' | 'SPREADSHEET' | 'UNKNOWN'} documentType
 * @property {InvoiceData | null} extractedData
 * @property {ValidationResult | null} validationResult
 * @property {Array<{ timestamp: string, actor: string, action: string, note?: string }>} auditTrail
 * @property {string} [rawStoragePath]
 */
