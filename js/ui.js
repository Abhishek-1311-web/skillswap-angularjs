/* ============================================================
   SkillSwap — shared UI layer (sidebar, topbar, auth guards, widgets)
   ============================================================ */

const STUDENT_NAV = [
  ["dashboard.html", "Dashboard", "🏠"],
  ["profile.html", "My Profile", "🧑"],
  ["post-skill.html", "My Skills", "📚"],
  ["explore.html", "Find Students", "🔍"],
  ["requests.html", "Requests", "📥"],
  ["sessions.html", "My Connections & Sessions", "🗓️"],
  ["feedback.html", "Report / Support", "🚩"],
];

const ADMIN_NAV = [
  ["admin-dashboard.html", "Dashboard", "🏠"],
  ["admin-users.html", "Students", "👥"],
  ["admin-skills.html", "Skill Categories", "🏷️"],
  ["admin-requests.html", "Skill Exchanges", "🔄"],
  ["admin-reports.html", "Reports", "🚩"],
  ["admin-settings.html", "Settings", "⚙️"],
];

function currentFile() {
  const p = window.location.pathname.split("/");
  return p[p.length - 1] || "index.html";
}

/* ---------------- avatar / pill helpers ---------------- */
function avatarHtml(name, seed, size) {
  size = size || 44;
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;background:${avatarColor(seed || name)}">${escapeHtml(initials(name))}</span>`;
}
function pillHtml(text, tone) {
  return `<span class="pill pill-${tone || "pine"}">${escapeHtml(text)}</span>`;
}
function statusPillTone(status) {
  if (status === "Active") return "pine";
  if (status === "Pending Verification") return "gold";
  return "red";
}

/* ---------------- ID-card builder ---------------- */
function studentCardHtml(student, opts) {
  opts = opts || {};
  const match = opts.match;
  let stamp = "";
  if (match && match.type !== "none") {
    stamp = `<div class="match-stamp ${match.type === "good" ? "good" : ""}">${match.type === "great" ? "GREAT\nMATCH" : "GOOD\nMATCH"}</div>`;
  }
  const teachPills = student.teach.length ? student.teach.map((id) => pillHtml(skillName(id), "pine")).join(" ") : `<span style="font-size:12px;color:var(--muted)">—</span>`;
  const learnPills = student.learn.length ? student.learn.map((id) => pillHtml(skillName(id), "gold")).join(" ") : `<span style="font-size:12px;color:var(--muted)">—</span>`;
  let actions = "";
  if (opts.viewHref || opts.requestHref) {
    actions = `<div class="card-actions">`;
    if (opts.viewHref) actions += `<a class="btn btn-ghost" href="${opts.viewHref}">View profile</a>`;
    if (opts.requestHref) actions += `<a class="btn btn-primary" href="${opts.requestHref}">↔ Send request</a>`;
    actions += `</div>`;
  }
  return `
  <div class="id-card">
    <div class="notch"></div>
    <div class="stripe"></div>
    <div class="body">
      <div class="head">
        ${avatarHtml(student.name, student.avatarSeed, 52)}
        <div class="who">
          <div class="n">${escapeHtml(student.name)}</div>
          <div class="d">${escapeHtml(student.department)} · ${escapeHtml(student.year)}</div>
          <div class="d" style="font-family:'IBM Plex Mono',monospace;color:var(--pine);font-weight:600;">ID: ${escapeHtml(student.code || "——————")}</div>
        </div>
        ${stamp}
      </div>
      <hr class="dash" />
      <div class="skill-block">
        <div class="lbl">CAN TEACH</div>
        <div class="skill-list">${teachPills}</div>
        <div class="lbl">WANTS TO LEARN</div>
        <div class="skill-list" style="margin-bottom:0">${learnPills}</div>
      </div>
      ${actions}
    </div>
  </div>`;
}

