/* ============================================================
   SkillSwap — Business Logic Layer (AngularJS)
   ============================================================ */

app.service("BusinessRules", function (NotificationService) {
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

  this.getTrustBadge = function (student) {
    if (!student.verified) return { label: "New Member", tone: "muted" };
    if (student.exchanges >= 5) return { label: "🏆 Skill Champion", tone: "pine" };
    if (student.exchanges >= 2) return { label: "Trusted Member", tone: "pine" };
    return { label: "Active Member", tone: "gold" };
  };

  this.MAX_SCHEDULE_DAYS_AHEAD = 90;

  this.validateSessionDate = function (dateStr) {
    if (!dateStr) return { valid: false, reason: "Please pick a date." };
    var parts = dateStr.split('-');
    if (parts.length !== 3) return { valid: false, reason: "Invalid date format." };
    var pickedYear = parseInt(parts[0], 10);
    var pickedMonth = parseInt(parts[1], 10) - 1;
    var pickedDay = parseInt(parts[2], 10);

    var picked = new Date(pickedYear, pickedMonth, pickedDay);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (picked < today) return { valid: false, reason: "You can't schedule a session in the past." };
    var maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + this.MAX_SCHEDULE_DAYS_AHEAD);
    if (picked > maxDate) return { valid: false, reason: "Sessions can only be scheduled up to " + this.MAX_SCHEDULE_DAYS_AHEAD + " days ahead." };
    return { valid: true, reason: "" };
  };

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
