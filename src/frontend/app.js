/**
 * Frontend Controller & Enterprise Dual-Pane Review Engine
 */

let documents = [];
let vendors = [];
let currentQueueIndex = 0;
let zoomLevel = 1.0;
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
    console.error('Failed to fetch documents:', err);
  }
}

async function fetchVendors() {
  try {
    const res = await fetch('/api/vendors');
    const data = await res.json();
    vendors = data.vendors || [];
    renderVendorsTable();
  } catch (err) {
    console.error('Failed to fetch vendors:', err);
  }
}

function updateHeaderCounts() {
  const queueDocs = documents.filter(d => d.status === 'REVIEW_REQUIRED');
  document.getElementById('queueCountBadge').innerText = queueDocs.length;
  document.getElementById('totalCountBadge').innerText = documents.length;
  if (document.getElementById('vendorMasterCount')) {
    document.getElementById('vendorMasterCount').innerText = `${vendors.length} Verified Vendors`;
  }
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

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
    document.getElementById('currentDocTitle').innerText = 'No documents in review queue';
    document.getElementById('currentDocStatus').innerText = 'ALL CLEAR';
    document.getElementById('currentDocStatus').className = 'status-tag status-approved';
    document.getElementById('renderedDocText').innerHTML = '<div style="padding: 40px; text-align: center; color: #64748B;">All documents have been verified and approved! 🎉</div>';
    document.getElementById('bboxOverlay').innerHTML = '';
    document.getElementById('discrepancyBanner').style.display = 'none';
    return;
  }

  if (currentQueueIndex >= queue.length) currentQueueIndex = 0;
  const doc = queue[currentQueueIndex];

  document.getElementById('currentDocTitle').innerText = doc.filename;
  document.getElementById('currentDocStatus').innerText = doc.status.replace('_', ' ');
  document.getElementById('currentDocStatus').className = `status-tag status-${doc.status.toLowerCase().replace('_', '-')}`;
  document.getElementById('queuePager').innerText = `Item ${currentQueueIndex + 1} of ${queue.length}`;

  renderDocumentPreview(doc);
  populateExtractionForm(doc);
}

function renderDocumentPreview(doc) {
  const data = doc.extractedData;
  if (!data) return;

  const linesHtml = (data.lineItems || []).map(item => `
    <tr style="border-bottom: 1px solid #F1F5F9;">
      <td style="padding: 6px 0;">${item.description}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: center; color: #94A3B8;">${item.unitOfMeasure || 'EA'}</td>
      <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0F172A;">${data.vendorName?.value || 'VENDOR INVOICE'}</h2>
      <p style="color: #64748B; font-size: 11px;">Tax ID: ${data.vendorTaxId?.value || 'N/A'}</p>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
      <div>
        <strong style="color: #475569;">Billed To:</strong><br>
        <span>${data.customerName?.value || 'Customer Name'}</span>
      </div>
      <div style="text-align: right;">
        <strong style="color: #475569;">Invoice #:</strong> <span>${data.invoiceNumber?.value}</span><br>
        <strong style="color: #475569;">Date:</strong> <span>${data.invoiceDate?.value}</span>
      </div>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px solid #CBD5E1; text-align: left; color: #64748B;">
          <th style="padding: 4px 0;">Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: center;">UOM</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>
    <div style="text-align: right; border-top: 1px solid #CBD5E1; padding-top: 12px;">
      <p>Subtotal: $${data.subtotal.toFixed(2)}</p>
      <p>Tax: $${data.taxAmount.toFixed(2)}</p>
      <h3 style="font-size: 16px; font-weight: 700; color: #0F172A; margin-top: 6px;">Total: $${data.totalAmount.toFixed(2)}</h3>
    </div>
  `;

  document.getElementById('renderedDocText').innerHTML = html;

  const svgLayer = document.getElementById('bboxOverlay');
  svgLayer.innerHTML = `
    <rect id="bbox_vendorName" class="bbox-rect" x="80" y="80" width="370" height="60" rx="4" />
    <rect id="bbox_invoiceNumber" class="bbox-rect" x="650" y="120" width="230" height="40" rx="4" />
    <rect id="bbox_invoiceDate" class="bbox-rect" x="650" y="170" width="230" height="40" rx="4" />
    <rect id="bbox_customerName" class="bbox-rect" x="80" y="250" width="370" height="70" rx="4" />
    <rect id="bbox_subtotal" class="bbox-rect" x="650" y="600" width="250" height="30" rx="4" />
    <rect id="bbox_taxAmount" class="bbox-rect" x="650" y="635" width="250" height="30" rx="4" />
    <rect id="bbox_totalAmount" class="bbox-rect error" x="650" y="670" width="250" height="40" rx="4" />
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

  if (document.getElementById('vendorMatchBadge')) {
    if (data.vendorName?.masterId) {
      document.getElementById('vendorMatchBadge').innerText = `Matched (${data.vendorName.masterId})`;
      document.getElementById('vendorMatchBadge').style.color = '#10B981';
    } else {
      document.getElementById('vendorMatchBadge').innerText = 'Uncataloged Vendor';
      document.getElementById('vendorMatchBadge').style.color = '#F59E0B';
    }
  }

  const tbody = document.getElementById('lineItemsBody');
  tbody.innerHTML = (data.lineItems || []).map((item, idx) => `
    <tr>
      <td><input type="text" value="${item.description}" id="line_desc_${idx}" oninput="revalidateForm()"></td>
      <td><input type="number" value="${item.quantity}" id="line_qty_${idx}" style="text-align: center;" oninput="recalculateLine(${idx})"></td>
      <td><input type="text" value="${item.unitOfMeasure || 'EA'}" id="line_uom_${idx}" style="text-align: center; width: 45px;"></td>
      <td><input type="number" step="0.01" value="${item.unitPrice}" id="line_price_${idx}" style="text-align: right;" oninput="recalculateLine(${idx})"></td>
      <td><input type="number" step="0.01" value="${item.amount}" id="line_amt_${idx}" style="text-align: right; font-weight: 600;" oninput="revalidateForm()"></td>
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
    for (let i = 0; i < (doc.extractedData.lineItems?.length || 0); i++) {
      subtotal += parseFloat(document.getElementById(`line_amt_${i}`).value) || 0;
    }
    document.getElementById('field_subtotal').value = Math.round(subtotal * 100) / 100;
  }
  revalidateForm();
}

