/* ==========================================================
   IT Monitoring System — Dashboard
   Vanilla JS: renders stat cards, donut charts, alerts,
   and an equipment table with search + pagination.
   ========================================================== */

const STATE = {
  totalEquipment: 48,
  statusCounts: { online: 36, warning: 7, offline: 5 },
  typeCounts: [
    { label: "Printers",   value: 18, color: "#6e1420" },
    { label: "Computers",  value: 12, color: "#8b1a28" },
    { label: "Networking", value: 8,  color: "#a83a44" },
    { label: "UPS",        value: 6,  color: "#c9707a" },
    { label: "Others",     value: 4,  color: "#e2b6bb" }
  ],
  alerts: [
    { title: "Printer - Front Office", sub: "Offline • Last seen 2 hours ago", time: "10:15 AM", level: "offline" },
    { title: "UPS - Server Room",      sub: "Battery low • 20% remaining",     time: "09:58 AM", level: "warning" },
    { title: "Photocopier - Admin",    sub: "Low toner • Replace soon",        time: "09:30 AM", level: "warning" },
    { title: "Switch - 2nd Floor",     sub: "Back online",                    time: "09:10 AM", level: "online" }
  ],
  equipment: [
    { name: "Printer - Front Office", model: "HP LaserJet Pro M404",   type: "Printer",     icon: "🖨", location: "Front Office",    status: "offline", lastCheck: "2 hours ago" },
    { name: "Server - Main",          model: "Dell PowerEdge R740",    type: "Server",       icon: "🖥", location: "Server Room",     status: "online",  lastCheck: "1 minute ago" },
    { name: "Switch - 2nd Floor",     model: "Cisco Catalyst 2960",    type: "Networking",   icon: "🔀", location: "2nd Floor IT Room",status: "online",  lastCheck: "1 minute ago" },
    { name: "UPS - Server Room",      model: "APC Smart-UPS 1500",     type: "UPS",          icon: "🔋", location: "Server Room",     status: "warning", lastCheck: "5 minutes ago" },
    { name: "Photocopier - Admin",    model: "Canon imageRUNNER 2525", type: "Photocopier",  icon: "🖨", location: "Admin Office",    status: "warning", lastCheck: "15 minutes ago" }
  ],
  totalEntries: 48,
  currentPage: 1,
  totalPages: 10
};

/* ---------- Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const pct = (n, total) => Math.round((n / total) * 100);

/* ---------- Date / time header ---------- */
function renderDate() {
  const now = new Date(2025, 4, 26, 10, 30); // matches mock: May 26, 2025, Monday 10:30 AM
  const dateFmt = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const dayFmt = now.toLocaleDateString("en-US", { weekday: "long" });
  const timeFmt = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  $("#dateMain").textContent = dateFmt;
  $("#dateSub").textContent = `${dayFmt}, ${timeFmt}`;
}

