/* ============================================================
   SkillSwap — AngularJS legacy interop bridge
   ------------------------------------------------------------
   Everything that actually NEEDS the 3 Services / BusinessRules
   gets them through real AngularJS dependency injection now
   (see the app.controller(...) definitions in js/pages/*.js).

   The one exception is js/data.js: sendRequest(), scheduleSession()
   and addNotification() are shared, framework-agnostic functions
   used across many pages (not just the ones with AngularJS
   controllers), so they can't receive constructor injection. They
   call RequestFactory / SessionFactory / NotificationFactory as
   plain identifiers, exactly as before — this app.run() block is
   the standard AngularJS pattern for handing an injector-created
   singleton to code outside Angular's world. It runs once, right
   after the "skillSwapApp" injector is created, and every call site
   in data.js only ever fires from a click/submit handler — i.e.
   always well after this has already run.
   ============================================================ */

app.run(function (RequestFactory, SessionFactory, NotificationFactory) {
  window.RequestFactory = RequestFactory;
  window.SessionFactory = SessionFactory;
  window.NotificationFactory = NotificationFactory;
});