function revalidateForm() {
  const subtotal = parseFloat(document.getElementById('field_subtotal').value) || 0;
  const tax = parseFloat(document.getElementById('field_taxAmount').value) || 0;
  const total = parseFloat(document.getElementById('field_totalAmount').value) || 0;

  const expectedTotal = Math.round((subtotal + tax) * 100) / 100;
  const diff = Math.abs(expectedTotal - total);

  const banner = document.getElementById('discrepancyBanner');
  const totalInput = document.getElementById('field_totalAmount');
  const totalBBox = document.getElementById('bbox_totalAmount');

  if (diff <= 0.01) {
    banner.className = 'discrepancy-banner banner-success';
    document.getElementById('discrepancyTitle').innerText = 'All Calculations Validated (100% Math Match)';
    document.getElementById('discrepancyMessage').innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) equals Grand Total ($${total.toFixed(2)}). Ready for approval.`;
    totalInput.classList.remove('error');
    if (totalBBox) totalBBox.className = 'bbox-rect active';
  } else {
    banner.className = 'discrepancy-banner banner-error';
    document.getElementById('discrepancyTitle').innerText = 'Mathematical Discrepancy Detected';
    document.getElementById('discrepancyMessage').innerText = `Subtotal ($${subtotal.toFixed(2)}) + Tax ($${tax.toFixed(2)}) = $${expectedTotal.toFixed(2)}, but extracted Total is $${total.toFixed(2)} (Difference: $${diff.toFixed(2)}).`;
    totalInput.classList.add('error');
    if (totalBBox) totalBBox.className = 'bbox-rect error';
  }
}

function highlightBBox(fieldName) {
  document.querySelectorAll('.bbox-rect').forEach(b => b.classList.remove('active'));
  const target = document.getElementById(`bbox_${fieldName}`);
  if (target) {
    target.classList.add('active');
  }
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
      body: JSON.stringify({ action, extractedData: updatedData, note: 'Reviewed via web interface' })
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
  document.getElementById('docSheet').style.transform = `scale(${zoomLevel})`;
}

function resetZoom() {
  zoomLevel = 1.0;
  document.getElementById('docSheet').style.transform = 'scale(1.0)';
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
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
  });
}

function renderDocumentsTable() {
  const tbody = document.getElementById('documentsTableBody');
  tbody.innerHTML = documents.map(d => {
    const data = d.extractedData || {};
    return `
      <tr>
        <td class="font-mono">${d.id}</td>
        <td><strong>${d.filename}</strong></td>
        <td>${d.documentType}</td>
        <td>${data.vendorName?.value || 'N/A'}</td>
        <td>${data.invoiceDate?.value || 'N/A'}</td>
        <td class="font-mono font-bold">$${(data.totalAmount || 0).toFixed(2)}</td>
        <td><span class="status-tag status-${d.status.toLowerCase().replace('_', '-')}">${d.status.replace('_', ' ')}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openDocInReview('${d.id}')">View</button>
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
      <td class="font-mono font-bold">${v.id}</td>
      <td><strong>${v.canonicalName}</strong></td>
      <td class="font-mono">${v.taxId}</td>
      <td><span class="badge badge-neutral">${v.defaultGlAccount}</span></td>
      <td>${v.defaultPaymentTerms}</td>
      <td style="font-size: 11px; color: #94A3B8;">${v.aliases.join(', ')}</td>
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
        <span>Total Processed</span>
        <h3>${data.totalDocuments}</h3>
      </div>
      <div class="metric-card">
        <span>Auto-Approved Rate</span>
        <h3 style="color: #34D399;">${Math.round((data.approvedCount / (data.totalDocuments || 1)) * 100)}%</h3>
      </div>
      <div class="metric-card">
        <span>Total Spend Verified</span>
        <h3 class="font-mono">$${data.totalSpend.toFixed(2)}</h3>
      </div>
      <div class="metric-card">
        <span>Total Tax Tracked</span>
        <h3 class="font-mono">$${data.totalTax.toFixed(2)}</h3>
      </div>
    `;

    document.getElementById('topVendorsList').innerHTML = data.topVendors.map(v => `
      <div class="report-item">
        <span>${v.name}</span>
        <strong class="font-mono">$${v.total.toFixed(2)}</strong>
      </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = data.categoryBreakdown.map(c => `
      <div class="report-item">
        <span>${c.category}</span>
        <strong class="font-mono">$${c.total.toFixed(2)}</strong>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to render reports:', err);
  }
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
      console.error('Failed uploading file:', file.name, err);
    }
  }

  await fetchDocuments();
  alert(`Processed ${files.length} document(s) successfully!`);
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
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
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
    document.getElementById('erpJsonCode').innerText = `Error loading ERP payload: ${err.message}`;
  }
}

function copyErpJson() {
  const text = document.getElementById('erpJsonCode').innerText;
  navigator.clipboard.writeText(text);
  alert('ERP JSON schema payload copied to clipboard!');
}
