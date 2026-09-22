(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  render();

  function render() {
    pageContent().innerHTML = `
      ${pageHead("Admin", "Reports")}
      <div class="card table-wrap" style="padding:0;">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Reported user</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
    `;
    document.getElementById("rows").innerHTML = DB.reports.length ? DB.reports.map((r) => {
      const reported = studentById(r.reportedUserId), reporter = studentById(r.reporterId);
      const tone = r.status === "Pending" ? "gold" : r.status === "Resolved" ? "pine" : r.status === "Rejected" ? "muted" : "red";
      return `<tr>
        <td>${r.id}</td>
        <td>${reported ? escapeHtml(reported.name) : "(deleted)"}</td>
        <td>${reporter ? escapeHtml(reporter.name) : "(deleted)"}</td>
        <td>${escapeHtml(r.reason)}</td>
        <td>${pillHtml(r.status, tone)}</td>
        <td>${fmtDate(r.createdAt)}</td>
        <td><button class="btn btn-ghost btn-sm review-btn" data-id="${r.id}">Review</button></td>
      </tr>`;
    }).join("") : `<tr><td colspan="7"><div class="empty-state">No reports yet.</div></td></tr>`;

    document.querySelectorAll(".review-btn").forEach((b) => b.addEventListener("click", () => openReview(b.dataset.id)));
  }

  function openReview(reportId) {
    const r = DB.reports.find((x) => x.id === reportId);
    const reported = studentById(r.reportedUserId);
    openModal(`Report ${r.id}`, `
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px;">REPORTED USER</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:12px;">${reported ? escapeHtml(reported.name) : "(deleted)"}</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px;">REASON</div>
      <div style="font-size:14px;margin-bottom:12px;">${escapeHtml(r.reason)}</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px;">DESCRIPTION</div>
      <div style="font-size:13.5px;margin-bottom:16px;line-height:1.5;">${escapeHtml(r.description)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-gold" data-a="warn">Warn user</button>
        <button class="btn btn-danger" data-a="block">Block user</button>
        <button class="btn btn-danger" data-a="suspend">Suspend user</button>
        <button class="btn btn-danger" data-a="delete">Delete profile</button>
        <button class="btn btn-primary" data-a="resolve">Mark resolved</button>
        <button class="btn btn-ghost" data-a="dismiss">Reject report</button>
      </div>
    `);
    document.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      adminReportAction(r.id, b.dataset.a);
      closeModal();
      render();
    }));
  }
})();
