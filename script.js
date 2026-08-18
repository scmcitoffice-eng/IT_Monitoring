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

/* =========================================================
   Navigation — page switching & content for every nav item
   ========================================================= */

const PAGE_TITLES = {
  "dashboard": "Dashboard",
  "equipment-all": "All Equipment",
  "equipment-categories": "Equipment Categories",
  "schedule": "Schedule",
  "checking": "Scheduled IT Equipment Checking",
  "issues": "Issues / Service",
  "reports-checking": "Checking Summary Report",
  "reports-department": "Department Summary Report",
  "users": "System Users",
  "settings": "Settings"
};

function statCardsMarkup() {
  const total = DATA.length;
  const checkedCount = DATA.filter(r => r.date !== null).length;
  const pending = DATA.filter(r => r.status === "Due").length;
  const issues = DATA.filter(r => r.status === "With Issue").length;
  const pct = total ? ((checkedCount / total) * 100).toFixed(2) : "0.00";

  return `
    <div class="stat-card">
      <div class="stat-icon blue"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg></div>
      <div class="stat-body">
        <p class="stat-label">Total Equipment</p>
        <p class="stat-value">${total}</p>
        <span class="stat-sub text-muted">Across all departments</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg></div>
      <div class="stat-body">
        <p class="stat-label">Checked</p>
        <p class="stat-value">${checkedCount}</p>
        <span class="stat-sub good">${pct}% of total</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></div>
      <div class="stat-body">
        <p class="stat-label">Pending / Due</p>
        <p class="stat-value">${pending}</p>
        <span class="stat-sub amber-text">To be checked</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red"><svg viewBox="0 0 24 24"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg></div>
      <div class="stat-body">
        <p class="stat-label">With Issues</p>
        <p class="stat-value">${issues}</p>
        <span class="stat-sub red-text">Need attention</span>
      </div>
    </div>
  `;
}

function renderDashboardPage() {
  document.getElementById("dashStats").innerHTML = statCardsMarkup();

  const recent = DATA.filter(r => r.date).slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const recentList = document.getElementById("recentChecksList");
  recentList.innerHTML = recent.length
    ? recent.map(r => `
      <div class="mini-row">
        <div class="mini-row-main">
          <div class="mini-row-title">${escapeHtml(r.equipment)} — ${escapeHtml(r.department)}</div>
          <div class="mini-row-sub">${escapeHtml(r.user)} · ${formatDate(r.date)}</div>
        </div>
        <span class="status-pill ${statusClass(r.status)}">${r.status}</span>
      </div>`).join("")
    : '<div class="mini-empty">No checks recorded yet.</div>';

  const issueCounts = {};
  DATA.forEach(r => { if (r.status === "With Issue") issueCounts[r.department] = (issueCounts[r.department] || 0) + 1; });
  const ranked = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const attentionList = document.getElementById("attentionList");
  attentionList.innerHTML = ranked.length
    ? ranked.map(([dept, count]) => `
      <div class="mini-row">
        <div class="mini-row-main">
          <div class="mini-row-title">${escapeHtml(dept)}</div>
          <div class="mini-row-sub">${count} equipment flagged with issues</div>
        </div>
        <span class="mini-row-badge red-text">${count}</span>
      </div>`).join("")
    : '<div class="mini-empty">No open issues right now.</div>';
}

function renderEquipmentAllPage() {
  const cap = 60;
  const capped = DATA.slice(0, cap);
  document.getElementById("equipAllBody").innerHTML = capped.map(r => {
    const icon = deptIcon(r.department);
    return `<tr>
      <td><div class="dept-cell"><span class="dept-icon ${icon.cls}"><svg viewBox="0 0 24 24">${icon.path}</svg></span>${escapeHtml(r.department)}</div></td>
      <td>${escapeHtml(r.equipment)}</td>
      <td>${escapeHtml(r.user)}</td>
      <td><span class="status-pill ${statusClass(r.status)}">${r.status}</span></td>
    </tr>`;
  }).join("");
  document.getElementById("equipAllCount").textContent = `${DATA.length} total`;
  document.getElementById("equipAllShowing").textContent = `Showing ${Math.min(cap, DATA.length)} of ${DATA.length} entries`;
}

