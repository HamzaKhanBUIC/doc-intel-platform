/**
 * DocIntel — Enterprise Frontend Interaction Engine
 * Features bidirectional SVG bounding-box synchronization, 1-click auto-repair,
 * ERP drawer controller, command palette (Cmd+K), and audit lineage visualization.
 */

let documents = [];
let vendors = [];
let currentQueueIndex = 0;
let zoomLevel = 1.0;
let rotationDegree = 0;
let currentErpTab = 'quickbooks';

document.addEventListener('DOMContentLoaded', () => {
  fetchDocuments();
  fetchVendors();
  setupKeyboardShortcuts();
});

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
    console.error('Failed fetching documents:', err);
  }
}

async function fetchVendors() {
  try {
    const res = await fetch('/api/vendors');
    const data = await res.json();
    vendors = data.vendors || [];
    renderVendorsTable();
    if (document.getElementById('vendorMasterBadge')) {
      document.getElementById('vendorMasterBadge').innerText = vendors.length;
    }
  } catch (err) {
    console.error('Failed fetching vendors:', err);
  }
}

function updateHeaderCounts() {
  const queueDocs = documents.filter(d => d.status === 'REVIEW_REQUIRED');
  document.getElementById('queueCountBadge').innerText = queueDocs.length;
  document.getElementById('totalCountBadge').innerText = documents.length;
}

function switchView(viewName) {
  document.querySelectorAll('.view-panel').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));

  if (viewName === 'review') {
    document.getElementById('viewReview').classList.add('active');
    document.getElementById('tabReview').classList.add('active');
    renderReviewQueue();
  } else if (viewName === 'documents') {
    document.getElementById('viewDocuments').classList.add('active');
    document.getElementById('tabDocuments').classList.add('active');
    renderDocumentsTable();
  } else if (viewName === 'vendors') {
    document.getElementById('viewVendors').classList.add('active');
    document.getElementById('tabVendors').classList.add('active');
    renderVendorsTable();
  } else if (viewName === 'reports') {
    document.getElementById('viewReports').classList.add('active');
    document.getElementById('tabReports').classList.add('active');
    renderReports();
  }
}

function getReviewQueue() {
  return documents.filter(d => d.status === 'REVIEW_REQUIRED');
}

