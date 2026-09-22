/* ============================================================
   SkillSwap — AngularJS module declaration
   ------------------------------------------------------------
   This is the ONLY AngularJS module in the app. It is not used
   to drive the page templates (the existing innerHTML-based
   rendering in ui.js / js/pages/*.js is left exactly as-is) —
   it exists purely to host the 3 Services, 3 Factories, and the
   Business Logic as real AngularJS injectables.

   js/factories.js, js/services.js and js/business-rules.js call
   app.factory(...) / app.service(...) on this module, so this
   file must load AFTER the AngularJS library and BEFORE those
   three files.
   ============================================================ */

var app = angular.module("skillSwapApp", []);
