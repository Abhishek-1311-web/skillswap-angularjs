(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  pageContent().innerHTML = `
    ${pageHead("Admin", "Skill Exchanges")}

    <div style="font-size:13px;font-weight:700;margin-bottom:10px;">All exchange requests</div>
    <div class="card table-wrap" style="padding:0;margin-bottom:24px;">
      <table class="data-table">
        <thead><tr><th>Sender</th><th>Receiver</th><th>Offers</th><th>Wants</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          ${DB.requests.length ? DB.requests.map((r) => {
            const from = studentById(r.senderId), to = studentById(r.receiverId);
            if (!from || !to) return "";
            return `<tr>
              <td>${escapeHtml(from.name)}</td>
              <td>${escapeHtml(to.name)}</td>
              <td>${escapeHtml(skillName(r.teachSkill))}</td>
              <td>${escapeHtml(skillName(r.learnSkill))}</td>
              <td>${pillHtml(r.status, r.status === "Pending" ? "gold" : r.status === "Accepted" ? "pine" : "red")}</td>
              <td>${fmtDate(r.createdAt)}</td>
            </tr>`;
          }).join("") : `<tr><td colspan="6"><div class="empty-state">No requests yet.</div></td></tr>`}
        </tbody>
      </table>
    </div>

    <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Active connections</div>
    <div class="card table-wrap" style="padding:0;margin-bottom:24px;">
      <table class="data-table">
        <thead><tr><th>Student A</th><th>Student B</th><th>Status</th><th>Sessions</th></tr></thead>
        <tbody>
          ${DB.connections.length ? DB.connections.map((c) => {
            const a = studentById(c.student1Id), b = studentById(c.student2Id);
            if (!a || !b) return "";
            return `<tr>
              <td>${escapeHtml(a.name)}</td>
              <td>${escapeHtml(b.name)}</td>
              <td>${pillHtml(c.status, "pine")}</td>
              <td>${DB.sessions.filter((s) => s.connectionId === c.id).length}</td>
            </tr>`;
          }).join("") : `<tr><td colspan="4"><div class="empty-state">No connections yet.</div></td></tr>`}
        </tbody>
      </table>
    </div>

    <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Scheduled sessions</div>
    <div class="card table-wrap" style="padding:0;">
      <table class="data-table">
        <thead><tr><th>Skill</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th></tr></thead>
        <tbody>
          ${DB.sessions.length ? DB.sessions.map((s) => `<tr>
              <td>${escapeHtml(skillName(s.skill))}</td>
              <td>${fmtDate(s.date)}</td>
              <td>${escapeHtml(s.time)}</td>
              <td>${escapeHtml(s.location)}</td>
              <td>${pillHtml(s.status, "gold")}</td>
            </tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">No sessions yet.</div></td></tr>`}
        </tbody>
      </table>
    </div>
  `;
})();
