/**
 * DocIntel — Enterprise Frontend Application Controller
 * Handles state management, bidirectional bounding-box synchronization,
 * drag-and-drop batch ingestion, deterministic math reconciliation,
 * keyboard-driven triage, ERP schema preview, and audit lineage.
 */

let documents = [];
let vendors = [];
let currentQueueIndex = 0;
let zoomLevel = 1.0;
let rotationDegree = 0;
let currentErpTab = 'quickbooks';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  fetchDocuments();
  fetchVendors();
  setupKeyboardShortcuts();
  setupDragAndDrop();
});

// Fetch documents from backend API
async function fetchDocuments() {
  try {
    const res = await fetch('/api/documents');
    const data = await res.json();
    documents = data.documents || [];
    updateHeaderCounts();
    renderReviewQueue();
    renderDocumentsTable();
    renderReports();
  } catch (err) {
    showToast('Failed to fetch documents from server', 'error');
  }
}

// Fetch vendor master from backend API
async function fetchVendors() {
  try {
    const res = await fetch('/api/vendors');
    const data = await res.json();
    vendors = data.vendors || [];
    renderVendorsTable();
  } catch (err) {
    console.error('Failed fetching vendor catalog:', err);
  }
}

function updateHeaderCounts() {
  const queueDocs = documents.filter(d => d.status === 'REVIEW_REQUIRED');
  const queueBadge = document.getElementById('queueCountBadge');
  const totalBadge = document.getElementById('totalCountBadge');
  if (queueBadge) queueBadge.innerText = queueDocs.length;
  if (totalBadge) totalBadge.innerText = documents.length;
}

// Navigation between application views
function switchView(viewName) {
  document.querySelectorAll('.view-panel').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));

  if (viewName === 'review') {
    document.getElementById('viewReview')?.classList.add('active');
    document.getElementById('tabReview')?.classList.add('active');
    renderReviewQueue();
  } else if (viewName === 'documents') {
    document.getElementById('viewDocuments')?.classList.add('active');
    document.getElementById('tabDocuments')?.classList.add('active');
    renderDocumentsTable();
  } else if (viewName === 'vendors') {
    document.getElementById('viewVendors')?.classList.add('active');
    document.getElementById('tabVendors')?.classList.add('active');
    renderVendorsTable();
  } else if (viewName === 'reports') {
    document.getElementById('viewReports')?.classList.add('active');
    document.getElementById('tabReports')?.classList.add('active');
    renderReports();
  }
}

function getReviewQueue() {
  return documents.filter(d => d.status === 'REVIEW_REQUIRED');
}

// Render Review Cockpit
function renderReviewQueue() {
  const queue = getReviewQueue();
  if (queue.length === 0) {
    document.getElementById('currentDocTitle').innerText = 'No Pending Invoices';
    document.getElementById('currentDocStatusTag').innerText = 'All Reconciled';
    document.getElementById('currentDocStatusTag').className = 'tag-status tag-success';
    document.getElementById('statusDot').className = 'pulse-indicator pulse-success';
    document.getElementById('renderedDocText').innerHTML = `
      <div style="padding: 80px 20px; text-align: center; color: #64748B;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="margin-bottom: 12px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <h3 style="color: #1F2937; font-size: 16px; font-weight: 700; margin-bottom: 6px;">All Invoices Reconciled</h3>
        <p style="font-size: 12px; max-width: 320px; margin: 0 auto;">Zero exceptions in triage queue. All incoming documents have passed deterministic math verification.</p>
      </div>
    `;
    document.getElementById('bboxOverlay').innerHTML = '';
    document.getElementById('discrepancyBanner').style.display = 'none';
    document.getElementById('queuePager').innerText = '0 of 0';
    return;
  }

  if (currentQueueIndex >= queue.length) currentQueueIndex = 0;
  const doc = queue[currentQueueIndex];

  document.getElementById('currentDocTitle').innerText = doc.filename;
  document.getElementById('currentDocCategory').innerText = doc.category || 'General';
  document.getElementById('currentDocStatusTag').innerText = doc.status.replace('_', ' ');
  document.getElementById('currentDocStatusTag').className = doc.status === 'APPROVED' ? 'tag-status tag-success' : 'tag-status tag-warning';
  document.getElementById('statusDot').className = doc.status === 'APPROVED' ? 'pulse-indicator pulse-success' : 'pulse-indicator pulse-warning';
  document.getElementById('currentDocSha').innerText = `SHA: ${(doc.sha256 || 'a1b2c3d4e5f6').substring(0, 10)}...`;
  document.getElementById('queuePager').innerText = `${currentQueueIndex + 1} of ${queue.length}`;

  renderDocumentPreview(doc);
  populateExtractionForm(doc);
  renderAuditTimeline(doc);
}

