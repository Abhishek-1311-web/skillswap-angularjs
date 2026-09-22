app.controller("SessionsController", function ($scope, SessionSchedulingService, BusinessRules) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  render();

  function render() {
    const myConns = SessionSchedulingService.getActiveConnections(me.id);
    const mySessions = SessionSchedulingService.getUpcomingForStudent(me.id);

    pageContent().innerHTML = `
      ${pageHead("My Connections", "My Connections & Sessions")}
      <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Active connections</div>
      <div id="connBox">${myConns.length ? myConns.map(connCard).join("") : `<div class="empty-state">No accepted connections yet — send a request from Find Students.</div>`}</div>

      <div style="font-size:13px;font-weight:700;margin:24px 0 10px;">Upcoming &amp; scheduled sessions</div>
      <div>${mySessions.length ? mySessions.map(sessionCard).join("") : `<div class="empty-state">No sessions scheduled yet.</div>`}</div>
    `;

    document.querySelectorAll(".schedule-btn").forEach((b) => b.addEventListener("click", () => openScheduleModal(b.dataset.connId)));
  }

  function connCard(c) {
    const otherId = c.student1Id === me.id ? c.student2Id : c.student1Id;
    const other = studentById(otherId);
    if (!other) return "";
    const sess = SessionSchedulingService.getSessionsForConnection(c.id);
    return `
      <div class="card" style="margin-bottom:14px;">
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
          ${avatarHtml(other.name, other.avatarSeed, 48)}
          <div style="flex:1;min-width:200px;">
            <div style="font-weight:600;font-size:15px;">${escapeHtml(other.name)}</div>
            <div style="font-size:12px;color:var(--muted);">${escapeHtml(other.department)} · ${escapeHtml(other.year)}</div>
            ${pillHtml("Accepted", "pine")}
          </div>
          <button class="btn btn-primary schedule-btn" data-conn-id="${c.id}">🗓 Schedule session</button>
        </div>
        ${sess.length ? `<div style="margin-top:12px;border-top:1px dashed var(--line);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
          ${sess.map((s) => `<div style="font-size:12.5px;display:flex;gap:14px;flex-wrap:wrap;">
            <span>⏱ ${fmtDate(s.date)} · ${escapeHtml(s.time)}</span>
            <span>📍 ${escapeHtml(s.location)}</span>
            <span>${escapeHtml(skillName(s.skill))}</span>
          </div>`).join("")}
        </div>` : ""}
      </div>`;
  }

  function sessionCard(s) {
    const conn = DB.connections.find((c) => c.id === s.connectionId);
    if (!conn) return "";
    const otherId = conn.student1Id === me.id ? conn.student2Id : conn.student1Id;
    const other = studentById(otherId);
    if (!other) return "";
    return `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
          ${avatarHtml(other.name, other.avatarSeed, 40)}
          <div style="flex:1;min-width:200px;">
            <div style="font-weight:600;font-size:14.5px;">${escapeHtml(skillName(s.skill))} with ${escapeHtml(other.name)}</div>
            <div style="font-size:12.5px;color:var(--muted);display:flex;gap:14px;margin-top:4px;flex-wrap:wrap;">
              <span>⏱ ${fmtDate(s.date)}, ${escapeHtml(s.time)}</span>
              <span>📍 ${escapeHtml(s.location)}</span>
            </div>
            ${s.notes ? `<div style="font-size:12px;color:var(--muted);margin-top:4px;font-style:italic;">${escapeHtml(s.notes)}</div>` : ""}
          </div>
          ${pillHtml(s.status, "gold")}
        </div>
      </div>`;
  }

  function openScheduleModal(connId) {
    const conn = DB.connections.find((c) => c.id === connId);
    const otherId = conn.student1Id === me.id ? conn.student2Id : conn.student1Id;
    const other = studentById(otherId);
    openModal(`Schedule a session with ${other.name}`, `
      <label class="field"><span class="label">Skill / topic</span>
        <select class="input" id="mSkill">${DB.skills.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}</select>
      </label>
      <div style="display:flex;gap:10px;">
        <label class="field" style="flex:1;"><span class="label">Date</span><input class="input" type="date" id="mDate"></label>
        <label class="field" style="flex:1;"><span class="label">Time</span><input class="input" type="time" id="mTime"></label>
      </div>
      <label class="field"><span class="label">Campus location</span><input class="input" id="mLocation" placeholder="e.g. Main Library"></label>
      <label class="field"><span class="label">Notes (optional)</span><textarea class="input" id="mNotes" style="min-height:60px;"></textarea></label>
      <div id="mErrBox"></div>
      <button class="btn btn-primary" id="mScheduleBtn">🗓 Schedule session</button>
    `);
    document.getElementById("mScheduleBtn").addEventListener("click", () => {
      const skill = document.getElementById("mSkill").value;
      const date = document.getElementById("mDate").value;
      const time = document.getElementById("mTime").value;
      const location = document.getElementById("mLocation").value.trim();
      const notes = document.getElementById("mNotes").value.trim();
      if (!time || !location) return;
      const dateCheck = BusinessRules.validateSessionDate(date);
      if (!dateCheck.valid) { document.getElementById("mErrBox").innerHTML = bannerHtml(dateCheck.reason, "error"); return; }
      SessionSchedulingService.schedule(conn, me, { skill, date, time, location, notes });
      closeModal();
      render();
    });
  }
});
