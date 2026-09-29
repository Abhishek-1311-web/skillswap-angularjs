
/* ============================================================
   SkillSwap — data layer (MongoDB API + localStorage fallback)
   ============================================================ */

const DB_KEY = "skillswap_db_v1";
const SESSION_KEY = "skillswap_session_v1";

const CATEGORY_SEED = ["Programming", "Web Development", "Design", "Photography", "Video Editing", "Communication", "Languages", "Music", "Sports", "Academics", "Other"];

const SKILL_SEED = [
  ["Java", "Programming"], ["Python", "Programming"], ["JavaScript", "Programming"],
  ["React", "Web Development"], ["Photoshop", "Design"], ["UI/UX Design", "Design"],
  ["Illustrator", "Design"], ["Figma", "Design"], ["Video Editing", "Video Editing"],
  ["Photography", "Photography"], ["Public Speaking", "Communication"], ["Spanish", "Languages"],
  ["Guitar", "Music"], ["Football", "Sports"], ["Calculus", "Academics"], ["Excel", "Other"],
];

function seedData() {
  const categories = CATEGORY_SEED.map((name, i) => ({ id: "c" + i, name }));
  const catId = (name) => categories.find((c) => c.name === name).id;
  const skills = SKILL_SEED.map(([name, cat], i) => ({ id: "s" + i, name, categoryId: catId(cat) }));
  const sid = (name) => skills.find((s) => s.name === name).id;

  const students = [
    { id: "u1", code: "104582", name: "Arun Kumar", email: "arun@example.com", password: "pass123", department: "Computer Science", year: "2nd Year", bio: "I love building things and figuring out design software.", avatarSeed: "Arun", teach: [sid("Java"), sid("Photoshop"), sid("Video Editing")], learn: [sid("Python"), sid("UI/UX Design")], availability: "Weekday evenings", exchanges: 3, status: "Active", verified: true, createdAt: "2026-07-02" },
    { id: "u2", code: "227916", name: "Divya Suresh", email: "divya@example.com", password: "pass123", department: "Information Technology", year: "3rd Year", bio: "Backend dev by day, occasional UI dabbler.", avatarSeed: "Divya", teach: [sid("Python"), sid("UI/UX Design")], learn: [sid("Java"), sid("Guitar")], availability: "Weekends", exchanges: 5, status: "Active", verified: true, createdAt: "2026-06-18" },
    { id: "u3", code: "358204", name: "Karthik Raman", email: "karthik@example.com", password: "pass123", department: "Electronics & Comm.", year: "1st Year", bio: "Play guitar in a band, curious about editing photos.", avatarSeed: "Karthik", teach: [sid("Guitar"), sid("Football")], learn: [sid("Photoshop"), sid("Public Speaking")], availability: "Weekday mornings", exchanges: 1, status: "Active", verified: true, createdAt: "2026-07-20" },
    { id: "u4", code: "461739", name: "Meera Nair", email: "meera@example.com", password: "pass123", department: "Computer Science", year: "3rd Year", bio: "Frontend enthusiast, want to pick up a new language.", avatarSeed: "Meera", teach: [sid("React"), sid("JavaScript")], learn: [sid("Spanish"), sid("Illustrator")], availability: "Evenings", exchanges: 2, status: "Active", verified: true, createdAt: "2026-06-30" },
    { id: "u5", code: "590127", name: "Rahul Verma", email: "rahul@example.com", password: "pass123", department: "Mechanical Engineering", year: "2nd Year", bio: "Decent with spreadsheets, want to get into web dev.", avatarSeed: "Rahul", teach: [sid("Public Speaking"), sid("Excel")], learn: [sid("React"), sid("Figma")], availability: "Flexible", exchanges: 0, status: "Active", verified: false, createdAt: "2026-08-10" },
    { id: "u6", code: "643850", name: "Sara Fernandes", email: "sara@example.com", password: "pass123", department: "Design", year: "2nd Year", bio: "Illustrator + Figma person, learning to code a little.", avatarSeed: "Sara", teach: [sid("Illustrator"), sid("Figma")], learn: [sid("Java"), sid("Excel")], availability: "Weekends", exchanges: 1, status: "Active", verified: true, createdAt: "2026-07-11" },
  ];

  const requests = [
    { id: "r1", senderId: "u3", receiverId: "u1", teachSkill: sid("Guitar"), learnSkill: sid("Photoshop"), message: "Hi Arun, I can teach you Guitar and would love to learn Photoshop from you.", status: "Pending", createdAt: "2026-08-11" },
  ];

  const connections = [
    { id: "cn1", student1Id: "u1", student2Id: "u2", status: "Accepted" },
  ];

  const sessions = [
    { id: "sess1", connectionId: "cn1", skill: sid("Java"), date: "2026-08-20", time: "14:00", location: "Main Library", notes: "Bring a laptop with JDK installed.", status: "Scheduled" },
  ];

  const reports = [
    { id: "rep1", reporterId: "u4", reportedUserId: "u6", reason: "Misleading skill information", description: "Listed skills seem inflated compared to actual portfolio shared.", status: "Pending", adminAction: "", createdAt: "2026-08-09" },
  ];

  const notifications = [
    { id: "n1", userId: "u1", text: "Karthik Raman sent you a skill exchange request.", read: false, createdAt: "2026-08-11" },
    { id: "n2", userId: "u1", text: "Session with Divya Suresh scheduled for 20 Aug.", read: false, createdAt: "2026-08-10" },
    { id: "n3", userId: "u2", text: "Your connection with Arun Kumar is now active.", read: true, createdAt: "2026-08-05" },
  ];

  return { categories, skills, students, requests, connections, sessions, reports, notifications };
}

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to reseed */ }
  }
  const db = seedData();
  saveDB(db);
  return db;
}