/* ---------------- layout: sidebar + topbar ---------------- */
function renderShell(role, me) {
  const nav = role === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const file = currentFile();
  const unread = role === "student" && me ? DB.notifications.filter((n) => n.userId === me.id && !n.read).length : 0;

  const navHtml = nav.map(([href, label, icon]) => {
    const active = href === file ? "active" : "";
    let badge = "";
    if (href === "requests.html" && role === "student" && me) {
      const pendingCount = DB.requests.filter((r) => r.receiverId === me.id && r.status === "Pending").length;
      if (pendingCount) badge = `<span class="nav-badge">${pendingCount}</span>`;
    }
    return `<a href="${href}" class="${active}">${icon} ${label} ${badge}</a>`;
  }).join("");

  const userBlock = me ? `
    <div class="sidebar-user">
      ${avatarHtml(me.name, me.avatarSeed, 36)}
      <div>
        <div class="name">${escapeHtml(me.name)}</div>
        <div class="role">${role === "admin" ? "Administrator" : "Student"}</div>
      </div>
    </div>` : (role === "admin" ? `
    <div class="sidebar-user">
      <div>
        <div class="name">Admin</div>
        <div class="role">Administrator</div>
      </div>
    </div>` : "");

  const shellHtml = `
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">🎓 SkillSwap</div>
      ${userBlock}
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot"><button id="logoutBtn">↩ Log out</button></div>
    </aside>
    <div class="main-col">
      <div class="mobile-topbar">
        <button id="menuBtn">☰</button>
        <div style="font-family:'Source Serif 4',serif;font-size:16px;font-weight:600;">🎓 SkillSwap</div>
        ${role === "student" && unread ? `<span class="pill pill-gold" style="margin-left:auto">${unread} new</span>` : ""}
      </div>
      <main class="content" id="pageContent"></main>
    </div>`;

  document.getElementById("app-shell").innerHTML = shellHtml;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearSession();
    window.location.href = role === "admin" ? "admin-login.html" : "index.html";
  });
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => { sidebar.classList.add("open"); overlay.classList.add("open"); });
    overlay.addEventListener("click", () => { sidebar.classList.remove("open"); overlay.classList.remove("open"); });
  }
}

function pageContent() { return document.getElementById("pageContent"); }

function pageHead(eyebrow, title, actionHtml) {
  return `<div class="page-head">
    <div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1 class="page-title">${escapeHtml(title)}</h1></div>
    ${actionHtml || ""}
  </div>`;
}

/* ---------------- auth guards ---------------- */
function requireStudent() {
  refreshDB();
  const session = getSession();
  if (!session || session.role !== "student") { window.location.href = "login.html"; return null; }
  const me = studentById(session.id);
  if (!me) { clearSession(); window.location.href = "login.html"; return null; }
  return me;
}

function requireAdmin() {
  refreshDB();
  const session = getSession();
  if (!session || session.role !== "admin") { window.location.href = "admin-login.html"; return false; }
  return true;
}

function renderBlockedIfNeeded(me) {
  if (me.status === "Blocked" || me.status === "Suspended") {
    pageContent().innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
        <div class="card blocked-box">
          <div style="font-size:30px;margin-bottom:8px;">🔒</div>
          <h2 style="font-size:20px;margin-bottom:8px;">Account ${escapeHtml(me.status)}</h2>
          <p style="color:var(--muted);font-size:13.5px;line-height:1.6;">
            Your account has been ${me.status.toLowerCase()} by an administrator. You can't send or receive requests,
            or use the rest of the platform, while this is in effect. Contact support if you think this is a mistake.
          </p>
        </div>
      </div>`;
    return true;
  }
  return false;
}

/* ---------------- modal helper ---------------- */
function openModal(title, bodyHtml) {
  let overlay = document.getElementById("sharedModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sharedModal";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-head"><h3>${escapeHtml(title)}</h3><button id="modalCloseBtn">✕</button></div>
      <div class="modal-body">${bodyHtml}</div>
    </div>`;
  overlay.classList.add("open");
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
}
function closeModal() {
  const overlay = document.getElementById("sharedModal");
  if (overlay) overlay.classList.remove("open");
}

/* ---------------- toast/banner ---------------- */
function bannerHtml(text, kind) {
  return `<div class="banner banner-${kind || "success"}">${escapeHtml(text)}</div>`;
}

/* ---------------- query params ---------------- */
function qparam(name) { return new URLSearchParams(window.location.search).get(name); }
