/* ============================================================
   SkillSwap — Factory Layer (AngularJS)
   ------------------------------------------------------------
   Factory pattern: each factory below is the ONE place that
   knows how to build a particular kind of object used by the
   app (a request, a session, a notification). Instead of every
   page hand-assembling `{ id: ..., status: "Pending", ... }`
   object literals themselves, they ask the factory for one.
   That keeps the shape of these objects consistent and makes
   default values (status, timestamps, ids) live in a single
   spot instead of being repeated everywhere.

   Registered as AngularJS app.factory() providers on the
   "skillSwapApp" module (declared in js/angular-app.js).
   js/angular-bootstrap.js pulls them out of the injector and
   exposes them as window.RequestFactory / window.SessionFactory
   / window.NotificationFactory so the rest of the app (data.js)
   keeps calling them exactly as before — same method names,
   same return shapes.

   Depends on: uid(), todayISO() from js/data.js — load this
   file AFTER js/data.js and js/angular-app.js.
   ============================================================ */

/* ---------------- 1. RequestFactory ----------------
   Builds a skill-exchange request object (student -> student). */
app.factory("RequestFactory", function () {
  return {
    create: function (senderId, receiverId, teachSkill, learnSkill, message) {
      return {
        id: uid("r"),
        senderId: senderId,
        receiverId: receiverId,
        teachSkill: teachSkill,
        learnSkill: learnSkill,
        message: (message || "").trim(),
        status: "Pending",
        createdAt: todayISO(),
      };
    },
  };
});

/* ---------------- 2. SessionFactory ----------------
   Builds a scheduled-session object for an accepted connection. */
app.factory("SessionFactory", function () {
  return {
    create: function (connectionId, form) {
      return {
        id: uid("sess"),
        connectionId: connectionId,
        skill: form.skill,
        date: form.date,
        time: form.time,
        location: form.location,
        notes: form.notes || "",
        status: "Scheduled",
      };
    },
  };
});

/* ---------------- 3. NotificationFactory ----------------
   Builds a notification object for a given user. */
app.factory("NotificationFactory", function () {
  return {
    create: function (userId, text) {
      return {
        id: uid("n"),
        userId: userId,
        text: text,
        read: false,
        createdAt: todayISO(),
      };
    },
  };
});
