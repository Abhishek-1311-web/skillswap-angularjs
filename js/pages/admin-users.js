(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  const state = { q: "", tab: "all" };

  render();

  function render() {
    const tabs = [
      ["all", "All students"],
      ["pending", "Pending verification"],
      ["blocked", "Blocked / suspended"],
    ];

    pageContent().innerHTML = `
      ${pageHead("Admin", "Students")}
      <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
        <input class="input" id="qBox" style="width:280px;" placeholder="Search by name, email, or Student ID…">
        <div style="display:flex;gap:6px;">
          ${tabs.map(([key, label]) => `<button class="btn ${state.tab === key ? "btn-primary" : "btn-ghost"} btn-sm" data-tab="${key}">${label}</button>`).join("")}
        </div>
      </div>
      <div class="card table-wrap" style="padding:0;">
        <table class="data-table">
          <thead><tr>
            <th>Student</th><th>Student ID</th><th>Department</th><th>Year</th><th>Skills</th><th>Status</th><th>Registered</th><th>Actions</th>
          </tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
    `;

    document.getElementById("qBox").value = state.q;
    document.getElementById("qBox").addEventListener("input", (e) => { state.q = e.target.value; renderRows(); });
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { state.tab = b.dataset.tab; render(); }));

    renderRows();
  }

  function renderRows() {
    const q = state.q.trim().toLowerCase();
    let rows = DB.students.filter((s) =>
      !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.code || "").toLowerCase().includes(q)
    );
    if (state.tab === "pending") rows = rows.filter((s) => !s.verified);
    if (state.tab === "blocked") rows = rows.filter((s) => s.status === "Blocked" || s.status === "Suspended");

    document.getElementById("rows").innerHTML = rows.length ? rows.map((s) => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:8px;">${avatarHtml(s.name, s.avatarSeed, 28)}<div><div style="font-weight:600;">${escapeHtml(s.name)}</div><div style="font-size:11px;color:var(--muted);">${escapeHtml(s.email)}</div></div></div></td>
        <td style="font-family:'IBM Plex Mono',monospace;color:var(--pine);font-weight:600;">${escapeHtml(s.code || "——————")}</td>
        <td>${escapeHtml(s.department)}</td>
        <td>${escapeHtml(s.year)}</td>
        <td>${s.teach.length + s.learn.length}</td>
        <td>${pillHtml(s.verified ? s.status : "Pending Verification", s.verified ? statusPillTone(s.status) : "gold")}</td>
        <td>${fmtDate(s.createdAt)}</td>
        <td>
          <div class="row-actions">
            ${!s.verified ? `<button class="btn btn-primary btn-sm act-btn" data-id="${s.id}" data-action="verify">Verify</button>` : ""}
            ${s.status !== "Blocked" ? `<button class="btn btn-danger btn-sm act-btn" data-id="${s.id}" data-action="block">Block</button>` : `<button class="btn btn-ghost btn-sm act-btn" data-id="${s.id}" data-action="unblock">Unblock</button>`}
            ${s.status !== "Suspended" ? `<button class="btn btn-ghost btn-sm act-btn" data-id="${s.id}" data-action="suspend">Suspend</button>` : `<button class="btn btn-ghost btn-sm act-btn" data-id="${s.id}" data-action="unblock">Unsuspend</button>`}
            <button class="btn btn-danger btn-sm del-btn" data-id="${s.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="8"><div class="empty-state">No students match.</div></td></tr>`;

    document.querySelectorAll(".act-btn").forEach((b) => b.addEventListener("click", () => { adminStudentAction(b.dataset.id, b.dataset.action); render(); }));
    document.querySelectorAll(".del-btn").forEach((b) => b.addEventListener("click", () => {
      const s = studentById(b.dataset.id);
      openModal("Delete profile?", `
        <p style="font-size:13.5px;">This will permanently remove <b>${escapeHtml(s.name)}</b>'s profile. This can't be undone.</p>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-danger" id="confirmDelBtn">Delete profile</button>
          <button class="btn btn-ghost" id="cancelDelBtn">Cancel</button>
        </div>
      `);
      document.getElementById("confirmDelBtn").addEventListener("click", () => { adminStudentAction(s.id, "delete"); closeModal(); render(); });
      document.getElementById("cancelDelBtn").addEventListener("click", closeModal);
    }));
  }
})();