/* ---------- Stat cards ---------- */
function renderStatCards() {
  const { totalEquipment, statusCounts } = STATE;
  const cards = [
    {
      icon: "🖥", iconClass: "maroon",
      label: "Total Equipment", value: totalEquipment,
      foot: "All Locations", mini: "▤"
    },
    {
      icon: "✓", iconClass: "green",
      label: "Online", value: statusCounts.online,
      foot: `${pct(statusCounts.online, totalEquipment)}%`, mini: "📈"
    },
    {
      icon: "⚠", iconClass: "amber",
      label: "Warning", value: statusCounts.warning,
      foot: `${pct(statusCounts.warning, totalEquipment)}%`, mini: "📊"
    },
    {
      icon: "✕", iconClass: "red",
      label: "Offline", value: statusCounts.offline,
      foot: `${pct(statusCounts.offline, totalEquipment)}%`, mini: "◔"
    }
  ];

  $("#statGrid").innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon ${c.iconClass}">${c.icon}</div>
        <div class="stat-mini">${c.mini}</div>
      </div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-foot">${c.foot}</div>
    </div>
  `).join("");
}

/* ---------- Donut chart (SVG) ---------- */
function buildDonut(svgEl, segments, size = 200, thickness = 26) {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  let html = `<g transform="rotate(-90 ${cx} ${cy})">`;
  segments.forEach(seg => {
    const fraction = seg.value / total;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    html += `<circle cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="${seg.color}" stroke-width="${thickness}"
      stroke-dasharray="${dash} ${gap}"
      stroke-dashoffset="${-offset}"
      stroke-linecap="butt" />`;
    offset += dash;
  });
  html += `</g>`;
  svgEl.innerHTML = html;
}

function renderStatusDonut() {
  const { statusCounts, totalEquipment } = STATE;
  const segments = [
    { label: "Online",  value: statusCounts.online,  color: "#22b06b" },
    { label: "Warning", value: statusCounts.warning, color: "#f5a623" },
    { label: "Offline", value: statusCounts.offline, color: "#e0403f" }
  ];
  buildDonut($("#statusDonut"), segments);

  $("#statusLegend").innerHTML = segments.map(s => `
    <li>
      <span class="dot" style="background:${s.color}"></span>
      <span class="legend-label">${s.label}<span class="legend-sub">${s.value} (${pct(s.value, totalEquipment)}%)</span></span>
    </li>
  `).join("");
}

function renderTypeDonut() {
  const segments = STATE.typeCounts;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  buildDonut($("#typeDonut"), segments);

  $("#typeLegend").innerHTML = segments.map(s => `
    <li>
      <span class="dot" style="background:${s.color}"></span>
      <span class="legend-label">${s.label}</span>
      <span class="legend-value">${s.value} (${pct(s.value, total)}%)</span>
    </li>
  `).join("");
}

/* ---------- Alerts ---------- */
const ALERT_ICONS = { offline: "✕", warning: "⚠", online: "✓" };

function renderAlerts() {
  $("#alertList").innerHTML = STATE.alerts.map(a => `
    <li class="alert-item">
      <div class="alert-ico ${a.level}">${ALERT_ICONS[a.level]}</div>
      <div class="alert-main-row">
        <div class="alert-body">
          <div class="alert-title">${a.title}</div>
          <div class="alert-sub">${a.sub}</div>
        </div>
        <div class="alert-time">${a.time}</div>
      </div>
    </li>
  `).join("");

  $("#alertCount").textContent = STATE.alerts.filter(a => a.level !== "online").length;
}

/* ---------- Equipment table ---------- */
function renderTable(filterText = "") {
  const q = filterText.trim().toLowerCase();
  const rows = STATE.equipment.filter(e =>
    !q || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
  );

  $("#equipmentBody").innerHTML = rows.map(e => `
    <tr>
      <td>
        <div class="eq-name-cell">
          <div class="eq-ico">${e.icon}</div>
          <div>
            <div class="eq-name">${e.name}</div>
            <div class="eq-model">${e.model}</div>
          </div>
        </div>
      </td>
      <td>${e.type}</td>
      <td>${e.location}</td>
      <td><span class="status-pill ${e.status}"><span class="dot"></span>${capitalize(e.status)}</span></td>
      <td>${e.lastCheck}</td>
      <td>
        <div class="action-cell">
          <span title="View">👁</span>
          <span title="Edit">✎</span>
          <span title="More">⋮</span>
        </div>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--text-sub);padding:24px;">No equipment matches your search.</td></tr>`;

  $("#entriesLabel").textContent = q
    ? `Showing ${rows.length} of ${STATE.equipment.length} entries (filtered)`
    : `Showing 1 to ${STATE.equipment.length} of ${STATE.totalEntries} entries`;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------- Pagination ---------- */
function renderPagination() {
  const { currentPage, totalPages } = STATE;
  const pages = [];
  pages.push(1);
  if (currentPage > 3) pages.push("...");
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
    if (!pages.includes(p)) pages.push(p);
  }
  if (currentPage < totalPages - 2) pages.push("...");
  if (!pages.includes(totalPages)) pages.push(totalPages);

  let html = `<button class="page-btn ${currentPage === 1 ? "disabled" : ""}" data-nav="prev">&lsaquo;</button>`;
  pages.forEach(p => {
    if (p === "...") {
      html += `<span class="page-btn ellipsis">…</span>`;
    } else {
      html += `<button class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
    }
  });
  html += `<button class="page-btn ${currentPage === totalPages ? "disabled" : ""}" data-nav="next">&rsaquo;</button>`;

  $("#pagination").innerHTML = html;
}

function bindPagination() {
  $("#pagination").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.classList.contains("disabled")) return;

    if (btn.dataset.nav === "prev" && STATE.currentPage > 1) STATE.currentPage--;
    else if (btn.dataset.nav === "next" && STATE.currentPage < STATE.totalPages) STATE.currentPage++;
    else if (btn.dataset.page) STATE.currentPage = parseInt(btn.dataset.page, 10);

    renderPagination();
    // Note: this demo only ships page 1's data; page changes update the
    // pager UI. Wire renderTable() to real paged data when you add an API.
  });
}

/* ---------- Search ---------- */
function bindSearch() {
  $("#searchInput").addEventListener("input", (e) => {
    renderTable(e.target.value);
  });
}

/* ---------- Sidebar nav (simple active-state toggle) ---------- */
function bindNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
}

/* ---------- Misc buttons ---------- */
function bindMisc() {
  $("#addEquipmentBtn").addEventListener("click", () => {
    alert("Add Equipment: hook this button up to your create-equipment flow.");
  });
  $("#bellBtn").addEventListener("click", () => {
    document.querySelector('.nav-item[data-page="Alerts"]').click();
  });
}

/* ---------- Firebase connection check ----------
   firebase-config.js loads first and dispatches this event once
   initializeApp()/getDatabase() have run. This is just a visibility
   hook for now — the dashboard below still renders from STATE.
   Swap that out once you decide what should read from window.firebaseDb. */
window.addEventListener("firebase-ready", () => {
  console.log("[firebase] connected:", window.firebaseDb.app.options.projectId);
});

/* ---------- Init ---------- */
function init() {
  renderDate();
  renderStatCards();
  renderStatusDonut();
  renderTypeDonut();
  renderAlerts();
  renderTable();
  renderPagination();
  bindPagination();
  bindSearch();
  bindNav();
  bindMisc();
}

document.addEventListener("DOMContentLoaded", init);
