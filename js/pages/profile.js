app.controller("ProfileController", function ($scope, MatchingService, BusinessRules) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  const viewId = qparam("id");
  if (viewId && viewId !== me.id) {
    renderPublicProfile(viewId);
  } else {
    renderOwnProfile();
  }

  function renderPublicProfile(id) {
    const s = studentById(id);
    if (!s) { pageContent().innerHTML = `${pageHead("Student Profile", "Not found")}<div class="empty-state">This student could not be found.</div>`; return; }
    const m = MatchingService.evaluate(me, s);
    const badge = BusinessRules.getTrustBadge(s);
    pageContent().innerHTML = `
      ${pageHead("Student Profile", s.name, `<a class="btn btn-ghost" href="explore.html">← Back to Find Students</a>`)}
      <div style="max-width:420px;">
        ${studentCardHtml(s, { match: m })}
        <div style="margin-top:14px;">
          <div class="card">
            <div style="margin-bottom:10px;">${pillHtml(badge.label, badge.tone)}</div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;">BIO</div>
            <div style="font-size:13.5px;line-height:1.5;margin-bottom:10px;">${escapeHtml(s.bio)}</div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;">AVAILABILITY</div>
            <div style="font-size:13.5px;">${escapeHtml(s.availability)}</div>
          </div>
        </div>
        ${s.teach.length ? `<a class="btn btn-primary btn-block" style="margin-top:14px;" href="request-exchange.html?to=${s.id}">↔ Send exchange request</a>` : ""}
      </div>`;
  }

  function renderOwnProfile(editMode) {
    const myBadge = BusinessRules.getTrustBadge(me);
    pageContent().innerHTML = `
      ${pageHead("Student Profile", "My Profile", !editMode ? `<button class="btn btn-ghost" id="editBtn">✎ Edit</button>` : "")}
      <div class="card" style="max-width:640px;">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
          ${avatarHtml(me.name, me.avatarSeed, 64)}
          <div>
            <div style="font-family:'Source Serif 4',serif;font-size:21px;font-weight:600;">${escapeHtml(me.name)}</div>
            <div style="font-size:13px;color:var(--muted);">${escapeHtml(me.email)}</div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--pine);font-weight:600;margin-top:2px;">Student ID: ${escapeHtml(me.code || "——————")}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
              ${me.verified ? pillHtml("Verified", "pine") : pillHtml("Pending Verification", "gold")}
              ${pillHtml(myBadge.label, myBadge.tone)}
            </div>
          </div>
        </div>
        <div id="profileFields"></div>
        <div style="border-top:1px dashed var(--line);padding-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:6px;">CAN TEACH</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">${me.teach.map((id) => pillHtml(skillName(id), "pine")).join(" ") || "—"}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:6px;">WANTS TO LEARN</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">${me.learn.map((id) => pillHtml(skillName(id), "gold")).join(" ") || "—"}</div>
          </div>
        </div>
      </div>`;

    const fieldsBox = document.getElementById("profileFields");
    if (editMode) {
      fieldsBox.innerHTML = `
        <div style="display:flex;gap:10px;">
          <label class="field" style="flex:1;"><span class="label">Department</span><input class="input" id="fDept" value="${escapeHtml(me.department)}"></label>
          <label class="field" style="flex:1;"><span class="label">Year</span>
            <select class="input" id="fYear">${["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => `<option ${y === me.year ? "selected" : ""}>${y}</option>`).join("")}</select>
          </label>
        </div>
        <label class="field"><span class="label">Bio</span><textarea class="input" id="fBio" style="min-height:70px;">${escapeHtml(me.bio)}</textarea></label>
        <label class="field"><span class="label">Availability</span><input class="input" id="fAvail" value="${escapeHtml(me.availability)}"></label>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <button class="btn btn-primary" id="saveBtn">Save changes</button>
          <button class="btn btn-ghost" id="cancelBtn">Cancel</button>
        </div>`;
      document.getElementById("saveBtn").addEventListener("click", () => {
        updateStudent(me.id, {
          department: document.getElementById("fDept").value.trim(),
          year: document.getElementById("fYear").value,
          bio: document.getElementById("fBio").value.trim(),
          availability: document.getElementById("fAvail").value.trim(),
        });
        refreshDB();
        window.location.reload();
      });
      document.getElementById("cancelBtn").addEventListener("click", () => renderOwnProfile(false));
    } else {
      fieldsBox.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div><div style="font-size:11px;color:var(--muted);font-weight:700;">DEPARTMENT</div><div style="font-size:14px;">${escapeHtml(me.department)}</div></div>
          <div><div style="font-size:11px;color:var(--muted);font-weight:700;">YEAR</div><div style="font-size:14px;">${escapeHtml(me.year)}</div></div>
          <div><div style="font-size:11px;color:var(--muted);font-weight:700;">AVAILABILITY</div><div style="font-size:14px;">${escapeHtml(me.availability)}</div></div>
          <div><div style="font-size:11px;color:var(--muted);font-weight:700;">EXCHANGES</div><div style="font-size:14px;">${me.exchanges}</div></div>
        </div>
        <div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px;">BIO</div>
        <div style="font-size:14px;line-height:1.5;margin-bottom:14px;">${escapeHtml(me.bio)}</div>`;
      const editBtn = document.getElementById("editBtn");
      if (editBtn) editBtn.addEventListener("click", () => renderOwnProfile(true));
    }
  }
});
