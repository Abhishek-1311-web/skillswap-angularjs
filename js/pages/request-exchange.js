app.controller("RequestExchangeController", function ($scope, MatchingService, BusinessRules) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  const targetId = qparam("to");
  const target = targetId ? studentById(targetId) : null;

  if (!target || target.id === me.id) {
    pageContent().innerHTML = `${pageHead("Connection Request", "Send Exchange Request")}<div class="empty-state">Choose a student from <a href="explore.html">Find Students</a> first.</div>`;
    return;
  }
  if (!me.teach.length) {
    pageContent().innerHTML = `${pageHead("Connection Request", "Send Exchange Request")}<div class="empty-state">Add a skill you can teach in <a href="post-skill.html">My Skills</a> before sending a request.</div>`;
    return;
  }
  if (!target.teach.length) {
    pageContent().innerHTML = `${pageHead("Connection Request", "Send Exchange Request")}<div class="empty-state">${escapeHtml(target.name)} hasn't listed any skills to teach yet, so there's nothing to request.</div>`;
    return;
  }

  render();

  function render() {
    pageContent().innerHTML = `
      ${pageHead("Connection Request", "Send Exchange Request", `<a class="btn btn-ghost" href="explore.html">← Back</a>`)}
      <div class="grid-2" style="align-items:start;">
        ${studentCardHtml(target, { match: MatchingService.evaluate(me, target) })}
        <div class="card">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;">
            ${avatarHtml(target.name, target.avatarSeed, 40)}
            <div style="font-size:14px;font-weight:600;">To: ${escapeHtml(target.name)}</div>
          </div>
          <label class="field"><span class="label">Skill I can offer</span>
            <select class="input" id="fTeach">${me.teach.map((id) => `<option value="${id}">${escapeHtml(skillName(id))}</option>`).join("")}</select>
          </label>
          <label class="field"><span class="label">Skill I want to learn from them</span>
            <select class="input" id="fLearn">${target.teach.map((id) => `<option value="${id}">${escapeHtml(skillName(id))}</option>`).join("")}</select>
          </label>
          <label class="field"><span class="label">Message (optional)</span><textarea class="input" id="fMsg" style="min-height:80px;"></textarea></label>
          <div id="errBox"></div>
          <button class="btn btn-primary" id="sendBtn">↔ Send request</button>
        </div>
      </div>
    `;

    const fTeach = document.getElementById("fTeach");
    const fLearn = document.getElementById("fLearn");
    const fMsg = document.getElementById("fMsg");
    function defaultMsg() {
      return `Hi ${target.name.split(" ")[0]}, I can teach you ${skillName(fTeach.value)} and would like to learn ${skillName(fLearn.value)} from you.`;
    }
    fMsg.value = defaultMsg();
    fTeach.addEventListener("change", () => { fMsg.value = defaultMsg(); });
    fLearn.addEventListener("change", () => { fMsg.value = defaultMsg(); });

    document.getElementById("sendBtn").addEventListener("click", () => {
      const check = BusinessRules.canSendRequest(me, target);
      if (!check.allowed) { document.getElementById("errBox").innerHTML = bannerHtml(check.reason, "error"); return; }
      sendRequest(me, target, fTeach.value, fLearn.value, fMsg.value.trim());
      window.location.href = "requests.html";
    });
  }
});
