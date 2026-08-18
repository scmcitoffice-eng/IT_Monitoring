/* =========================================================
   Scheduled IT Equipment Checking — Dashboard Logic
   ========================================================= */

const DEPARTMENTS = [
  "Human Resources", "Laboratory", "Accounting", "Medical Records",
  "Pharmacy", "Nursing Station", "Admitting", "IT Department"
];

const DEPT_ICON = {
  "Human Resources": { cls: "dept-hr", path: '<circle cx="9" cy="8" r="3"/><path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6"/><path d="M16 4.7c1.5.4 2.6 1.8 2.6 3.4 0 1.6-1.1 3-2.6 3.4M21.5 20c0-2.8-1.9-5-4.5-5.7"/>' },
  "Laboratory": { cls: "dept-lab", path: '<path d="M9 2h6M10 2v6.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 8.5V2"/><path d="M7.5 14h9"/>' },
  "Accounting": { cls: "dept-acct", path: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h8M8 11h3M8 15h3M14 11h2M14 15h2"/>' },
  "Medical Records": { cls: "dept-mr", path: '<path d="M3 7l2-2h6l2 2h8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>' },
  "Pharmacy": { cls: "dept-pharm", path: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/>' },
  "Nursing Station": { cls: "dept-nurse", path: '<path d="M9 3v4M15 3v4M6 7h12v5a6 6 0 0 1-12 0V7z"/><path d="M12 12v6M9 21h6"/>' },
  "Admitting": { cls: "dept-admit", path: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>' },
  "IT Department": { cls: "dept-it", path: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>' }
};

const STATUS_MAP = {
  "Good": "status-good",
  "With Issue": "status-issue",
  "Due": "status-due",
  "For Monitoring": "status-monitoring"
};

/* Seed dataset — mirrors the design, extended to 245 records */
function buildSeedData() {
  const base = [
    ["Human Resources", "PC-001 (Desktop)", "Juan Dela Cruz", "2026-08-18", "Good", "No issues found."],
    ["Laboratory", "Epson L5290 (Printer)", "Maria Santos", "2026-08-18", "With Issue", "ADF feeder problem."],
    ["Accounting", "PC-014 (Desktop)", "Mark Anthony", null, "Due", "Scheduled check"],
    ["Medical Records", "Epson L120 (Printer)", "Ana Reyes", "2026-08-17", "With Issue", "Not printing properly."],
    ["Pharmacy", "PC-003 (Desktop)", "Rhea Morales", "2026-08-17", "Good", "All functioning well."],
    ["Nursing Station", "PC-009 (Desktop)", "Jose P. Garcia", "2026-08-16", "For Monitoring", "Slow performance."],
    ["Admitting", "Canon G3010 (Printer)", "Liza Mendoza", "2026-08-16", "Good", "No issues found."],
    ["IT Department", "Server (Production)", "Lito Cabajar", "2026-08-15", "Good", "System normal."]
  ];

  const equipmentTypes = [
    "PC (Desktop)", "PC (Laptop)", "Epson L5290 (Printer)", "Canon G3010 (Printer)",
    "HP LaserJet (Printer)", "Router (Network)", "Switch (Network)", "UPS Unit",
    "Server (Production)", "Server (Backup)", "Monitor 24in", "Barcode Scanner"
  ];
  const users = [
    "Juan Dela Cruz", "Maria Santos", "Mark Anthony", "Ana Reyes", "Rhea Morales",
    "Jose P. Garcia", "Liza Mendoza", "Lito Cabajar", "Carmela Sy", "Ramon Torres",
    "Bea Villanueva", "Noel Ramos", "Grace Uy", "Ferdie Santos", "Ivy Domingo"
  ];
  const statuses = ["Good", "Good", "Good", "With Issue", "For Monitoring", "Due"];
  const notesByStatus = {
    "Good": ["All functioning well.", "No issues found.", "System normal.", "Passed inspection."],
    "With Issue": ["ADF feeder problem.", "Not printing properly.", "Random shutdowns.", "Network drops intermittently."],
    "For Monitoring": ["Slow performance.", "Fan noise, watching closely.", "Minor lag reported."],
    "Due": ["Scheduled check", "Awaiting technician", "Queued for inspection"]
  };

  const rows = base.map((r, i) => ({ id: i + 1, department: r[0], equipment: r[1], user: r[2], date: r[3], status: r[4], notes: r[5] }));

  let id = rows.length + 1;
  const totalTarget = 245;
  while (rows.length < totalTarget) {
    const dept = DEPARTMENTS[id % DEPARTMENTS.length];
    const equip = equipmentTypes[id % equipmentTypes.length];
    const num = String(id).padStart(3, "0");
    const user = users[id % users.length];
    const status = statuses[id % statuses.length];
    const hasDate = status !== "Due";
    const day = 1 + (id % 28);
    const month = 1 + (id % 8);
    const date = hasDate ? `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
    const notesArr = notesByStatus[status];
    const notes = notesArr[id % notesArr.length];
    rows.push({
      id,
      department: dept,
      equipment: `${equip.split(" (")[0]}-${num} (${equip.split(" (")[1] ?? "Desktop)"}`,
      user,
      date,
      status,
      notes
    });
    id++;
  }
  return rows;
}

const DATA = buildSeedData();

/* ---------------- State ---------------- */
const state = {
  search: "",
  department: "All",
  status: "All",
  date: "All",
  page: 1,
  pageSize: 8
};

/* ---------------- DOM refs ---------------- */
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const deptFilter = document.getElementById("deptFilter");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const showingText = document.getElementById("showingText");
const paginationEl = document.getElementById("pagination");

const statTotal = document.getElementById("statTotal");
const statChecked = document.getElementById("statChecked");
const statCheckedPct = document.getElementById("statCheckedPct");
const statPending = document.getElementById("statPending");
const statIssues = document.getElementById("statIssues");

const viewModalOverlay = document.getElementById("viewModalOverlay");
const viewModalBody = document.getElementById("viewModalBody");
const viewModalClose = document.getElementById("viewModalClose");

const addModalOverlay = document.getElementById("addModalOverlay");
const addModalClose = document.getElementById("addModalClose");
const addCheckingBtn = document.getElementById("addCheckingBtn");
const cancelAdd = document.getElementById("cancelAdd");
const addForm = document.getElementById("addForm");
const fDept = document.getElementById("fDept");
const fEquipment = document.getElementById("fEquipment");
const fUser = document.getElementById("fUser");
const fDate = document.getElementById("fDate");
const fStatus = document.getElementById("fStatus");
const fNotes = document.getElementById("fNotes");

const toast = document.getElementById("toast");

/* ---------------- Init filters ---------------- */
function initFilters() {
  DEPARTMENTS.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    deptFilter.appendChild(opt);

    const fOpt = document.createElement("option");
    fOpt.value = d;
    fOpt.textContent = d;
    fDept.appendChild(fOpt);
  });

  Object.keys(STATUS_MAP).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    statusFilter.appendChild(opt);
  });
}

/* ---------------- Formatting helpers ---------------- */
function formatDate(iso) {
  if (!iso) return "\u2013";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status) {
  return STATUS_MAP[status] || "status-due";
}

function deptIcon(dept) {
  return DEPT_ICON[dept] || { cls: "dept-default", path: '<rect x="3" y="4" width="18" height="12" rx="1.5"/>' };
}

/* ---------------- Filtering ---------------- */
function getFiltered() {
  const q = state.search.trim().toLowerCase();
  return DATA.filter(row => {
    if (state.department !== "All" && row.department !== state.department) return false;
    if (state.status !== "All" && row.status !== state.status) return false;
    if (state.date !== "All" && row.date !== state.date) return false;
    if (q) {
      const hay = `${row.department} ${row.equipment} ${row.user} ${row.notes}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------- Rendering ---------------- */
function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * state.pageSize;
  const pageRows = filtered.slice(start, start + state.pageSize);

  tableBody.innerHTML = "";

  if (pageRows.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = `<td colspan="7">No equipment records match your filters.</td>`;
    tableBody.appendChild(tr);
  } else {
    pageRows.forEach(row => {
      const icon = deptIcon(row.department);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="dept-cell">
            <span class="dept-icon ${icon.cls}"><svg viewBox="0 0 24 24">${icon.path}</svg></span>
            ${row.department}
          </div>
        </td>
        <td>${row.equipment}</td>
        <td>${row.user}</td>
        <td>${row.date ? formatDate(row.date) : '<span class="text-muted">\u2013</span>'}</td>
        <td><span class="status-pill ${statusClass(row.status)}">${row.status}</span></td>
        <td class="notes-cell" title="${escapeHtml(row.notes)}">${escapeHtml(row.notes)}</td>
        <td class="td-action">
          <div class="action-btns">
            <button class="icon-btn" data-action="view" data-id="${row.id}" aria-label="View">
              <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon-btn" data-action="more" data-id="${row.id}" aria-label="More options">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Showing text
  if (filtered.length === 0) {
    showingText.textContent = "Showing 0 entries";
  } else {
    const from = start + 1;
    const to = Math.min(start + state.pageSize, filtered.length);
    showingText.textContent = `Showing ${from} to ${to} of ${filtered.length} entries`;
  }

  renderPagination(totalPages);
  renderStats();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderPagination(totalPages) {
  paginationEl.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn";
  prevBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>`;
  prevBtn.disabled = state.page === 1;
  prevBtn.addEventListener("click", () => { state.page--; render(); });
  paginationEl.appendChild(prevBtn);

  const pages = getPageList(state.page, totalPages);
  pages.forEach(p => {
    if (p === "...") {
      const span = document.createElement("span");
      span.className = "page-ellipsis";
      span.textContent = "...";
      paginationEl.appendChild(span);
    } else {
      const btn = document.createElement("button");
      btn.className = "page-btn" + (p === state.page ? " active" : "");
      btn.textContent = p;
      btn.addEventListener("click", () => { state.page = p; render(); });
      paginationEl.appendChild(btn);
    }
  });

  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn";
  nextBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>`;
  nextBtn.disabled = state.page === totalPages;
  nextBtn.addEventListener("click", () => { state.page++; render(); });
  paginationEl.appendChild(nextBtn);
}

function getPageList(current, total) {
  const delta = 1;
  const range = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  const withDots = [];
  let prev = 0;
  range.forEach(p => {
    if (prev && p - prev > 1) withDots.push("...");
    withDots.push(p);
    prev = p;
  });
  return withDots;
}

function renderStats() {
  const total = DATA.length;
  const checked = DATA.filter(r => r.status === "Good" || r.status === "For Monitoring" || (r.status === "With Issue")).length + 0;
  // Checked = anything that has been actually checked (has a date)
  const checkedCount = DATA.filter(r => r.date !== null).length;
  const pending = DATA.filter(r => r.status === "Due").length;
  const issues = DATA.filter(r => r.status === "With Issue").length;

  statTotal.textContent = total;
  statChecked.textContent = checkedCount;
  statCheckedPct.textContent = `${((checkedCount / total) * 100).toFixed(2)}% of total`;
  statPending.textContent = pending;
  statIssues.textContent = issues;
}

/* ---------------- Events: filters ---------------- */
let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value;
    state.page = 1;
    render();
  }, 180);
});

deptFilter.addEventListener("change", (e) => {
  state.department = e.target.value;
  state.page = 1;
  render();
});

statusFilter.addEventListener("change", (e) => {
  state.status = e.target.value;
  state.page = 1;
  render();
});

dateFilter.addEventListener("click", () => {
  // simple prompt-based date picker fallback (native calendar substitute)
  const picker = document.createElement("input");
  picker.type = "date";
  picker.style.position = "fixed";
  picker.style.opacity = "0";
  picker.style.pointerEvents = "none";
  document.body.appendChild(picker);
  picker.addEventListener("change", () => {
    if (picker.value) {
      state.date = picker.value;
      dateFilter.value = formatDate(picker.value);
    } else {
      state.date = "All";
      dateFilter.value = "";
    }
    state.page = 1;
    render();
    picker.remove();
  });
  picker.click();
  if (typeof picker.showPicker === "function") {
    try { picker.showPicker(); } catch (_) {}
  }
});

/* ---------------- View modal ---------------- */
function openViewModal(id) {
  const row = DATA.find(r => r.id === id);
  if (!row) return;
  viewModalBody.innerHTML = `
    <div class="detail-row"><span>Department</span><span>${escapeHtml(row.department)}</span></div>
    <div class="detail-row"><span>Equipment</span><span>${escapeHtml(row.equipment)}</span></div>
    <div class="detail-row"><span>User</span><span>${escapeHtml(row.user)}</span></div>
    <div class="detail-row"><span>Date Checked</span><span>${row.date ? formatDate(row.date) : "\u2013"}</span></div>
    <div class="detail-row"><span>Status</span><span><span class="status-pill ${statusClass(row.status)}">${row.status}</span></span></div>
    <div class="detail-row"><span>Notes</span><span>${escapeHtml(row.notes)}</span></div>
  `;
  viewModalOverlay.classList.add("open");
}

tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".icon-btn");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "view") {
    openViewModal(id);
  } else if (btn.dataset.action === "more") {
    openViewModal(id); // simplified: reuse detail view for "more"
  }
});

viewModalClose.addEventListener("click", () => viewModalOverlay.classList.remove("open"));
viewModalOverlay.addEventListener("click", (e) => {
  if (e.target === viewModalOverlay) viewModalOverlay.classList.remove("open");
});

/* ---------------- Add Checking modal ---------------- */
function openAddModal() {
  addForm.reset();
  fDate.valueAsDate = new Date();
  addModalOverlay.classList.add("open");
}

addCheckingBtn.addEventListener("click", openAddModal);
addModalClose.addEventListener("click", () => addModalOverlay.classList.remove("open"));
cancelAdd.addEventListener("click", () => addModalOverlay.classList.remove("open"));
addModalOverlay.addEventListener("click", (e) => {
  if (e.target === addModalOverlay) addModalOverlay.classList.remove("open");
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newRow = {
    id: DATA.length ? Math.max(...DATA.map(r => r.id)) + 1 : 1,
    department: fDept.value,
    equipment: fEquipment.value.trim(),
    user: fUser.value.trim(),
    date: fDate.value || null,
    status: fStatus.value,
    notes: fNotes.value.trim() || "No notes provided."
  };
  DATA.unshift(newRow);
  addModalOverlay.classList.remove("open");
  state.page = 1;
  render();
  showToast("Equipment checking added successfully.");
});

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ---------------- Sidebar toggle (mobile + desktop) ---------------- */
const sidebar = document.getElementById("sidebar");
const hamburger = document.getElementById("hamburger");

hamburger.addEventListener("click", () => {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    viewModalOverlay.classList.remove("open");
    addModalOverlay.classList.remove("open");
  }
});

/* ---------------- Init ---------------- */
initFilters();
render();
