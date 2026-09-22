app.controller("DashboardController", function ($scope, SessionSchedulingService, NotificationService, MatchingService, BusinessRules) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  const myRequests = DB.requests.filter((r) => r.receiverId === me.id && r.status === "Pending");
  const myConnections = SessionSchedulingService.getActiveConnections(me.id);
  const myNotifs = NotificationService.getForUser(me.id);

  const suggested = MatchingService.suggestFor(me, DB.students, 3);
  const badge = BusinessRules.getTrustBadge(me);
  $scope.suggested = suggested;
  $scope.badge = badge;

  const teachPills = me.teach.length ? me.teach.map((id) => pillHtml(skillName(id), "pine")).join(" ") : `<span style="font-size:12px;color:var(--muted)">—</span>`;
  const learnPills = me.learn.length ? me.learn.map((id) => pillHtml(skillName(id), "gold")).join(" ") : `<span style="font-size:12px;color:var(--muted)">—</span>`;

  const tiles = [
    ["Pending requests", myRequests.length, "📥"],
    ["Connections", myConnections.length, "👥"],
    ["Notifications", myNotifs.filter((n) => !n.read).length, "🔔"],
    ["Teaching", me.teach.length, "📚"],
  ].map(([label, val, icon]) => `
    <div class="stat-tile">
      <div>${icon}</div>
      <div class="num">${val}</div>
      <div class="lbl">${label}</div>
    </div>`).join("");

  pageContent().innerHTML = `
    ${pageHead("Dashboard", "Welcome back, " + me.name.split(" ")[0])}
    <div class="grid-2" style="margin-bottom:18px;">
      <div class="card">
        <div style="display:flex;gap:14px;align-items:center;">
          ${avatarHtml(me.name, me.avatarSeed, 58)}
          <div>
            <div style="font-family:'Source Serif 4',serif;font-size:19px;font-weight:600;">${escapeHtml(me.name)}</div>
            <div style="font-size:12.5px;color:var(--muted);">${escapeHtml(me.department)} · ${escapeHtml(me.year)}</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
              ${me.verified ? pillHtml("Verified", "pine") : pillHtml("Pending Verification", "gold")}
              ${pillHtml(badge.label, badge.tone)}
            </div>
          </div>
          <div style="margin-left:auto;text-align:center;">
            <div style="font-family:'Source Serif 4',serif;font-size:26px;color:var(--pine);font-weight:700;">${me.exchanges}</div>
            <div style="font-size:10.5px;color:var(--muted);font-weight:600;">EXCHANGES</div>
          </div>
        </div>
        <hr class="dash">
        <div style="font-size:13.5px;line-height:1.5;">${escapeHtml(me.bio)}</div>
      </div>
      <div class="card">
        <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:10px;">AT A GLANCE</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${tiles}</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:18px;">
      <div class="card">
        <div style="font-size:11.5px;font-weight:700;color:var(--muted);margin-bottom:8px;">SKILLS I CAN TEACH</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${teachPills}</div>
      </div>
      <div class="card">
        <div style="font-size:11.5px;font-weight:700;color:var(--muted);margin-bottom:8px;">SKILLS I WANT TO LEARN</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${learnPills}</div>
      </div>
    </div>

    <div class="page-head"><h1 class="page-title" style="font-size:20px;">Suggested for you</h1><a class="btn btn-text" href="explore.html">See all →</a></div>
    <div class="grid-3" style="margin-bottom:28px;">
      ${suggested.length ? suggested.map(({ s, m }) => studentCardHtml(s, { match: m, viewHref: "profile.html?id=" + s.id })).join("") : `<div class="empty-state">No suggestions yet — add more skills to get matched.</div>`}
    </div>

    <div class="page-head"><h1 class="page-title" style="font-size:20px;">Recent notifications</h1></div>
    <div id="notifBox">
      ${myNotifs.slice(0, 4).length ? myNotifs.slice(0, 4).map((n) => `
        <div class="card" style="margin-bottom:10px;opacity:${n.read ? "0.6" : "1"};cursor:pointer;" data-notif-id="${n.id}">
          <div style="display:flex;gap:10px;align-items:center;">
            <span>${n.read ? "🔔" : "🔴"}</span>
            <div style="flex:1;font-size:13.5px;">${escapeHtml(n.text)}</div>
            <div style="font-size:11px;color:var(--muted);">${fmtDate(n.createdAt)}</div>
          </div>
        </div>`).join("") : `<div class="empty-state">You're all caught up.</div>`}
    </div>
  `;

  document.querySelectorAll("[data-notif-id]").forEach((el) => el.addEventListener("click", () => {
    NotificationService.markRead(el.dataset.notifId);
    window.location.reload();
  }));
});
