/* =========================================================
   Scheduled IT Equipment Checking — St. Camillus Medical Center
   Data model per record:
   { id, department, equipment, location, user, dateChecked, status, notes }
   status ∈ "Good" | "With Issue" | "For Monitoring" | "Due"
   ========================================================= */

const STORAGE_KEY = 'scmc_equipment_checking_records';

const DEPT_ICONS = {
  "Human Resources": "👥",
  "Laboratory": "🧪",
  "Accounting": "🗂",
  "Medical Records": "📁",
  "Pharmacy": "💊",
  "Nursing Station": "🩺",
  "Admitting": "🧑",
  "IT Department": "🖥"
};

function seedData() {
  return [
    { id: cryptoId(), department: "Human Resources", equipment: "PC-001 (Desktop)", location: "HR Office, 3rd Floor", user: "Juan Dela Cruz", dateChecked: "2026-08-18", status: "Good", notes: "No issues found." },
    { id: cryptoId(), department: "Laboratory", equipment: "Epson L5290 (Printer)", location: "Lab Room 1, Ground Floor", user: "Maria Santos", dateChecked: "2026-08-18", status: "With Issue", notes: "ADF feeder problem." },
    { id: cryptoId(), department: "Accounting", equipment: "PC-014 (Desktop)", location: "Accounting Office, 3rd Floor", user: "Mark Anthony", dateChecked: "", status: "Due", notes: "Scheduled check" },
    { id: cryptoId(), department: "Medical Records", equipment: "Epson L120 (Printer)", location: "Records Room A, 2nd Floor", user: "Ana Reyes", dateChecked: "2026-08-17", status: "With Issue", notes: "Not printing properly." },
    { id: cryptoId(), department: "Pharmacy", equipment: "PC-003 (Desktop)", location: "Pharmacy Counter, Ground Floor", user: "Rhea Morales", dateChecked: "2026-08-17", status: "Good", notes: "All functioning well." },
    { id: cryptoId(), department: "Nursing Station", equipment: "PC-009 (Desktop)", location: "Nurses Station A, 4th Floor", user: "Jose P. Garcia", dateChecked: "2026-08-16", status: "For Monitoring", notes: "Slow performance." },
    { id: cryptoId(), department: "Admitting", equipment: "Canon G3010 (Printer)", location: "Admitting Desk, Ground Floor", user: "Liza Mendoza", dateChecked: "2026-08-16", status: "Good", notes: "No issues found." },
    { id: cryptoId(), department: "IT Department", equipment: "Server (Production)", location: "Server Room, 6th Floor", user: "Lito Cabajar", dateChecked: "2026-08-15", status: "Good", notes: "System normal." }
  ];
}

function cryptoId() {
  return 'r_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      saveRecords(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load records, reseeding.', e);
    const seeded = seedData();
    saveRecords(seeded);
    return seeded;
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

let records = loadRecords();
let editingId = null;

/* ---------- DOM refs ---------- */
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const deptFilter = document.getElementById('deptFilter');
const statusFilter = document.getElementById('statusFilter');
const locFilter = document.getElementById('locFilter');
const dateFilter = document.getElementById('dateFilter');
const exportBtn = document.getElementById('exportBtn');
const deleteFilteredBtn = document.getElementById('deleteFilteredBtn');
const addBtn = document.getElementById('addBtn');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const checkingForm = document.getElementById('checkingForm');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const deptList = document.getElementById('deptList');

const viewOverlay = document.getElementById('viewOverlay');
const viewClose = document.getElementById('viewClose');
const viewBody = document.getElementById('viewBody');

const toastEl = document.getElementById('toast');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