function renderCategoriesPage() {
  document.getElementById("categoryStats").innerHTML = DEPARTMENTS.map(dept => {
    const items = DATA.filter(r => r.department === dept);
    const icon = deptIcon(dept);
    const issueCount = items.filter(i => i.status === "With Issue").length;
    return `<div class="stat-card">
      <div class="stat-icon ${icon.cls}"><svg viewBox="0 0 24 24">${icon.path}</svg></div>
      <div class="stat-body">
        <p class="stat-label">${escapeHtml(dept)}</p>
        <p class="stat-value">${items.length}</p>
        <span class="stat-sub ${issueCount ? "red-text" : "text-muted"}">${issueCount} with issues</span>
      </div>
    </div>`;
  }).join("");
}

function renderSchedulePage() {
  const year = 2026, month = 7; // August 2026
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById("calendarLabel").textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = 18;

  const activeDays = new Set();
  DATA.forEach(r => {
    if (r.date) {
      const d = new Date(r.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) activeDays.add(d.getDate());
    }
  });

  const dow = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let html = dow.map(d => `<div class="cal-dow">${d}</div>`).join("");
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const classes = ["cal-day"];
    if (day === todayDate) classes.push("today");
    else if (activeDays.has(day)) classes.push("has-due");
    html += `<div class="${classes.join(" ")}">${day}</div>`;
  }
  document.getElementById("calendarGrid").innerHTML = html;

  const dueItems = DATA.filter(r => r.status === "Due");
  const dueList = document.getElementById("dueList");
  if (!dueItems.length) {
    dueList.innerHTML = '<div class="mini-empty">Nothing due right now.</div>';
  } else {
    const shown = dueItems.slice(0, 20);
    let listHtml = shown.map(r => `
      <div class="mini-row">
        <div class="mini-row-main">
          <div class="mini-row-title">${escapeHtml(r.equipment)} — ${escapeHtml(r.department)}</div>
          <div class="mini-row-sub">Assigned to ${escapeHtml(r.user)}</div>
        </div>
        <span class="status-pill status-due">Due</span>
      </div>`).join("");
    if (dueItems.length > shown.length) {
      listHtml += `<div class="mini-empty">+ ${dueItems.length - shown.length} more equipment due for checking.</div>`;
    }
    dueList.innerHTML = listHtml;
  }
}

function renderIssuesPage() {
  document.getElementById("issuesStats").innerHTML = statCardsMarkup();
  const issues = DATA.filter(r => r.status === "With Issue");
  document.getElementById("ticketGrid").innerHTML = issues.length
    ? issues.map(r => `
      <div class="ticket-card">
        <div class="ticket-card-head">
          <div>
            <div class="ticket-equip">${escapeHtml(r.equipment)}</div>
            <div class="ticket-dept">${escapeHtml(r.department)}</div>
          </div>
          <span class="status-pill status-issue">With Issue</span>
        </div>
        <p class="ticket-notes">${escapeHtml(r.notes)}</p>
        <div class="ticket-meta">
          <span>${escapeHtml(r.user)}</span>
          <span>${r.date ? formatDate(r.date) : "\u2013"}</span>
        </div>
      </div>`).join("")
    : '<div class="mini-empty">No open tickets. Nice work.</div>';
}