function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function resetDB() { localStorage.removeItem(DB_KEY); return loadDB(); }

/* current in-memory copy for this page load */
let DB = loadDB();
function refreshDB() { DB = loadDB(); return DB; }
function persist() { saveDB(DB); }

function mergeById(localArr, remoteArr) {
  if (!remoteArr || !Array.isArray(remoteArr)) return localArr || [];
  if (!localArr || !Array.isArray(localArr)) return remoteArr;
  const map = new Map();
  remoteArr.forEach((item) => { if (item && item.id) map.set(item.id, item); });
  localArr.forEach((item) => {
    if (item && item.id && !map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

// Sync with MongoDB Atlas Backend
async function syncDBWithBackend() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data.students && data.students.length > 0) {
        DB.categories = mergeById(DB.categories, data.categories);
        DB.skills = mergeById(DB.skills, data.skills);
        DB.students = mergeById(DB.students, data.students);
        DB.requests = mergeById(DB.requests, data.requests);
        DB.connections = mergeById(DB.connections, data.connections);
        DB.sessions = mergeById(DB.sessions, data.sessions);
        DB.reports = mergeById(DB.reports, data.reports);
        DB.notifications = mergeById(DB.notifications, data.notifications);
        persist();
      }
    }
  } catch (e) {
    console.warn('MongoDB sync offline, using local cache');
  }
}
syncDBWithBackend();

/* ---------------- session ---------------- */
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
}
function setSession(obj) { localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

/* ---------------- lookups ---------------- */
function studentById(id) { return DB.students.find((s) => s.id === id); }
function studentByCode(code) { return DB.students.find((s) => s.code === String(code).trim()); }
function generateStudentCode() {
  let code;
  do { code = String(Math.floor(100000 + Math.random() * 900000)); }
  while (DB.students.some((s) => s.code === code));
  return code;
}
function skillById(id) { return DB.skills.find((s) => s.id === id); }
function skillName(id) { const s = skillById(id); return s ? s.name : "Unknown"; }
function categoryById(id) { return DB.categories.find((c) => c.id === id); }
function categoryName(id) { const c = categoryById(id); return c ? c.name : ""; }

/* ---------------- matching ---------------- */
function computeMatch(a, b) {
  const aTeach = new Set(a.teach), aLearn = new Set(a.learn);
  const bTeach = new Set(b.teach), bLearn = new Set(b.learn);
  const aCanTeachB = [...aTeach].filter((s) => bLearn.has(s));
  const bCanTeachA = [...bTeach].filter((s) => aLearn.has(s));
  let type = "none";
  if (aCanTeachB.length && bCanTeachA.length) type = "great";
  else if (aCanTeachB.length || bCanTeachA.length) type = "good";
  return { type, aCanTeachB, bCanTeachA };
}

/* ---------------- formatting ---------------- */
function fmtDate(d) {
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch (e) { return d; }
}
function initials(name) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }
function avatarColor(seed) {
  const palette = ["#2F5233", "#8A5A2B", "#4A5FA0", "#A0475D", "#6B7568", "#C9A227"];
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) h = (h * 31 + String(seed).charCodeAt(i)) % palette.length;
  return palette[h];
}
function escapeHtml(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function todayISO() { return new Date().toISOString().slice(0, 10); }

/* ---------------- mutation helpers (student side) ---------------- */
function updateStudent(id, patch) {
  DB.students = DB.students.map((s) => (s.id === id ? { ...s, ...patch } : s));
  persist();
  fetch('/api/students/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  }).catch(() => {});
}
function addNotification(userId, text) {
  const notif = NotificationFactory.create(userId, text);
  DB.notifications.unshift(notif);
  persist();
  fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notif)
  }).catch(() => {});
}
function sendRequest(me, target, teachSkill, learnSkill, message) {
  const req = RequestFactory.create(me.id, target.id, teachSkill, learnSkill, message);
  DB.requests.unshift(req);
  persist();
  addNotification(target.id, `${me.name} sent you a skill exchange request.`);
  fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  }).catch(() => {});
  return req;
}
function respondRequest(reqId, status, actingStudentName) {
  const req = DB.requests.find((r) => r.id === reqId);
  if (!req) return;
  DB.requests = DB.requests.map((r) => (r.id === reqId ? { ...r, status } : r));
  persist();
  addNotification(req.senderId, `${actingStudentName} ${status.toLowerCase()} your skill exchange request.`);
  fetch('/api/requests/' + reqId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(() => {});
  if (status === "Accepted") {
    const connId = uid("cn");
    const newConn = { id: connId, student1Id: req.senderId, student2Id: req.receiverId, status: "Accepted" };
    DB.connections.push(newConn);
    const s1 = studentById(req.senderId), s2 = studentById(req.receiverId);
    updateStudent(req.senderId, { exchanges: (s1 ? s1.exchanges : 0) + 1 });
    updateStudent(req.receiverId, { exchanges: (s2 ? s2.exchanges : 0) + 1 });
    persist();
    fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConn)
    }).catch(() => {});
  }
}
function scheduleSession(connection, me, form) {
  const sess = SessionFactory.create(connection.id, form);
  DB.sessions.push(sess);
  persist();
  const otherId = connection.student1Id === me.id ? connection.student2Id : connection.student1Id;
  addNotification(otherId, `${me.name} scheduled a session with you.`);
  fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sess)
  }).catch(() => {});
  return sess;
}
function updateSessionStatus(sessionId, status) {
  DB.sessions = DB.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s));
  persist();
  fetch('/api/sessions/' + sessionId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).catch(() => {});
}
function markNotifRead(id) {
  DB.notifications = DB.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  persist();
  fetch('/api/notifications/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: true })
  }).catch(() => {});
}