/* ---------- Status helpers ---------- */
const STATUS_META = {
  "Good": { pill: "pill-good", label: "Good" },
  "With Issue": { pill: "pill-issue", label: "With Issue" },
  "For Monitoring": { pill: "pill-monitor", label: "For Monitoring" },
  "Due": { pill: "pill-due", label: "Due" }
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ---------- Populate filter dropdowns ---------- */
function populateFilters() {
  const depts = [...new Set(records.map(r => r.department))].sort();
  const locs = [...new Set(records.map(r => r.location))].sort();
  const statuses = Object.keys(STATUS_META);

  fillSelect(deptFilter, depts, deptFilter.value);
  fillSelect(locFilter, locs, locFilter.value);
  fillSelect(statusFilter, statuses, statusFilter.value);

  deptList.innerHTML = depts.map(d => `<option value="${escapeAttr(d)}">`).join('');
}

function fillSelect(selectEl, values, keepValue) {
  const current = keepValue && values.includes(keepValue) ? keepValue : 'All';
  selectEl.innerHTML = '<option value="All">All</option>' +
    values.map(v => `<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('');
  selectEl.value = current;
}

/* ---------- Filtering ---------- */
function getFiltered() {
  const q = searchInput.value.trim().toLowerCase();
  const dept = deptFilter.value;
  const status = statusFilter.value;
  const loc = locFilter.value;
  const dateVal = dateFilter.value;

  return records.filter(r => {
    if (dept !== 'All' && r.department !== dept) return false;
    if (status !== 'All' && r.status !== status) return false;
    if (loc !== 'All' && r.location !== loc) return false;
    if (dateVal && r.dateChecked !== dateVal) return false;
    if (q) {
      const hay = `${r.department} ${r.equipment} ${r.location} ${r.user} ${r.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------- Rendering ---------- */
function render() {
  const filtered = getFiltered();
  renderStats();
  renderTable(filtered);
  populateFilters();
}

function renderStats() {
  const total = records.length;
  const checked = records.filter(r => !!r.dateChecked).length;
  const pending = records.filter(r => r.status === 'Due').length;
  const issues = records.filter(r => r.status === 'With Issue').length;
  const pct = total ? Math.round((checked / total) * 1000) / 10 : 0;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statChecked').textContent = checked;
  document.getElementById('statCheckedPct').textContent = `${pct.toFixed(2)}% of total`;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statIssues').textContent = issues;
}

function renderTable(list) {
  if (!list.length) {
    tableBody.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const sorted = [...list].sort((a, b) => (b.dateChecked || '').localeCompare(a.dateChecked || ''));

  tableBody.innerHTML = sorted.map(r => {
    const meta = STATUS_META[r.status] || STATUS_META.Due;
    const icon = DEPT_ICONS[r.department] || '🖥';
    const dateLabel = r.dateChecked ? formatDate(r.dateChecked) : '<span class="date-empty">—</span>';
    return `
      <tr>
        <td>
          <div class="dept-cell">
            <span class="dept-icon">${icon}</span>
            <span class="dept-name">${escapeHtml(r.department)}</span>
          </div>
        </td>
        <td>${escapeHtml(r.equipment)}</td>
        <td class="loc-cell"><span class="loc-pin">📍</span>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.user)}</td>
        <td class="date-cell">${dateLabel}</td>
        <td><span class="pill ${meta.pill}">${meta.label}</span></td>
        <td class="notes-cell">${escapeHtml(r.notes || '')}</td>
        <td>
          <div class="action-cell">
            <button class="icon-action" title="View" data-action="view" data-id="${r.id}">👁</button>
            <button class="icon-action" title="Edit" data-action="edit" data-id="${r.id}">✎</button>
            <button class="icon-action danger" title="Delete" data-action="delete" data-id="${r.id}">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ---------- Escaping ---------- */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }

/* ---------- Table actions ---------- */
tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const record = records.find(r => r.id === id);
  if (!record) return;

  if (action === 'view') openViewModal(record);
  if (action === 'edit') openEditModal(record);
  if (action === 'delete') {
    if (confirm(`Delete the checking record for "${record.equipment}"?`)) {
      records = records.filter(r => r.id !== id);
      saveRecords(records);
      render();
      showToast('Record deleted.');
    }
  }
});

/* ---------- View modal ---------- */
function openViewModal(r) {
  const meta = STATUS_META[r.status] || STATUS_META.Due;
  viewBody.innerHTML = `
    <div class="view-row"><span class="view-label">Department</span><span class="view-value">${escapeHtml(r.department)}</span></div>
    <div class="view-row"><span class="view-label">Equipment</span><span class="view-value">${escapeHtml(r.equipment)}</span></div>
    <div class="view-row"><span class="view-label">Location</span><span class="view-value">${escapeHtml(r.location)}</span></div>
    <div class="view-row"><span class="view-label">User</span><span class="view-value">${escapeHtml(r.user)}</span></div>
    <div class="view-row"><span class="view-label">Date Checked</span><span class="view-value">${r.dateChecked ? formatDate(r.dateChecked) : '—'}</span></div>
    <div class="view-row"><span class="view-label">Status</span><span class="view-value"><span class="pill ${meta.pill}">${meta.label}</span></span></div>
    <div class="view-row"><span class="view-label">Notes</span><span class="view-value">${escapeHtml(r.notes || '—')}</span></div>
  `;
  viewOverlay.hidden = false;
}
viewClose.addEventListener('click', () => viewOverlay.hidden = true);
viewOverlay.addEventListener('click', (e) => { if (e.target === viewOverlay) viewOverlay.hidden = true; });

/* ---------- Add / Edit modal ---------- */
function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'Add Equipment Checking';
  checkingForm.reset();
  document.getElementById('fStatus').value = 'Good';
  modalOverlay.hidden = false;
  document.getElementById('fDepartment').focus();
}

function openEditModal(r) {
  editingId = r.id;
  modalTitle.textContent = 'Edit Equipment Checking';
  document.getElementById('fDepartment').value = r.department;
  document.getElementById('fEquipment').value = r.equipment;
  document.getElementById('fLocation').value = r.location;
  document.getElementById('fUser').value = r.user;
  document.getElementById('fDate').value = r.dateChecked || '';
  document.getElementById('fStatus').value = r.status;
  document.getElementById('fNotes').value = r.notes || '';
  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
  editingId = null;
}

addBtn.addEventListener('click', openAddModal);
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

checkingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    department: document.getElementById('fDepartment').value.trim(),
    equipment: document.getElementById('fEquipment').value.trim(),
    location: document.getElementById('fLocation').value.trim(),
    user: document.getElementById('fUser').value.trim(),
    dateChecked: document.getElementById('fDate').value,
    status: document.getElementById('fStatus').value,
    notes: document.getElementById('fNotes').value.trim()
  };

  if (!payload.department || !payload.equipment || !payload.location || !payload.user) {
    showToast('Please fill in all required fields.');
    return;
  }

  if (editingId) {
    records = records.map(r => r.id === editingId ? { ...r, ...payload } : r);
    showToast('Record updated.');
  } else {
    records.push({ id: cryptoId(), ...payload });
    showToast('Record added.');
  }

  saveRecords(records);
  closeModal();
  render();
});

/* ---------- Filters wiring ---------- */
[searchInput, deptFilter, statusFilter, locFilter, dateFilter].forEach(el => {
  el.addEventListener('input', () => renderTable(getFiltered()));
  el.addEventListener('change', () => renderTable(getFiltered()));
});

/* ---------- Delete filtered ---------- */
deleteFilteredBtn.addEventListener('click', () => {
  const filtered = getFiltered();
  if (!filtered.length) {
    showToast('No records match the current filters.');
    return;
  }
  if (!confirm(`Delete ${filtered.length} filtered record(s)? This cannot be undone.`)) return;
  const idsToDelete = new Set(filtered.map(r => r.id));
  records = records.filter(r => !idsToDelete.has(r.id));
  saveRecords(records);
  render();
  showToast(`${filtered.length} record(s) deleted.`);
});

/* ---------- Export (CSV) ---------- */
exportBtn.addEventListener('click', () => {
  const filtered = getFiltered();
  if (!filtered.length) {
    showToast('No records to export.');
    return;
  }
  const headers = ['Department', 'Equipment', 'Location', 'User', 'Date Checked', 'Status', 'Notes'];
  const rows = filtered.map(r => [
    r.department, r.equipment, r.location, r.user,
    r.dateChecked ? formatDate(r.dateChecked) : '',
    r.status, r.notes || ''
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `equipment-checking-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Export started.');
});

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
}

/* ---------- Sidebar toggles ---------- */
document.querySelectorAll('[data-toggle]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(el.dataset.toggle);
    if (target) target.classList.toggle('open-sub');
  });
});

menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

/* ---------- Keyboard ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modalOverlay.hidden) closeModal();
    if (!viewOverlay.hidden) viewOverlay.hidden = true;
  }
});

/* ---------- Init ---------- */
render();