function renderReportsCheckingPage() {
  document.getElementById("reportsCheckingStats").innerHTML = statCardsMarkup();
  const total = DATA.length;
  const counts = { "Good": 0, "With Issue": 0, "For Monitoring": 0, "Due": 0 };
  DATA.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  const barMap = [["Good", "good"], ["With Issue", "issue"], ["For Monitoring", "monitoring"], ["Due", "due"]];
  document.getElementById("statusBarList").innerHTML = barMap.map(([label, cls]) => {
    const count = counts[label] || 0;
    const pct = total ? ((count / total) * 100).toFixed(1) : "0.0";
    return `<div>
      <div class="bar-row-top"><span>${label}</span><span>${count} · ${pct}%</span></div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

function renderReportsDepartmentPage() {
  document.getElementById("deptSummaryBody").innerHTML = DEPARTMENTS.map(dept => {
    const items = DATA.filter(r => r.department === dept);
    const good = items.filter(r => r.status === "Good").length;
    const issue = items.filter(r => r.status === "With Issue").length;
    const monitor = items.filter(r => r.status === "For Monitoring").length;
    const due = items.filter(r => r.status === "Due").length;
    return `<tr>
      <td>${escapeHtml(dept)}</td>
      <td>${items.length}</td>
      <td>${good}</td>
      <td>${issue}</td>
      <td>${monitor}</td>
      <td>${due}</td>
    </tr>`;
  }).join("");
}

function renderUsersPage() {
  const map = new Map();
  DATA.forEach(r => {
    if (!map.has(r.user)) map.set(r.user, { department: r.department, count: 0, lastDate: null });
    const entry = map.get(r.user);
    entry.count++;
    if (r.date && (!entry.lastDate || r.date > entry.lastDate)) entry.lastDate = r.date;
  });
  const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  document.getElementById("usersCount").textContent = `${rows.length} users`;
  document.getElementById("usersBody").innerHTML = rows.map(([name, info]) => `
    <tr>
      <td>${escapeHtml(name)}</td>
      <td>${escapeHtml(info.department)}</td>
      <td>${info.count}</td>
      <td>${info.lastDate ? formatDate(info.lastDate) : "\u2013"}</td>
    </tr>`).join("");
}

const PAGE_RENDERERS = {
  "dashboard": renderDashboardPage,
  "equipment-all": renderEquipmentAllPage,
  "equipment-categories": renderCategoriesPage,
  "schedule": renderSchedulePage,
  "checking": () => render(),
  "issues": renderIssuesPage,
  "reports-checking": renderReportsCheckingPage,
  "reports-department": renderReportsDepartmentPage,
  "users": renderUsersPage,
  "settings": () => {}
};

const pageTitleEl = document.getElementById("pageTitle");

function switchPage(page) {
  if (!PAGE_TITLES[page]) return;

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("active");

  pageTitleEl.textContent = PAGE_TITLES[page];

  document.querySelectorAll(".nav-item[data-page], .sub-item[data-page]").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  document.querySelectorAll(".nav-group-toggle").forEach(t => t.classList.remove("open"));
  document.querySelectorAll(".submenu").forEach(s => s.classList.remove("open"));
  const activeSub = document.querySelector(`.sub-item[data-page="${page}"]`);
  if (activeSub) {
    const group = activeSub.closest(".nav-group");
    group.querySelector(".nav-group-toggle").classList.add("open");
    group.querySelector(".submenu").classList.add("open");
  }

  const renderer = PAGE_RENDERERS[page];
  if (renderer) renderer();

  if (window.innerWidth <= 900) {
    document.getElementById("sidebar").classList.remove("open");
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

document.querySelectorAll(".stat-link[data-page]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchPage(link.dataset.page);
  });
});

document.getElementById("navRoot").addEventListener("click", (e) => {
  const groupToggle = e.target.closest(".nav-group-toggle");
  if (groupToggle) {
    const group = groupToggle.closest(".nav-group");
    const submenu = group.querySelector(".submenu");
    const isOpen = groupToggle.classList.contains("open");

    document.querySelectorAll(".nav-group-toggle").forEach(t => t.classList.remove("open"));
    document.querySelectorAll(".submenu").forEach(s => s.classList.remove("open"));

    if (!isOpen) {
      groupToggle.classList.add("open");
      submenu.classList.add("open");
    }
    return;
  }

  const navBtn = e.target.closest("[data-page]");
  if (navBtn) {
    switchPage(navBtn.dataset.page);
  }
});

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
switchPage("checking");
