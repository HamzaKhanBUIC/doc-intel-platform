import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export class IngestionService {
  /**
   * @param {string} storageDir
   */
  constructor(storageDir = './data/storage') {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Validate and ingest file buffer
   * @param {Buffer} buffer
   * @param {string} originalFilename
   * @param {string} mimeType
   * @returns {Promise<{ id: string, filename: string, mimeType: string, sizeBytes: number, sha256: string, pageCount: number, storagePath: string, documentType: string }>}
   */
  async ingestDocument(buffer, originalFilename, mimeType) {
    if (!buffer || buffer.length === 0) {
      throw new Error('INGESTION_ERROR: Empty file buffer received.');
    }

    // Size limit check (25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw new Error(`INGESTION_ERROR: File size ${buffer.length} exceeds 25MB limit.`);
    }

    // Magic byte signature validation
    const detectedMime = this.detectMimeType(buffer, originalFilename);
    const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validMimes.includes(detectedMime)) {
      throw new Error(`INGESTION_ERROR: Unsupported or spoofed MIME type '${detectedMime}'.`);
    }

    // Calculate SHA-256 hash for immutable content addressing
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const docId = `doc_${sha256.substring(0, 12)}`;

    // Store raw file immutably
    const ext = path.extname(originalFilename) || this.getExtensionFromMime(detectedMime);
    const storageFilename = `${docId}_${sha256.substring(0, 8)}${ext}`;
    const storagePath = path.join(this.storageDir, storageFilename);

    if (!fs.existsSync(storagePath)) {
      fs.writeFileSync(storagePath, buffer);
    }

    // Estimate page count
    const pageCount = this.estimatePageCount(buffer, detectedMime);
    const documentType = this.classifyDocumentHeuristic(originalFilename, buffer);

    return {
      id: docId,
      filename: originalFilename,
      mimeType: detectedMime,
      sizeBytes: buffer.length,
      sha256,
      pageCount,
      storagePath,
      documentType
    };
  }

  detectMimeType(buffer, filename) {
    if (buffer.subarray(0, 4).toString() === '%PDF') return 'application/pdf';
    if (buffer[0] === 0x89 && buffer.subarray(1, 4).toString() === 'PNG') return 'image/png';
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
    if (filename.endsWith('.csv')) return 'text/csv';
    if (filename.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return 'application/octet-stream';
  }

  getExtensionFromMime(mime) {
    switch (mime) {
      case 'application/pdf': return '.pdf';
      case 'image/png': return '.png';
      case 'image/jpeg': return '.jpg';
      case 'text/csv': return '.csv';
      default: return '.bin';
    }
  }

  estimatePageCount(buffer, mime) {
    if (mime === 'application/pdf') {
      const content = buffer.toString('binary');
      const matches = content.match(/\/Type\s*\/Page[^s]/g);
      return matches ? Math.max(1, matches.length) : 1;
    }
    return 1;
  }

  classifyDocumentHeuristic(filename, buffer) {
    const fnLower = filename.toLowerCase();
    if (fnLower.includes('receipt') || fnLower.includes('pos') || fnLower.includes('slip')) return 'RECEIPT';
    if (fnLower.includes('po') || fnLower.includes('purchase_order') || fnLower.includes('order')) return 'PURCHASE_ORDER';
    if (fnLower.includes('bol') || fnLower.includes('lading') || fnLower.includes('freight')) return 'BILL_OF_LADING';
    if (fnLower.endsWith('.csv') || fnLower.endsWith('.xlsx')) return 'SPREADSHEET';
    return 'INVOICE';
  }
}