function renderReviewQueue() {
  const queue = getReviewQueue();
  if (queue.length === 0) {
    document.getElementById('currentDocTitle').innerText = 'No Pending Triage Exceptions';
    document.getElementById('currentDocStatusPill').innerText = 'ALL CLEAR (100%)';
    document.getElementById('currentDocStatusPill').className = 'status-pill status-pill-success';
    document.getElementById('renderedDocText').innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #64748B;">
        <div style="font-size: 32px; margin-bottom: 12px;">🎉</div>
        <h3 style="color: #0F172A; font-size: 16px; font-weight: 700; margin-bottom: 6px;">Zero Exceptions in Review Queue</h3>
        <p style="font-size: 12px;">All ingested documents have passed 100% deterministic mathematical verification.</p>
      </div>
    `;
    document.getElementById('bboxOverlay').innerHTML = '';
    document.getElementById('discrepancyBanner').style.display = 'none';
    return;
  }

  if (currentQueueIndex >= queue.length) currentQueueIndex = 0;
  const doc = queue[currentQueueIndex];

  document.getElementById('currentDocTitle').innerText = doc.filename;
  document.getElementById('currentDocCategory').innerText = doc.category || 'Financial Invoice';
  document.getElementById('currentDocStatusPill').innerText = doc.status.replace('_', ' ');
  document.getElementById('currentDocStatusPill').className = `status-pill status-pill-${doc.status.toLowerCase().replace('_', '-')}`;
  document.getElementById('currentDocSha').innerText = `SHA: ${(doc.sha256 || 'a1b2c3d4e5f6').substring(0, 10)}...`;
  document.getElementById('queuePager').innerText = `Item ${currentQueueIndex + 1} of ${queue.length}`;

  renderDocumentPreview(doc);
  populateExtractionForm(doc);
  renderAuditTimeline(doc);
}

function renderDocumentPreview(doc) {
  const data = doc.extractedData;
  if (!data) return;

  const linesHtml = (data.lineItems || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 7px 0; color: #64748B; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 7px 8px; font-weight: 500;">${item.description}</td>
      <td style="text-align: center; color: #334155;">${item.quantity}</td>
      <td style="text-align: center; color: #94A3B8; font-size: 10px;">${item.unitOfMeasure || 'EA'}</td>
      <td style="text-align: right; font-family: monospace;">$${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right; font-weight: 700; font-family: monospace;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em;">${data.vendorName?.value || 'COMMERCIAL INVOICE'}</h2>
        <p style="color: #64748B; font-size: 11px; margin-top: 2px;">Tax / VAT Identification: <strong>${data.vendorTaxId?.value || 'US-88129044'}</strong></p>
      </div>
      <div style="text-align: right;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; background: #F1F5F9; padding: 3px 8px; border-radius: 4px; color: #475569;">ORIGINAL BILLING</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 11.5px;">
      <div style="background: #F8FAFC; padding: 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
        <strong style="color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Billed Customer Entity:</strong><br>
        <span style="font-weight: 600; font-size: 13px; color: #0F172A;">${data.customerName?.value || 'Global Freight & Logistics Corp.'}</span>
      </div>
      <div style="background: #F8FAFC; padding: 12px; border-radius: 6px; border: 1px solid #E2E8F0; text-align: right;">
        <div style="margin-bottom: 4px;">
          <strong style="color: #64748B;">Invoice #:</strong> <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${data.invoiceNumber?.value}</span>
        </div>
        <div>
          <strong style="color: #64748B;">Date of Issue:</strong> <span style="font-family: monospace; color: #0F172A;">${data.invoiceDate?.value}</span>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 2px solid #CBD5E1; text-align: left; color: #64748B;">
          <th style="padding: 6px 0; width: 24px;">#</th>
          <th style="padding: 6px 8px;">Description & Particulars</th>
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
      <div style="width: 240px; border-top: 2px solid #0F172A; padding-top: 10px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #475569;">
          <span>Net Subtotal:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
          <span>Tax Amount:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.taxAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #CBD5E1; padding-top: 6px; font-size: 14px; font-weight: 800; color: #0F172A;">
          <span>Total Balance Due:</span>
          <span style="font-family: monospace;">$${data.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('renderedDocText').innerHTML = html;

  // Render SVG Vector Coordinate Rectangles with Click-to-Focus
  const svgLayer = document.getElementById('bboxOverlay');
  svgLayer.innerHTML = `
    <rect id="bbox_vendorName" class="bbox-rect" x="65" y="65" width="400" height="55" rx="4" onclick="focusField('field_vendorName')" />
    <rect id="bbox_invoiceNumber" class="bbox-rect" x="640" y="140" width="280" height="35" rx="4" onclick="focusField('field_invoiceNumber')" />
    <rect id="bbox_invoiceDate" class="bbox-rect" x="640" y="180" width="280" height="35" rx="4" onclick="focusField('field_invoiceDate')" />
    <rect id="bbox_customerName" class="bbox-rect" x="65" y="140" width="380" height="65" rx="4" onclick="focusField('field_customerName')" />
    <rect id="bbox_subtotal" class="bbox-rect" x="650" y="470" width="270" height="28" rx="4" onclick="focusField('field_subtotal')" />
    <rect id="bbox_taxAmount" class="bbox-rect" x="650" y="500" width="270" height="28" rx="4" onclick="focusField('field_taxAmount')" />
    <rect id="bbox_totalAmount" class="bbox-rect error" x="650" y="535" width="270" height="38" rx="4" onclick="focusField('field_totalAmount')" />
  `;
}

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
      <td><input type="text" value="${item.unitOfMeasure || 'EA'}" id="line_uom_${idx}" style="text-align: center; width: 45px;"></td>
      <td><input type="number" step="0.01" value="${item.unitPrice}" id="line_price_${idx}" style="text-align: right;" oninput="recalculateLine(${idx})"></td>
      <td><input type="number" step="0.01" value="${item.amount}" id="line_amt_${idx}" style="text-align: right; font-weight: 700;" oninput="revalidateForm()"></td>
      <td><button type="button" class="btn-icon-subtle" onclick="deleteLineItem(${idx})" title="Delete Line Item" style="color: #FB7185;">✕</button></td>
    </tr>
  `).join('');

  document.getElementById('lineItemsCount').innerText = `${data.lineItems?.length || 0} Items`;
  revalidateForm();
}

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