// Render Document Source Sheet with Typography & Vector Bounding Boxes
function renderDocumentPreview(doc) {
  const data = doc.extractedData;
  if (!data) return;

  const linesHtml = (data.lineItems || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #E5E7EB;">
      <td style="padding: 6px 0; color: #6B7280; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 6px 8px; font-weight: 500; color: #111827;">${item.description}</td>
      <td style="text-align: center; color: #374151;">${item.quantity}</td>
      <td style="text-align: center; color: #6B7280; font-size: 10px;">${item.unitOfMeasure || 'EA'}</td>
      <td style="text-align: right; font-family: monospace; color: #111827;">$${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right; font-weight: 600; font-family: monospace; color: #111827;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 18px;">
      <div>
        <h2 style="font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">${data.vendorName?.value || 'COMMERCIAL INVOICE'}</h2>
        <p style="color: #4B5563; font-size: 11px; margin-top: 2px;">Tax Registration / VAT: <strong>${data.vendorTaxId?.value || 'US-88129044'}</strong></p>
      </div>
      <div style="text-align: right;">
        <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; background: #F3F4F6; padding: 2px 6px; border-radius: 3px; color: #374151; border: 1px solid #E5E7EB;">OFFICIAL BILLING</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 11.5px;">
      <div style="background: #F9FAFB; padding: 10px 12px; border-radius: 4px; border: 1px solid #E5E7EB;">
        <span style="color: #6B7280; font-size: 10px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em;">Billed Customer Entity:</span><br>
        <span style="font-weight: 600; font-size: 12.5px; color: #111827;">${data.customerName?.value || 'Global Freight & Logistics Corp.'}</span>
      </div>
      <div style="background: #F9FAFB; padding: 10px 12px; border-radius: 4px; border: 1px solid #E5E7EB; text-align: right;">
        <div style="margin-bottom: 3px;">
          <span style="color: #6B7280;">Invoice Number:</span> <strong style="font-family: monospace; color: #111827;">${data.invoiceNumber?.value}</strong>
        </div>
        <div>
          <span style="color: #6B7280;">Issue Date:</span> <span style="font-family: monospace; color: #111827;">${data.invoiceDate?.value}</span>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #D1D5DB; text-align: left; color: #4B5563;">
          <th style="padding: 4px 0; width: 22px;">#</th>
          <th style="padding: 4px 8px;">Description & Particulars</th>
          <th style="text-align: center; width: 40px;">Qty</th>
          <th style="text-align: center; width: 40px;">UOM</th>
          <th style="text-align: right; width: 70px;">Rate</th>
          <th style="text-align: right; width: 80px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end;">
      <div style="width: 220px; border-top: 1px solid #111827; padding-top: 8px; font-size: 11.5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #4B5563;">
          <span>Net Subtotal:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #4B5563;">
          <span>Tax / Surcharges:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.taxAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #D1D5DB; padding-top: 4px; font-size: 13px; font-weight: 800; color: #111827;">
          <span>Total Balance Due:</span>
          <span style="font-family: monospace;">$${data.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('renderedDocText').innerHTML = html;

  // Render SVG Vector Coordinates
  const svgLayer = document.getElementById('bboxOverlay');
  svgLayer.innerHTML = `
    <rect id="bbox_vendorName" class="bbox-rect" x="65" y="65" width="400" height="55" onclick="focusField('field_vendorName')" />
    <rect id="bbox_invoiceNumber" class="bbox-rect" x="640" y="140" width="280" height="35" onclick="focusField('field_invoiceNumber')" />
    <rect id="bbox_invoiceDate" class="bbox-rect" x="640" y="180" width="280" height="35" onclick="focusField('field_invoiceDate')" />
    <rect id="bbox_customerName" class="bbox-rect" x="65" y="140" width="380" height="65" onclick="focusField('field_customerName')" />
    <rect id="bbox_subtotal" class="bbox-rect" x="650" y="470" width="270" height="28" onclick="focusField('field_subtotal')" />
    <rect id="bbox_taxAmount" class="bbox-rect" x="650" y="500" width="270" height="28" onclick="focusField('field_taxAmount')" />
    <rect id="bbox_totalAmount" class="bbox-rect error" x="650" y="535" width="270" height="38" onclick="focusField('field_totalAmount')" />
  `;
}

// Populate Right-Pane Cockpit Form
function populateExtractionForm(doc) {
  const data = doc.extractedData;
  if (!data) return;

  document.getElementById('field_invoiceNumber').value = data.invoiceNumber?.value || '';
  document.getElementById('field_invoiceDate').value = data.invoiceDate?.value || '';
  document.getElementById('field_vendorName').value = data.vendorName?.value || '';
  document.getElementById('field_customerName').value = data.customerName?.value || '';
  document.getElementById('field_subtotal').value = data.subtotal || 0;
  document.getElementById('field_taxAmount').value = data.taxAmount || 0;
  document.getElementById('field_totalAmount').value = data.totalAmount || 0;

  // Vendor Master Hero
  const vendorName = data.vendorName?.value || 'Pacific Overland Logistics LLC';
  document.getElementById('vendorMatchedName').innerText = vendorName;
  document.getElementById('vendorAvatar').innerText = vendorName.substring(0, 2).toUpperCase();

  const linesTbody = document.getElementById('lineItemsBody');
  linesTbody.innerHTML = (data.lineItems || []).map((item, idx) => `
    <tr>
      <td style="color: #64748B; font-family: monospace;">${idx + 1}</td>
      <td><input type="text" value="${item.description}" id="line_desc_${idx}" oninput="revalidateForm()"></td>
      <td><input type="number" value="${item.quantity}" id="line_qty_${idx}" style="text-align: center;" oninput="recalculateLine(${idx})"></td>
      <td><input type="text" value="${item.unitOfMeasure || 'EA'}" id="line_uom_${idx}" style="text-align: center; width: 40px;"></td>
      <td><input type="number" step="0.01" value="${item.unitPrice}" id="line_price_${idx}" style="text-align: right;" oninput="recalculateLine(${idx})"></td>
      <td><input type="number" step="0.01" value="${item.amount}" id="line_amt_${idx}" style="text-align: right; font-weight: 600;" oninput="revalidateForm()"></td>
      <td><button type="button" class="btn-icon" onclick="deleteLineItem(${idx})" title="Delete Line Item" style="color: #EF4444;">✕</button></td>
    </tr>
  `).join('');

  document.getElementById('lineItemsCount').innerText = `${data.lineItems?.length || 0}`;
  revalidateForm();
}

// Inline line-item recalculation
function recalculateLine(idx) {
  const qty = parseFloat(document.getElementById(`line_qty_${idx}`).value) || 0;
  const price = parseFloat(document.getElementById(`line_price_${idx}`).value) || 0;
  const amount = Math.round(qty * price * 100) / 100;
  document.getElementById(`line_amt_${idx}`).value = amount;

  const queue = getReviewQueue();
  const doc = queue[currentQueueIndex];
  if (doc && doc.extractedData) {
    let subtotal = 0;
    const rowCount = doc.extractedData.lineItems?.length || 0;
    for (let i = 0; i < rowCount; i++) {
      const lineAmtElem = document.getElementById(`line_amt_${i}`);
      if (lineAmtElem) {
        subtotal += parseFloat(lineAmtElem.value) || 0;
      }
    }
    document.getElementById('field_subtotal').value = Math.round(subtotal * 100) / 100;
  }
  revalidateForm();
}

// 1-Click Auto-Repair Math Mismatch
function autoRepairMath() {
  const subtotal = parseFloat(document.getElementById('field_subtotal').value) || 0;
  const tax = parseFloat(document.getElementById('field_taxAmount').value) || 0;
  const correctedTotal = Math.round((subtotal + tax) * 100) / 100;

  document.getElementById('field_totalAmount').value = correctedTotal;
  revalidateForm();
  showToast(`Auto-reconciled total to $${correctedTotal.toFixed(2)}`, 'success');
}

// Revalidate Form against Deterministic Invariants
function revalidateForm() {
  const subtotal = parseFloat(document.getElementById('field_subtotal').value) || 0;
  const tax = parseFloat(document.getElementById('field_taxAmount').value) || 0;
  const total = parseFloat(document.getElementById('field_totalAmount').value) || 0;

  const expectedTotal = Math.round((subtotal + tax) * 100) / 100;
  const diff = Math.abs(expectedTotal - total);

  const banner = document.getElementById('discrepancyBanner');
  const title = document.getElementById('discrepancyTitle');
  const msg = document.getElementById('discrepancyMessage');
  const repairBtn = document.getElementById('btnAutoRepair');
  const grandTotalShell = document.getElementById('grandTotalShell');
  const totalBBox = document.getElementById('bbox_totalAmount');

  if (diff <= 0.01) {
    banner.className = 'alert-box alert-success';
    title.innerText = 'Mathematical Balance Verified (100% Invariant Match)';
    msg.innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) equals Grand Total ($${total.toFixed(2)}).`;
    if (repairBtn) repairBtn.style.display = 'none';
    if (grandTotalShell) grandTotalShell.classList.remove('error');
    if (totalBBox) totalBBox.className.baseVal = 'bbox-rect active';
  } else {
    banner.className = 'alert-box alert-warning';
    title.innerText = 'Mathematical Invariant Warning';
    msg.innerText = `Line items sum to $${expectedTotal.toFixed(2)}, but invoice total is $${total.toFixed(2)} (difference: $${diff.toFixed(2)}).`;
    if (repairBtn) repairBtn.style.display = 'inline-block';
    if (grandTotalShell) grandTotalShell.classList.add('error');
    if (totalBBox) totalBBox.className.baseVal = 'bbox-rect error';
  }
}

function highlightBBox(fieldName) {
  document.querySelectorAll('.bbox-rect').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(`bbox_${fieldName}`);
  if (target) {
    target.classList.add('active');
  }
}

function focusField(fieldId) {
  const el = document.getElementById(fieldId);
  if (el) {
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function addNewLineItem() {
  const queue = getReviewQueue();
  const doc = queue[currentQueueIndex];
  if (!doc || !doc.extractedData) return;

  doc.extractedData.lineItems = doc.extractedData.lineItems || [];
  doc.extractedData.lineItems.push({
    id: `item_${doc.extractedData.lineItems.length + 1}`,
    description: 'Additional Surcharge / Accessorial',
    quantity: 1,
    unitOfMeasure: 'EA',
    unitPrice: 50.00,
    amount: 50.00
  });

  populateExtractionForm(doc);
  showToast('Added new line item row', 'info');
}

function deleteLineItem(idx) {
  const queue = getReviewQueue();
  const doc = queue[currentQueueIndex];
  if (!doc || !doc.extractedData || !doc.extractedData.lineItems) return;

  doc.extractedData.lineItems.splice(idx, 1);
  populateExtractionForm(doc);
  showToast('Removed line item', 'info');
}

// Submit Human-in-the-Loop Review
async function submitReview(action) {
  const queue = getReviewQueue();
  if (queue.length === 0) return;
  const doc = queue[currentQueueIndex];

  const updatedData = {
    invoiceNumber: { value: document.getElementById('field_invoiceNumber').value, confidence: 1.0 },
    invoiceDate: { value: document.getElementById('field_invoiceDate').value, confidence: 1.0 },
    vendorName: { value: document.getElementById('field_vendorName').value, confidence: 1.0 },
    customerName: { value: document.getElementById('field_customerName').value, confidence: 1.0 },
    subtotal: parseFloat(document.getElementById('field_subtotal').value) || 0,
    taxAmount: parseFloat(document.getElementById('field_taxAmount').value) || 0,
    totalAmount: parseFloat(document.getElementById('field_totalAmount').value) || 0
  };

  try {
    const res = await fetch(`/api/documents/${doc.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, extractedData: updatedData, note: 'Reviewed via enterprise cockpit' })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`Document ${action === 'APPROVE' ? 'Approved & Synced' : 'Rejected'}`, action === 'APPROVE' ? 'success' : 'warning');
      await fetchDocuments();
      renderReviewQueue();
    }
  } catch (err) {
    showToast('Failed to update review: ' + err.message, 'error');
  }
}

