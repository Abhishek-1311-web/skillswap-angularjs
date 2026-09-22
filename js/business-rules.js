/* ============================================================
   SkillSwap — Business Logic Layer (AngularJS)
   ------------------------------------------------------------
   Product rules live here instead of being scattered/hard-coded
   inside page scripts, so every page enforces them the same way.

   Registered as an AngularJS app.service() provider on the
   "skillSwapApp" module (declared in js/angular-app.js).
   js/angular-bootstrap.js pulls the instance out of the injector
   and exposes it as window.BusinessRules, so request-exchange.js,
   sessions.js, dashboard.js, profile.js and feedback.js keep
   calling it exactly as before — same method names, same rules.

   Depends on: DB, studentById(), updateStudent(), todayISO() from
   js/data.js — load this file AFTER js/data.js, js/angular-app.js
   and js/services.js (NotificationService is injected via
   AngularJS DI instead of being referenced as a bare global).
   ============================================================ */

app.service("BusinessRules", function (NotificationService) {
  /* ---- Rule 1: Exchange request eligibility ----
     - Blocked/Suspended students can't send or receive requests.
     - A student can't request themselves, or a student with no
       skills to teach.
     - To stop spam, outgoing PENDING requests are capped:
       unverified students get a lower cap than verified ones,
       which also gives students a real incentive to verify. */
  this.MAX_PENDING_UNVERIFIED = 3;
  this.MAX_PENDING_VERIFIED = 8;

  this.canSendRequest = function (sender, receiver) {
    if (!sender || !receiver) return { allowed: false, reason: "Student not found." };
    if (sender.id === receiver.id) return { allowed: false, reason: "You can't send a request to yourself." };
    if (sender.status !== "Active") return { allowed: false, reason: "Your account is currently " + sender.status.toLowerCase() + " and can't send requests." };
    if (receiver.status !== "Active") return { allowed: false, reason: receiver.name + "'s account isn't currently active." };
    if (!receiver.teach.length) return { allowed: false, reason: receiver.name + " hasn't listed any skills to teach yet." };

    var pendingOutgoing = DB.requests.filter(function (r) { return r.senderId === sender.id && r.status === "Pending"; }).length;
    var cap = sender.verified ? this.MAX_PENDING_VERIFIED : this.MAX_PENDING_UNVERIFIED;
    if (pendingOutgoing >= cap) {
      return {
        allowed: false,
        reason: "You've reached the limit of " + cap + " pending requests" + (sender.verified ? "" : " for unverified accounts") + ". Wait for a response, or get verified for a higher limit.",
      };
    }
    return { allowed: true, reason: "" };
  };

  /* ---- Rule 2: Trust badge ----
     Rewards verified students who complete exchanges. Shown
     anywhere a student's standing is displayed. */
  this.getTrustBadge = function (student) {
    if (!student.verified) return { label: "New Member", tone: "muted" };
    if (student.exchanges >= 5) return { label: "🏆 Skill Champion", tone: "pine" };
    if (student.exchanges >= 2) return { label: "Trusted Member", tone: "pine" };
    return { label: "Active Member", tone: "gold" };
  };

  /* ---- Rule 3: Session scheduling window ----
     A session can't be booked in the past, and (to keep the
     schedule realistic for a college term) not more than 90
     days out either. */
  this.MAX_SCHEDULE_DAYS_AHEAD = 90;

  this.validateSessionDate = function (dateStr) {
    if (!dateStr) return { valid: false, reason: "Pick a date." };
    var picked = new Date(dateStr + "T00:00:00");
    if (isNaN(picked.getTime())) return { valid: false, reason: "That date isn't valid." };
    var today = new Date(todayISO() + "T00:00:00");
    if (picked < today) return { valid: false, reason: "You can't schedule a session in the past." };
    var maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + this.MAX_SCHEDULE_DAYS_AHEAD);
    if (picked > maxDate) return { valid: false, reason: "Sessions can only be scheduled up to " + this.MAX_SCHEDULE_DAYS_AHEAD + " days ahead." };
    return { valid: true, reason: "" };
  };

  /* ---- Rule 4: Report auto-moderation ----
     If 3 or more open reports (Pending/Under Review) pile up
     against the same student, the account is auto-suspended
     pending admin review — admins don't have to catch every
     repeat offender manually. */
  this.REPORT_AUTO_SUSPEND_THRESHOLD = 3;

  this.evaluateReportEscalation = function (reportedUserId) {
    var openReports = DB.reports.filter(function (r) {
      return r.reportedUserId === reportedUserId && (r.status === "Pending" || r.status === "Under Review");
    });
    if (openReports.length >= this.REPORT_AUTO_SUSPEND_THRESHOLD) {
      var student = studentById(reportedUserId);
      if (student && student.status === "Active") {
        updateStudent(reportedUserId, { status: "Suspended" });
        NotificationService.send(reportedUserId, "Your account was automatically suspended after multiple reports. An admin will review your case.");
        return true;
      }
    }
    return false;
  };
});
