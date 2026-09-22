(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  const total = DB.students.length;
  const active = DB.students.filter((s) => s.status === "Active").length;
  const pendingVerif = DB.students.filter((s) => !s.verified).length;
  const exchanges = DB.connections.filter((c) => c.status === "Accepted").length;
  const pendingReports = DB.reports.filter((r) => r.status === "Pending" || r.status === "Under Review").length;
  const blocked = DB.students.filter((s) => s.status === "Blocked" || s.status === "Suspended").length;

  const cards = [
    ["Total Students", total, "👥", "admin-users.html"],
    ["Active Students", active, "🛡️", "admin-users.html"],
    ["Pending Verifications", pendingVerif, "✅", "admin-users.html"],
    ["Total Skill Exchanges", exchanges, "🔄", "admin-requests.html"],
    ["Pending Reports", pendingReports, "🚩", "admin-reports.html"],
    ["Blocked Users", blocked, "🚫", "admin-users.html"],
  ];

  pageContent().innerHTML = `
    ${pageHead("Admin", "Dashboard")}
    <div class="grid-3" style="margin-bottom:24px;">
      ${cards.map(([label, val, icon, href]) => `
        <a href="${href}" style="text-decoration:none;color:inherit;">
          <div class="card summary-card">
            <div style="font-size:18px;">${icon}</div>
            <div class="num">${val}</div>
            <div class="lbl">${label}</div>
          </div>
        </a>`).join("")}
    </div>
    <div class="grid-2">
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Recent registrations</div>
        ${DB.students.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 4).map((s) => `
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);">
            ${avatarHtml(s.name, s.avatarSeed, 30)}
            <div style="flex:1;font-size:13px;">${escapeHtml(s.name)}</div>
            <span style="font-size:11px;color:var(--muted);">${fmtDate(s.createdAt)}</span>
          </div>`).join("")}
      </div>
      <div class="card">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Recent reports</div>
        ${DB.reports.length ? DB.reports.slice(0, 4).map((r) => `
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);">
            <span>🚩</span>
            <div style="flex:1;font-size:13px;">${escapeHtml(r.reason)}</div>
            ${pillHtml(r.status, r.status === "Pending" ? "gold" : r.status === "Resolved" ? "pine" : "muted")}
          </div>`).join("") : `<div class="empty-state">No reports yet.</div>`}
      </div>
    </div>
  `;
})();