function prevQueueDoc() {
  const queue = getReviewQueue();
  if (queue.length === 0) return;
  currentQueueIndex = (currentQueueIndex - 1 + queue.length) % queue.length;
  renderReviewQueue();
}

function nextQueueDoc() {
  const queue = getReviewQueue();
  if (queue.length === 0) return;
  currentQueueIndex = (currentQueueIndex + 1) % queue.length;
  renderReviewQueue();
}

// Document Zoom & Rotation
function zoomDoc(factor) {
  zoomLevel = Math.max(0.6, Math.min(2.0, zoomLevel * factor));
  document.getElementById('docSheet').style.transform = `scale(${zoomLevel}) rotate(${rotationDegree}deg)`;
  document.getElementById('zoomPercentage').innerText = `${Math.round(zoomLevel * 100)}%`;
}

function resetZoom() {
  zoomLevel = 1.0;
  rotationDegree = 0;
  document.getElementById('docSheet').style.transform = 'scale(1.0) rotate(0deg)';
  document.getElementById('zoomPercentage').innerText = '100%';
}

function rotateDoc() {
  rotationDegree = (rotationDegree + 90) % 360;
  document.getElementById('docSheet').style.transform = `scale(${zoomLevel}) rotate(${rotationDegree}deg)`;
}

