(() => {
  "use strict";

  /* ---------------- DATA ---------------- */
  const STORAGE_KEY = "scmc-equipment-checking";

  const seedData = [
    { id: 1, dept: "Human Resources", equipment: "PC-001 (Desktop)", location: "HR Office, 3rd Floor", user: "Juan Dela Cruz", date: "2026-08-18", status: "Good", notes: "No issues found." },
    { id: 2, dept: "Laboratory", equipment: "Epson L5290 (Printer)", location: "Lab Room 1, Ground Floor", user: "Maria Santos", date: "2026-08-18", status: "With Issue", notes: "ADF feeder problem." },
    { id: 3, dept: "Accounting", equipment: "PC-014 (Desktop)", location: "Accounting Office, 3rd Floor", user: "Mark Anthony", date: "", status: "Due", notes: "Scheduled check" },
    { id: 4, dept: "Medical Records", equipment: "Epson L120 (Printer)", location: "Records Room A, 2nd Floor", user: "Ana Reyes", date: "2026-08-17", status: "With Issue", notes: "Not printing properly." },
    { id: 5, dept: "Pharmacy", equipment: "PC-003 (Desktop)", location: "Pharmacy Counter, Ground Floor", user: "Rhea Morales", date: "2026-08-17", status: "Good", notes: "All functioning well." },
    { id: 6, dept: "Nursing Station", equipment: "PC-009 (Desktop)", location: "Nurses Station A, 4th Floor", user: "Jose P. Garcia", date: "2026-08-16", status: "For Monitoring", notes: "Slow performance." },
    { id: 7, dept: "Admitting", equipment: "Canon G3010 (Printer)", location: "Admitting Desk, Ground Floor", user: "Liza Mendoza", date: "2026-08-16", status: "Good", notes: "No issues found." },
    { id: 8, dept: "IT Department", equipment: "Server (Production)", location: "Server Room, 6th Floor", user: "Lito Cabajar", date: "2026-08-15", status: "Good", notes: "System normal." },
  ];

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore, fall back to seed */ }
    return seedData;
  }

  function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) { /* storage unavailable */ }
  }

  let records = loadData();
  let nextId = Math.max(0, ...records.map(r => r.id)) + 1;

  const DEPT_ICONS = {
    "Human Resources": iconUsers(),
    "Laboratory": iconFlask(),
    "Accounting": iconLayout(),
    "Medical Records": iconFolder(),
    "Pharmacy": iconMonitor(),
    "Nursing Station": iconPulse(),
    "Admitting": iconUser(),
    "IT Department": iconServer(),
  };
  function defaultDeptIcon() { return iconMonitor(); }
  function iconUsers(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>`;}
  function iconFlask(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2L15 8V2"/><path d="M9 2h6M8 16h8"/></svg>`;}
  function iconLayout(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`;}
  function iconFolder(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>`;}
  function iconMonitor(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>`;}
  function iconPulse(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;}
  function iconUser(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;}
  function iconServer(){return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="7" rx="1.5"/><rect x="2" y="14" width="20" height="7" rx="1.5"/><path d="M6 7h.01M6 18h.01"/></svg>`;}
  const PIN_ICON = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.2"/></svg>`;
  const EYE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const TRASH_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>`;

  const STATUS_PILL = {
    "Good": "pill-good",
    "With Issue": "pill-issue",
    "Due": "pill-due",
    "For Monitoring": "pill-monitor",
  };

  /* ---------------- DOM refs ---------------- */
  const tableBody = document.getElementById("tableBody");
  const emptyState = document.getElementById("emptyState");
  const rowCount = document.getElementById("rowCount");

  const searchInput = document.getElementById("searchInput");
  const filterDept = document.getElementById("filterDept");
  const filterStatus = document.getElementById("filterStatus");
  const filterLocation = document.getElementById("filterLocation");
  const filterDate = document.getElementById("filterDate");

  const statTotal = document.getElementById("statTotal");
  const statChecked = document.getElementById("statChecked");
  const statCheckedPct = document.getElementById("statCheckedPct");
  const statPending = document.getElementById("statPending");
  const statIssues = document.getElementById("statIssues");

  /* ---------------- helpers ---------------- */
  function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function populateSelectOptions() {
    const depts = [...new Set(records.map(r => r.dept))].sort();
    const locs = [...new Set(records.map(r => r.location))].sort();

    const currentDept = filterDept.value;
    filterDept.innerHTML = `<option value="All">All</option>` +
      depts.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");
    if (depts.includes(currentDept)) filterDept.value = currentDept;

    const currentLoc = filterLocation.value;
    filterLocation.innerHTML = `<option value="All">All</option>` +
      locs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
    if (locs.includes(currentLoc)) filterLocation.value = currentLoc;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    const dept = filterDept.value;
    const status = filterStatus.value;
    const loc = filterLocation.value;
    const date = filterDate.value;

    return records.filter(r => {
      if (dept !== "All" && r.dept !== dept) return false;
      if (status !== "All" && r.status !== status) return false;
      if (loc !== "All" && r.location !== loc) return false;
      if (date && r.date !== date) return false;
      if (q) {
        const hay = `${r.dept} ${r.equipment} ${r.location} ${r.user} ${r.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  /* ---------------- render ---------------- */
  function render() {
    populateSelectOptions();
    const filtered = getFiltered();

    tableBody.innerHTML = filtered.map(r => `
      <tr data-id="${r.id}">
        <td>
          <div class="cell-dept">
            <span class="dept-icon">${DEPT_ICONS[r.dept] || defaultDeptIcon()}</span>
            ${escapeHtml(r.dept)}
          </div>
        </td>
        <td>${escapeHtml(r.equipment)}</td>
        <td><span class="cell-location">${PIN_ICON}${escapeHtml(r.location)}</span></td>
        <td>${escapeHtml(r.user)}</td>
        <td>${r.date ? formatDate(r.date) : '<span class="cell-dash">—</span>'}</td>
        <td><span class="pill ${STATUS_PILL[r.status] || "pill-due"}">${escapeHtml(r.status)}</span></td>
        <td class="cell-notes">${escapeHtml(r.notes || "")}</td>
        <td class="col-action">
          <div class="row-actions">
            <button class="icon-btn view-btn" title="View" aria-label="View">${EYE_ICON}</button>
            <button class="icon-btn danger delete-btn" title="Delete" aria-label="Delete">${TRASH_ICON}</button>
          </div>
        </td>
      </tr>
    `).join("");

    emptyState.hidden = filtered.length !== 0;
    rowCount.textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

    renderStats();
  }

  function renderStats() {
    const total = records.length;
    const checked = records.filter(r => !!r.date).length;
    const pending = records.filter(r => !r.date || r.status === "Due").length;
    const issues = records.filter(r => r.status === "With Issue").length;
    const pct = total ? ((checked / total) * 100).toFixed(2) : "0.00";

    statTotal.textContent = total;
    statChecked.textContent = checked;
    statCheckedPct.textContent = `${pct}% of total`;
    statPending.textContent = pending;
    statIssues.textContent = issues;
  }

  /* ---------------- events: filters ---------------- */
  [searchInput, filterDept, filterStatus, filterLocation, filterDate].forEach(el => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  /* ---------------- row actions ---------------- */
  tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const id = Number(tr.dataset.id);
    const record = records.find(r => r.id === id);
    if (!record) return;

    if (e.target.closest(".view-btn")) openViewModal(record);
    if (e.target.closest(".delete-btn")) {
      if (confirm(`Delete checking record for "${record.equipment}"?`)) {
        records = records.filter(r => r.id !== id);
        saveData();
        render();
      }
    }
  });

  /* ---------------- Delete Filtered ---------------- */
  document.getElementById("deleteFilteredBtn").addEventListener("click", () => {
    const filtered = getFiltered();
    if (filtered.length === 0) { alert("No records match the current filters."); return; }
    if (!confirm(`Delete ${filtered.length} filtered record${filtered.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const idsToDelete = new Set(filtered.map(r => r.id));
    records = records.filter(r => !idsToDelete.has(r.id));
    saveData();
    render();
  });

  /* ---------------- Export ---------------- */
  document.getElementById("exportBtn").addEventListener("click", () => {
    const filtered = getFiltered();
    const headers = ["Department", "Equipment", "Location", "User", "Date Checked", "Status", "Notes"];
    const rows = filtered.map(r => [r.dept, r.equipment, r.location, r.user, r.date ? formatDate(r.date) : "", r.status, r.notes || ""]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipment-checking-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  /* ---------------- Add / Edit modal ---------------- */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const checkingForm = document.getElementById("checkingForm");
  const recordIdField = document.getElementById("recordId");
  const fDept = document.getElementById("fDept");
  const fEquipment = document.getElementById("fEquipment");
  const fLocation = document.getElementById("fLocation");
  const fUser = document.getElementById("fUser");
  const fDate = document.getElementById("fDate");
  const fStatus = document.getElementById("fStatus");
  const fNotes = document.getElementById("fNotes");

  function openAddModal() {
    modalTitle.textContent = "Add Equipment Checking";
    checkingForm.reset();
    recordIdField.value = "";
    fDate.value = new Date().toISOString().slice(0, 10);
    modalOverlay.hidden = false;
    fDept.focus();
  }

  function closeAddModal() {
    modalOverlay.hidden = true;
  }

  document.getElementById("addBtn").addEventListener("click", openAddModal);
  document.getElementById("modalClose").addEventListener("click", closeAddModal);
  document.getElementById("cancelBtn").addEventListener("click", closeAddModal);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeAddModal(); });

  checkingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newRecord = {
      id: nextId++,
      dept: fDept.value.trim(),
      equipment: fEquipment.value.trim(),
      location: fLocation.value.trim(),
      user: fUser.value.trim(),
      date: fDate.value || "",
      status: fStatus.value,
      notes: fNotes.value.trim(),
    };
    records.unshift(newRecord);
    saveData();
    render();
    closeAddModal();
  });

  /* ---------------- View modal ---------------- */
  const viewOverlay = document.getElementById("viewOverlay");
  const detailList = document.getElementById("detailList");

  function openViewModal(record) {
    detailList.innerHTML = `
      <div><dt>Department</dt><dd>${escapeHtml(record.dept)}</dd></div>
      <div><dt>Equipment</dt><dd>${escapeHtml(record.equipment)}</dd></div>
      <div><dt>Location</dt><dd>${escapeHtml(record.location)}</dd></div>
      <div><dt>User</dt><dd>${escapeHtml(record.user)}</dd></div>
      <div><dt>Date Checked</dt><dd>${record.date ? formatDate(record.date) : "—"}</dd></div>
      <div><dt>Status</dt><dd><span class="pill ${STATUS_PILL[record.status] || "pill-due"}">${escapeHtml(record.status)}</span></dd></div>
      <div><dt>Notes</dt><dd>${escapeHtml(record.notes || "—")}</dd></div>
    `;
    viewOverlay.hidden = false;
  }
  document.getElementById("viewClose").addEventListener("click", () => { viewOverlay.hidden = true; });
  viewOverlay.addEventListener("click", (e) => { if (e.target === viewOverlay) viewOverlay.hidden = true; });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeAddModal(); viewOverlay.hidden = true; }
  });

  /* ---------------- Sidebar toggles ---------------- */
  function wireToggle(btnId, subId) {
    const btn = document.getElementById(btnId);
    const sub = document.getElementById(subId);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const isOpen = sub.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }
  wireToggle("equipmentToggle", "equipmentSub");
  wireToggle("reportsToggle", "reportsSub");

  const hamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebar.classList.toggle("collapsed");
  });

  /* ---------------- init ---------------- */
  render();
})();
