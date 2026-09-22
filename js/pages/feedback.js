app.controller("FeedbackController", function ($scope, BusinessRules) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  const reasons = ["Fake profile", "Harassment", "Inappropriate behavior", "Spam", "Misleading skill information", "Other"];
  const others = DB.students.filter((s) => s.id !== me.id);

  pageContent().innerHTML = `
    ${pageHead("Support", "Report a User")}
    <div class="card" style="max-width:520px;">
      <div id="banner"></div>
      <form id="reportForm">
        <label class="field"><span class="label">User</span>
          <select class="input" id="fUser" required>
            <option value="">Select a student…</option>
            ${others.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span class="label">Reason</span>
          <select class="input" id="fReason">${reasons.map((r) => `<option>${r}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="label">Description</span><textarea class="input" id="fDesc" style="min-height:90px;" placeholder="Briefly describe what happened…" required></textarea></label>
        <button type="submit" class="btn btn-danger">🚩 Submit report</button>
      </form>
    </div>
  `;

  document.getElementById("reportForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = document.getElementById("fUser").value;
    const reason = document.getElementById("fReason").value;
    const description = document.getElementById("fDesc").value.trim();
    if (!userId || !description) return;
    submitReport(me, { userId, reason, description });
    const escalated = BusinessRules.evaluateReportEscalation(userId);
    document.getElementById("banner").innerHTML = bannerHtml(
      escalated
        ? "Report submitted. This student has now received multiple reports and their account has been automatically suspended pending admin review."
        : "Report submitted. An admin will review it shortly.",
      "success"
    );
    document.getElementById("reportForm").reset();
  });
});