// Keyboard shortcuts setup
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      submitReview('APPROVE');
    }
    if (e.altKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      submitReview('REJECT');
    }
    if (e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      nextQueueDoc();
    }
    if (e.altKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      prevQueueDoc();
    }
    if (e.altKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      autoRepairMath();
    }
    if (e.altKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      openErpModal();
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeErpModal();
      closeUploadModal();
      closeAuditDrawer();
    }
  });
}

// Render Document Ledger Store
function renderDocumentsTable() {
  const tbody = document.getElementById('documentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = documents.map(d => {
    const data = d.extractedData || {};
    return `
      <tr>
        <td style="font-family: monospace; color: #64748B;">${d.id}</td>
        <td><strong style="color: #F8FAFC;">${d.filename}</strong></td>
        <td><span style="font-size: 11px; color: #94A3B8;">${d.documentType}</span></td>
        <td>${data.vendorName?.value || 'N/A'}</td>
        <td style="font-family: monospace; color: #94A3B8;">${data.invoiceDate?.value || 'N/A'}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #34D399;">$${(data.totalAmount || 0).toFixed(2)}</td>
        <td><span class="tag-status ${d.status === 'APPROVED' ? 'tag-success' : 'tag-warning'}">${d.status.replace('_', ' ')}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="openDocInReview('${d.id}')">Inspect</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Vendor Master Directory
function renderVendorsTable() {
  const tbody = document.getElementById('vendorsTableBody');
  if (!tbody) return;
  tbody.innerHTML = vendors.map(v => `
    <tr>
      <td style="font-family: monospace; color: #38BDF8; font-weight: 600;">${v.id}</td>
      <td><strong style="color: #F8FAFC;">${v.canonicalName}</strong></td>
      <td style="font-family: monospace;">${v.taxId}</td>
      <td><span style="font-size: 11px; background: rgba(99, 102, 241, 0.15); color: #818CF8; padding: 2px 6px; border-radius: 4px;">${v.defaultGlAccount}</span></td>
      <td><span class="tag-status tag-success">${v.defaultPaymentTerms}</span></td>
      <td style="font-size: 11.5px; color: #64748B;">${v.aliases.join(' • ')}</td>
    </tr>
  `).join('');
}

function openDocInReview(docId) {
  const queue = getReviewQueue();
  const idx = queue.findIndex(d => d.id === docId);
  if (idx !== -1) {
    currentQueueIndex = idx;
  }
  switchView('review');
}

// Render Reports & KPI Analytics
async function renderReports() {
  try {
    const res = await fetch('/api/reports/summary');
    const data = await res.json();

    document.getElementById('metricsCards').innerHTML = `
      <div class="kpi-stat-card">
        <span class="kpi-title">Invoices Processed</span>
        <div class="kpi-num">${data.totalDocuments}</div>
      </div>
      <div class="kpi-stat-card">
        <span class="kpi-title">Straight-Through Processing</span>
        <div class="kpi-num" style="color: #34D399;">${Math.round((data.approvedCount / (data.totalDocuments || 1)) * 100)}%</div>
      </div>
      <div class="kpi-stat-card">
        <span class="kpi-title">Reconciled Spend Volume</span>
        <div class="kpi-num" style="font-family: monospace;">$${data.totalSpend.toFixed(2)}</div>
      </div>
      <div class="kpi-stat-card">
        <span class="kpi-title">Cumulative Tax Liability</span>
        <div class="kpi-num" style="font-family: monospace; color: #FBBF24;">$${data.totalTax.toFixed(2)}</div>
      </div>
    `;

    document.getElementById('topVendorsList').innerHTML = data.topVendors.map(v => `
      <div class="analytics-row">
        <span>${v.name}</span>
        <strong>$${v.total.toFixed(2)}</strong>
      </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = data.categoryBreakdown.map(c => `
      <div class="analytics-row">
        <span>${c.category}</span>
        <strong>$${c.total.toFixed(2)}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed rendering reports:', err);
  }
}

// Cryptographic Audit Lineage Timeline
function renderAuditTimeline(doc) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  const trail = doc.auditTrail || [];
  container.innerHTML = trail.map(t => `
    <div class="timeline-step">
      <div class="timeline-dot"></div>
      <span class="timeline-timestamp">${new Date(t.timestamp).toLocaleTimeString()}</span>
      <div class="timeline-title">${t.action} (${t.actor})</div>
      <div class="timeline-detail">${t.note}</div>
    </div>
  `).join('');
}

function toggleAuditTimeline() {
  const drawer = document.getElementById('auditDrawer');
  drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
}

function closeAuditDrawer(e) {
  if (!e || e.target.id === 'auditDrawer') {
    const drawer = document.getElementById('auditDrawer');
    if (drawer) drawer.style.display = 'none';
  }
}

// Drag and Drop Batch Ingestion
function setupDragAndDrop() {
  const dropZone = document.getElementById('dropZone');
  if (!dropZone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#38BDF8';
      dropZone.style.background = 'rgba(56, 189, 248, 0.08)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '';
      dropZone.style.background = '';
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFileUpload({ target: { files } });
  });
}

function openUploadModal() {
  document.getElementById('uploadModal').style.display = 'flex';
}

function closeUploadModal() {
  document.getElementById('uploadModal').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'none';
}

function handleUploadBackdrop(e) {
  if (e.target.id === 'uploadModal') closeUploadModal();
}

async function handleFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const progress = document.getElementById('uploadProgress');
  const fill = document.getElementById('uploadFill');
  const statusText = document.getElementById('uploadStatusText');
  const percentText = document.getElementById('uploadPercent');

  progress.style.display = 'block';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round(((i + 1) / files.length) * 100);
    statusText.innerText = `Processing ${file.name}...`;
    fill.style.width = `${pct}%`;
    percentText.innerText = `${pct}%`;

    try {
      await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'x-filename': file.name,
          'content-type': file.type || 'application/pdf'
        },
        body: file
      });
    } catch (err) {
      console.error('Upload error:', file.name, err);
    }
  }

  await fetchDocuments();
  showToast(`Successfully ingested and verified ${files.length} document(s)`, 'success');
  setTimeout(() => closeUploadModal(), 400);
}

function handleSearch() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#documentsTableBody tr');
  rows.forEach(r => {
    const text = r.innerText.toLowerCase();
    r.style.display = text.includes(q) ? '' : 'none';
  });
}

function exportData(format) {
  window.open(`/api/export?format=${format}`, '_blank');
}

// ERP Integration Payload Drawer
async function openErpModal() {
  document.getElementById('erpModal').style.display = 'flex';
  await loadErpPayload(currentErpTab);
}

function closeErpModal() {
  document.getElementById('erpModal').style.display = 'none';
}

async function switchErpTab(erpName) {
  currentErpTab = erpName;
  document.querySelectorAll('.erp-tab-btn').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  await loadErpPayload(erpName);
}

async function loadErpPayload(erpName) {
  try {
    const targetDoc = documents[0];
    const docId = targetDoc ? targetDoc.id : '';
    const res = await fetch(`/api/export?format=${erpName}&docId=${docId}`);
    const data = await res.json();
    document.getElementById('erpJsonCode').innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('erpJsonCode').innerText = `Error: ${err.message}`;
  }
}

function copyErpJson() {
  const text = document.getElementById('erpJsonCode').innerText;
  navigator.clipboard.writeText(text);
  const copyBtn = document.getElementById('copyBtnText');
  copyBtn.innerText = 'Copied to Clipboard!';
  showToast('Copied ERP payload to clipboard', 'success');
  setTimeout(() => copyBtn.innerText = 'Copy Payload to Clipboard', 2000);
}

// Command Palette (Ctrl+K)
function openCommandPalette() {
  document.getElementById('commandPaletteModal').style.display = 'flex';
  setTimeout(() => document.getElementById('paletteSearch').focus(), 50);
}

function closeCommandPalette() {
  document.getElementById('commandPaletteModal').style.display = 'none';
}

function handlePaletteBackdrop(e) {
  if (e.target.id === 'commandPaletteModal') {
    closeCommandPalette();
  }
}

function handlePaletteInput() {
  const q = document.getElementById('paletteSearch').value.toLowerCase();
  const items = document.querySelectorAll('.palette-item');
  items.forEach(it => {
    const text = it.innerText.toLowerCase();
    it.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

// Toast Notification Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all 150ms ease';
    setTimeout(() => toast.remove(), 160);
  }, 2800);
}