function submitReport(me, form) {
  const rep = { id: uid("rep"), reporterId: me.id, reportedUserId: form.userId, reason: form.reason, description: form.description, status: "Pending", adminAction: "", createdAt: todayISO() };
  DB.reports.unshift(rep);
  persist();
  return rep;
}

/* ---------------- mutation helpers (admin side) ---------------- */
function adminStudentAction(id, action) {
  if (action === "block") updateStudent(id, { status: "Blocked" });
  if (action === "unblock") updateStudent(id, { status: "Active" });
  if (action === "suspend") updateStudent(id, { status: "Suspended" });
  if (action === "verify") updateStudent(id, { verified: true, status: "Active" });
  if (action === "reject" || action === "delete") {
    DB.students = DB.students.filter((s) => s.id !== id);
    persist();
    fetch('/api/students/' + id, { method: 'DELETE' }).catch(() => {});
  }
}
function adminReportAction(reportId, action) {
  const rep = DB.reports.find((r) => r.id === reportId);
  if (!rep) return;
  if (action === "warn") {
    DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Under Review", adminAction: "Warned" } : r));
    persist();
    addNotification(rep.reportedUserId, "An admin has issued you a warning based on a report.");
  }
  if (action === "block") { updateStudent(rep.reportedUserId, { status: "Blocked" }); DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Resolved", adminAction: "Blocked" } : r)); persist(); }
  if (action === "suspend") { updateStudent(rep.reportedUserId, { status: "Suspended" }); DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Resolved", adminAction: "Suspended" } : r)); persist(); }
  if (action === "delete") {
    DB.students = DB.students.filter((s) => s.id !== rep.reportedUserId);
    DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Resolved", adminAction: "Deleted profile" } : r));
    persist();
    fetch('/api/students/' + rep.reportedUserId, { method: 'DELETE' }).catch(() => {});
  }
  if (action === "resolve") { DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Resolved" } : r)); persist(); }
  if (action === "dismiss") { DB.reports = DB.reports.map((r) => (r.id === reportId ? { ...r, status: "Rejected" } : r)); persist(); }
}
function adminCategoryAdd(name) { DB.categories.push({ id: uid("c"), name }); persist(); }
function adminCategoryEdit(id, name) { if (!name.trim()) return; DB.categories = DB.categories.map((c) => (c.id === id ? { ...c, name } : c)); persist(); }
function adminCategoryDelete(id) { DB.categories = DB.categories.filter((c) => c.id !== id); persist(); }
function adminSkillAdd(name, categoryId) { DB.skills.push({ id: uid("s"), name, categoryId }); persist(); }
function adminSkillDelete(id) { DB.skills = DB.skills.filter((s) => s.id !== id); persist(); }
