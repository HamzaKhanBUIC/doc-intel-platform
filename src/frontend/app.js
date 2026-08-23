/**
 * DocIntel — Accounts Payable Review & Verification Controller
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
  } catch (err) {
    console.error('Failed fetching vendors:', err);
  }
}

function updateHeaderCounts() {
  const queueDocs = documents.filter(d => d.status === 'REVIEW_REQUIRED');
  const queueBadge = document.getElementById('queueCountBadge');
  const totalBadge = document.getElementById('totalCountBadge');
  if (queueBadge) queueBadge.innerText = queueDocs.length;
  if (totalBadge) totalBadge.innerText = documents.length;
}

function switchView(viewName) {
  document.querySelectorAll('.view-panel').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));

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

function renderReviewQueue() {
  const queue = getReviewQueue();
  if (queue.length === 0) {
    document.getElementById('currentDocTitle').innerText = 'No Pending Invoices';
    document.getElementById('currentDocStatusTag').innerText = 'All Verified';
    document.getElementById('currentDocStatusTag').className = 'status-tag tag-success';
    document.getElementById('renderedDocText').innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: #64748B;">
        <h3 style="color: #1F2328; font-size: 15px; font-weight: 600; margin-bottom: 6px;">All Invoices Reconciled</h3>
        <p style="font-size: 12px;">Zero items in review queue. All mathematical checks passed.</p>
      </div>
    `;
    document.getElementById('bboxOverlay').innerHTML = '';
    document.getElementById('discrepancyBanner').style.display = 'none';
    return;
  }

  if (currentQueueIndex >= queue.length) currentQueueIndex = 0;
  const doc = queue[currentQueueIndex];

  document.getElementById('currentDocTitle').innerText = doc.filename;
  document.getElementById('currentDocCategory').innerText = doc.category || 'General';
  document.getElementById('currentDocStatusTag').innerText = doc.status.replace('_', ' ');
  document.getElementById('currentDocStatusTag').className = doc.status === 'APPROVED' ? 'status-tag tag-success' : 'status-tag tag-warning';
  document.getElementById('currentDocSha').innerText = `SHA: ${(doc.sha256 || 'a1b2c3d4e5f6').substring(0, 10)}...`;
  document.getElementById('queuePager').innerText = `${currentQueueIndex + 1} of ${queue.length}`;

  renderDocumentPreview(doc);
  populateExtractionForm(doc);
  renderAuditTimeline(doc);
}

function renderDocumentPreview(doc) {
  const data = doc.extractedData;
  if (!data) return;

  const linesHtml = (data.lineItems || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #E1E4E8;">
      <td style="padding: 6px 0; color: #6A737D; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 6px 8px; font-weight: 500;">${item.description}</td>
      <td style="text-align: center; color: #24292E;">${item.quantity}</td>
      <td style="text-align: center; color: #6A737D; font-size: 10px;">${item.unitOfMeasure || 'EA'}</td>
      <td style="text-align: right; font-family: monospace;">$${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right; font-weight: 600; font-family: monospace;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #24292E; padding-bottom: 14px; margin-bottom: 18px;">
      <div>
        <h2 style="font-size: 18px; font-weight: 700; color: #24292E;">${data.vendorName?.value || 'COMMERCIAL INVOICE'}</h2>
        <p style="color: #586069; font-size: 11px; margin-top: 2px;">Tax ID / VAT: <strong>${data.vendorTaxId?.value || 'US-88129044'}</strong></p>
      </div>
      <div style="text-align: right;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 600; background: #F6F8FA; padding: 2px 6px; border-radius: 3px; color: #586069; border: 1px solid #E1E4E8;">ORIGINAL</span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 11.5px;">
      <div style="background: #F6F8FA; padding: 10px; border-radius: 4px; border: 1px solid #E1E4E8;">
        <span style="color: #586069; font-size: 10px; text-transform: uppercase; font-weight: 600;">Bill To:</span><br>
        <span style="font-weight: 600; font-size: 12.5px; color: #24292E;">${data.customerName?.value || 'Global Freight & Logistics Corp.'}</span>
      </div>
      <div style="background: #F6F8FA; padding: 10px; border-radius: 4px; border: 1px solid #E1E4E8; text-align: right;">
        <div style="margin-bottom: 3px;">
          <span style="color: #586069;">Invoice #:</span> <strong style="font-family: monospace; color: #24292E;">${data.invoiceNumber?.value}</strong>
        </div>
        <div>
          <span style="color: #586069;">Date:</span> <span style="font-family: monospace; color: #24292E;">${data.invoiceDate?.value}</span>
        </div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #D1D5DA; text-align: left; color: #586069;">
          <th style="padding: 4px 0; width: 20px;">#</th>
          <th style="padding: 4px 8px;">Description</th>
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
      <div style="width: 220px; border-top: 1px solid #24292E; padding-top: 8px; font-size: 11.5px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #586069;">
          <span>Subtotal:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #586069;">
          <span>Tax:</span>
          <span style="font-family: monospace; font-weight: 600;">$${data.taxAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #D1D5DA; padding-top: 4px; font-size: 13px; font-weight: 700; color: #24292E;">
          <span>Total Balance:</span>
          <span style="font-family: monospace;">$${data.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('renderedDocText').innerHTML = html;

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

  const vendorName = data.vendorName?.value || 'Pacific Overland Logistics LLC';
  document.getElementById('vendorMatchedName').innerText = vendorName;
  document.getElementById('vendorAvatar').innerText = vendorName.substring(0, 2).toUpperCase();

  const linesTbody = document.getElementById('lineItemsBody');
  linesTbody.innerHTML = (data.lineItems || []).map((item, idx) => `
    <tr>
      <td style="color: #6E7681; font-family: monospace;">${idx + 1}</td>
      <td><input type="text" value="${item.description}" id="line_desc_${idx}" oninput="revalidateForm()"></td>
      <td><input type="number" value="${item.quantity}" id="line_qty_${idx}" style="text-align: center;" oninput="recalculateLine(${idx})"></td>
      <td><input type="text" value="${item.unitOfMeasure || 'EA'}" id="line_uom_${idx}" style="text-align: center; width: 40px;"></td>
      <td><input type="number" step="0.01" value="${item.unitPrice}" id="line_price_${idx}" style="text-align: right;" oninput="recalculateLine(${idx})"></td>
      <td><input type="number" step="0.01" value="${item.amount}" id="line_amt_${idx}" style="text-align: right; font-weight: 600;" oninput="revalidateForm()"></td>
      <td><button type="button" class="btn-icon" onclick="deleteLineItem(${idx})" title="Delete Line Item" style="color: #F85149;">✕</button></td>
    </tr>
  `).join('');

  document.getElementById('lineItemsCount').innerText = `${data.lineItems?.length || 0}`;
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
  const title = document.getElementById('discrepancyTitle');
  const msg = document.getElementById('discrepancyMessage');
  const repairBtn = document.getElementById('btnAutoRepair');
  const totalInput = document.getElementById('field_totalAmount');
  const totalBBox = document.getElementById('bbox_totalAmount');

  if (diff <= 0.01) {
    banner.className = 'alert-banner alert-success';
    title.innerText = 'Balance Verified';
    msg.innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) equals Total ($${total.toFixed(2)}).`;
    if (repairBtn) repairBtn.style.display = 'none';
    if (totalInput) totalInput.classList.remove('error');
    if (totalBBox) totalBBox.className.baseVal = 'bbox-rect active';
  } else {
    banner.className = 'alert-banner alert-warning';
    title.innerText = 'Balance Mismatch';
    msg.innerText = `Line items sum to $${expectedTotal.toFixed(2)}, but invoice total is $${total.toFixed(2)} (difference: $${diff.toFixed(2)}).`;
    if (repairBtn) repairBtn.style.display = 'inline-block';
    if (totalInput) totalInput.classList.add('error');
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
    description: 'Additional Charge',
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
      body: JSON.stringify({ action, extractedData: updatedData, note: 'Approved via review queue' })
    });
    const result = await res.json();
    if (result.success) {
      await fetchDocuments();
      renderReviewQueue();
    }
  } catch (err) {
    alert('Failed to update review status: ' + err.message);
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
        <td style="font-family: monospace; color: #8B949E;">${d.id}</td>
        <td><strong>${d.filename}</strong></td>
        <td><span style="font-size: 11px; color: #8B949E;">${d.documentType}</span></td>
        <td>${data.vendorName?.value || 'N/A'}</td>
        <td style="font-family: monospace; color: #8B949E;">${data.invoiceDate?.value || 'N/A'}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 600;">$${(data.totalAmount || 0).toFixed(2)}</td>
        <td><span class="status-tag ${d.status === 'APPROVED' ? 'tag-success' : 'tag-warning'}">${d.status.replace('_', ' ')}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="openDocInReview('${d.id}')">Inspect</button>
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
      <td style="font-family: monospace; color: #58A6FF;">${v.id}</td>
      <td><strong>${v.canonicalName}</strong></td>
      <td style="font-family: monospace;">${v.taxId}</td>
      <td><span style="font-size: 11px; background: rgba(110,118,129,0.15); padding: 2px 6px; border-radius: 4px;">${v.defaultGlAccount}</span></td>
      <td><span class="status-tag tag-success">${v.defaultPaymentTerms}</span></td>
      <td style="font-size: 11.5px; color: #8B949E;">${v.aliases.join(' • ')}</td>
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
      <div class="metric-card">
        <span class="metric-label">Invoices Processed</span>
        <div class="metric-value">${data.totalDocuments}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">Auto-Approval Rate</span>
        <div class="metric-value" style="color: #3FB950;">${Math.round((data.approvedCount / (data.totalDocuments || 1)) * 100)}%</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">Total Spend</span>
        <div class="metric-value" style="font-family: monospace;">$${data.totalSpend.toFixed(2)}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">Total Tax</span>
        <div class="metric-value" style="font-family: monospace; color: #D29922;">$${data.totalTax.toFixed(2)}</div>
      </div>
    `;

    document.getElementById('topVendorsList').innerHTML = data.topVendors.map(v => `
      <div class="report-row">
        <span>${v.name}</span>
        <strong>$${v.total.toFixed(2)}</strong>
      </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = data.categoryBreakdown.map(c => `
      <div class="report-row">
        <span>${c.category}</span>
        <strong>$${c.total.toFixed(2)}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed rendering reports:', err);
  }
}

function renderAuditTimeline(doc) {
  const container = document.getElementById('timelineList');
  if (!container) return;
  const trail = doc.auditTrail || [];
  container.innerHTML = trail.map(t => `
    <div class="timeline-entry">
      <div class="timeline-marker"></div>
      <span class="timeline-timestamp">${new Date(t.timestamp).toLocaleTimeString()}</span>
      <div class="timeline-event">${t.action} (${t.actor})</div>
      <div class="timeline-detail">${t.note}</div>
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
  document.querySelectorAll('.erp-tab').forEach(t => t.classList.remove('active'));
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
  copyBtn.innerText = 'Copied!';
  setTimeout(() => copyBtn.innerText = 'Copy to Clipboard', 2000);
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
  const items = document.querySelectorAll('.palette-row');
  items.forEach(it => {
    const text = it.innerText.toLowerCase();
    it.style.display = text.includes(q) ? 'flex' : 'none';
  });
}