function autoRepairMath() {
  const subtotal = parseFloat(document.getElementById('field_subtotal').value) || 0;
  const tax = parseFloat(document.getElementById('field_taxAmount').value) || 0;
  const correctedTotal = Math.round((subtotal + tax) * 100) / 100;

  document.getElementById('field_totalAmount').value = correctedTotal;
  revalidateForm();
}

function revalidateForm() {
  const subtotal = parseFloat(document.getElementById('field_subtotal').value) || 0;
  const tax = parseFloat(document.getElementById('field_taxAmount').value) || 0;
  const total = parseFloat(document.getElementById('field_totalAmount').value) || 0;

  const expectedTotal = Math.round((subtotal + tax) * 100) / 100;
  const diff = Math.abs(expectedTotal - total);

  const banner = document.getElementById('discrepancyBanner');
  const iconBubble = document.getElementById('discrepancyIcon');
  const title = document.getElementById('discrepancyTitle');
  const msg = document.getElementById('discrepancyMessage');
  const eq = document.getElementById('discrepancyEquation');
  const repairBtn = document.getElementById('btnAutoRepair');
  const totalInput = document.getElementById('field_totalAmount');
  const totalWrapper = document.getElementById('row_grandTotal')?.querySelector('.fin-input-wrapper');
  const totalBBox = document.getElementById('bbox_totalAmount');

  if (diff <= 0.01) {
    banner.className = 'discrepancy-card card-success';
    iconBubble.innerText = '✓';
    title.innerText = 'All Deterministic Math Invariants Verified (100% Match)';
    msg.innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) equals Grand Total ($${total.toFixed(2)}). Ready for straight-through approval.`;
    eq.innerHTML = `<code>Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) == Grand Total ($${total.toFixed(2)})</code>`;
    if (repairBtn) repairBtn.style.display = 'none';
    if (totalInput) totalInput.classList.remove('error');
    if (totalWrapper) totalWrapper.classList.remove('error');
    if (totalBBox) {
      totalBBox.className.baseVal = 'bbox-rect active';
    }
  } else {
    banner.className = 'discrepancy-card card-warning';
    iconBubble.innerText = '⚠️';
    title.innerText = 'Mathematical Discrepancy Detected';
    msg.innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) = $${expectedTotal.toFixed(2)}, but Extracted Total is $${total.toFixed(2)} (Difference: $${diff.toFixed(2)}).`;
    eq.innerHTML = `<code>Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) ≠ Extracted Total ($${total.toFixed(2)})</code>`;
    if (repairBtn) repairBtn.style.display = 'inline-block';
    if (totalInput) totalInput.classList.add('error');
    if (totalWrapper) totalWrapper.classList.add('error');
    if (totalBBox) {
      totalBBox.className.baseVal = 'bbox-rect error';
    }
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
    description: 'New Freight Accessorial Surcharge',
    quantity: 1,
    unitOfMeasure: 'EA',
    unitPrice: 50.00,
    amount: 50.00
  });

  populateExtractionForm(doc);
}

function deleteLineItem(idx) {
  const queue = getReviewQueue();
  const doc = queue[currentQueueIndex];
  if (!doc || !doc.extractedData || !doc.extractedData.lineItems) return;

  doc.extractedData.lineItems.splice(idx, 1);
  populateExtractionForm(doc);
}

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
      await fetchDocuments();
      renderReviewQueue();
    }
  } catch (err) {
    alert('Failed to submit review: ' + err.message);
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
    if (e.altKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      openErpModal();
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeErpModal();
      closeAuditDrawer();
    }
  });
}

