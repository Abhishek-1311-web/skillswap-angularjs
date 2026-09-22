/* ============================================================
   SkillSwap — Service Layer (AngularJS)
   ------------------------------------------------------------
   Each service owns ONE responsibility and is the single place
   pages go to for that concern, instead of every page filtering
   DB.* arrays by hand. Services build objects through the
   Factory layer (js/factories.js) rather than writing object
   literals themselves — injected in via AngularJS DI.

   Registered as AngularJS app.service() providers on the
   "skillSwapApp" module (declared in js/angular-app.js).
   js/angular-bootstrap.js pulls the instances out of the
   injector and exposes them as window.NotificationService /
   window.MatchingService / window.SessionSchedulingService, so
   ui.js and js/pages/*.js keep calling them exactly as before —
   same method names, same behavior.

   Depends on: DB, persist(), computeMatch(), studentById() from
   js/data.js, and the *Factory providers from js/factories.js —
   load this file AFTER those two and js/angular-app.js.
   ============================================================ */

/* ---------------- 1. NotificationService ----------------
   Responsibility: create, fetch and mark-read notifications.
   Used by: BusinessRules (auto-suspend alert), ui.js (unread
   badge), dashboard.js (notification list + mark-as-read).
   Uses Angular DI to pull in NotificationFactory instead of
   referencing it as a bare global. */
app.service("NotificationService", function (NotificationFactory) {
  this.send = function (userId, text) {
    var notif = NotificationFactory.create(userId, text);
    DB.notifications.unshift(notif);
    persist();
    return notif;
  };
  this.getForUser = function (userId) {
    return DB.notifications.filter(function (n) { return n.userId === userId; });
  };
  this.getUnreadCount = function (userId) {
    return DB.notifications.filter(function (n) { return n.userId === userId && !n.read; }).length;
  };
  this.markRead = function (id) {
    DB.notifications = DB.notifications.map(function (n) { return n.id === id ? Object.assign({}, n, { read: true }) : n; });
    persist();
  };
});

/* ---------------- 2. MatchingService ----------------
   Responsibility: compatibility scoring & ranked suggestions
   between students. Wraps the existing computeMatch() pure
   function so every page ranks/sorts matches the same way.
   Used by: dashboard.js ("Suggested for you"), explore.js,
   request-exchange.js. */
app.service("MatchingService", function () {
  var self = this;

  this.evaluate = function (a, b) {
    return computeMatch(a, b);
  };
  this.typeScore = function (type) {
    if (type === "great") return 2;
    if (type === "good") return 1;
    return 0;
  };
  this.suggestFor = function (student, pool, limit) {
    limit = limit || 3;
    return pool
      .filter(function (s) { return s.id !== student.id && s.status === "Active"; })
      .map(function (s) { return { s: s, m: self.evaluate(student, s) }; })
      .filter(function (x) { return x.m.type !== "none"; })
      .sort(function (x, y) { return self.typeScore(y.m.type) - self.typeScore(x.m.type); })
      .slice(0, limit);
  };
});

/* ---------------- 3. SessionSchedulingService ----------------
   Responsibility: read/query connections & sessions, and create
   new sessions through SessionFactory. Centralizes the
   "which connections/sessions belong to this student" logic
   that used to be re-filtered inline on the sessions page.
   Used by: sessions.js, dashboard.js.
   Uses Angular DI to pull in SessionFactory and
   NotificationService instead of referencing them as bare
   globals. */
app.service("SessionSchedulingService", function (SessionFactory, NotificationService) {
  this.getActiveConnections = function (studentId) {
    return DB.connections.filter(function (c) {
      return (c.student1Id === studentId || c.student2Id === studentId) && c.status === "Accepted";
    });
  };
  this.getSessionsForConnection = function (connectionId) {
    return DB.sessions.filter(function (s) { return s.connectionId === connectionId; });
  };
  this.getUpcomingForStudent = function (studentId) {
    var connIds = this.getActiveConnections(studentId).map(function (c) { return c.id; });
    return DB.sessions.filter(function (s) { return connIds.includes(s.connectionId); });
  };
  this.schedule = function (connection, me, form) {
    var sess = SessionFactory.create(connection.id, form);
    DB.sessions.push(sess);
    persist();
    var otherId = connection.student1Id === me.id ? connection.student2Id : connection.student1Id;
    NotificationService.send(otherId, me.name + " scheduled a session with you.");
    return sess;
  };
});