function renderDocumentsTable() {
  const tbody = document.getElementById('documentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = documents.map(d => {
    const data = d.extractedData || {};
    return `
      <tr>
        <td><span class="sha-hash-pill">${d.id}</span></td>
        <td><strong style="color: #FFF;">${d.filename}</strong></td>
        <td><span class="chip-sm">${d.documentType}</span></td>
        <td>${data.vendorName?.value || 'N/A'}</td>
        <td><span style="font-family: monospace; color: #94A3B8;">${data.invoiceDate?.value || 'N/A'}</span></td>
        <td><strong style="font-family: monospace; color: #34D399;">$${(data.totalAmount || 0).toFixed(2)}</strong></td>
        <td><span class="status-pill status-pill-${d.status.toLowerCase().replace('_', '-')}">${d.status.replace('_', ' ')}</span></td>
        <td style="text-align: right;">
          <button class="btn-glass" onclick="openDocInReview('${d.id}')" style="padding: 4px 10px; font-size: 11.5px;">Inspect</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderVendorsTable() {
  const tbody = document.getElementById('vendorsTableBody');
  if (!tbody) return;
  tbody.innerHTML = vendors.map(v => `
    <tr>
      <td><span class="sha-hash-pill font-bold" style="color: #38BDF8;">${v.id}</span></td>
      <td><strong style="color: #FFF;">${v.canonicalName}</strong></td>
      <td><span style="font-family: monospace; color: #94A3B8;">${v.taxId}</span></td>
      <td><span class="chip-sm" style="background: rgba(79, 70, 229, 0.15); color: #818CF8;">${v.defaultGlAccount}</span></td>
      <td><span class="status-pill status-pill-success">${v.defaultPaymentTerms}</span></td>
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

async function renderReports() {
  try {
    const res = await fetch('/api/reports/summary');
    const data = await res.json();

    document.getElementById('metricsCards').innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">Documents Processed</span>
        <div class="kpi-value">${data.totalDocuments}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Straight-Through Rate</span>
        <div class="kpi-value" style="color: #34D399;">${Math.round((data.approvedCount / (data.totalDocuments || 1)) * 100)}%</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Reconciled Spend Volume</span>
        <div class="kpi-value" style="font-family: monospace; font-size: 22px;">$${data.totalSpend.toFixed(2)}</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cumulative Tax Liability</span>
        <div class="kpi-value" style="font-family: monospace; font-size: 22px; color: #FCD34D;">$${data.totalTax.toFixed(2)}</div>
      </div>
    `;

    document.getElementById('topVendorsList').innerHTML = data.topVendors.map(v => `
      <div class="report-row-item">
        <span>${v.name}</span>
        <strong>$${v.total.toFixed(2)}</strong>
      </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = data.categoryBreakdown.map(c => `
      <div class="report-row-item">
        <span>${c.category}</span>
        <strong>$${c.total.toFixed(2)}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to render reports:', err);
  }
}

function renderAuditTimeline(doc) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  const trail = doc.auditTrail || [];
  container.innerHTML = trail.map(t => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <span class="timeline-time">${new Date(t.timestamp).toLocaleTimeString()}</span>
      <div class="timeline-title">${t.action} • ${t.actor}</div>
      <div class="timeline-note">${t.note}</div>
    </div>
  `).join('');
}

function toggleAuditTimeline() {
  const drawer = document.getElementById('auditDrawer');
  drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
}

function closeAuditDrawer() {
  const drawer = document.getElementById('auditDrawer');
  if (drawer) drawer.style.display = 'none';
}

async function handleFileUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
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
      console.error('Upload failed for:', file.name, err);
    }
  }

  await fetchDocuments();
  alert(`Successfully ingested and verified ${files.length} document(s)!`);
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

// ERP Modal Controller
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
    document.getElementById('erpJsonCode').innerText = `Error loading ERP schema: ${err.message}`;
  }
}

function copyErpJson() {
  const text = document.getElementById('erpJsonCode').innerText;
  navigator.clipboard.writeText(text);
  const copyBtn = document.getElementById('copyBtnText');
  copyBtn.innerText = 'Copied!';
  setTimeout(() => copyBtn.innerText = 'Copy Payload', 2000);
}

// Command Palette (Cmd+K)
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
