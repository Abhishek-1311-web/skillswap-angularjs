app.controller("ExploreController", function ($scope, MatchingService) {
  const me = requireStudent();
  if (!me) return;
  $scope.me = me;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  const departments = [...new Set(DB.students.map((s) => s.department))];
  const years = [...new Set(DB.students.map((s) => s.year))];

  const state = { q: "", teach: "", learn: "", department: "", year: "", category: "", greatOnly: false };

  render();

  function render() {
    pageContent().innerHTML = `
      ${pageHead("Skill Matching", "Find Students")}
      <div class="card" style="margin-bottom:18px;">
        <div style="margin-bottom:10px;">
          <input class="input" id="fSearch" placeholder="🔍 Search by name or Student ID (e.g. 104582)" style="max-width:360px;">
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <select class="input" id="fTeach" style="width:190px;"><option value="">Any — they can teach</option>${DB.skills.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}</select>
          <select class="input" id="fLearn" style="width:190px;"><option value="">Any — they want to learn</option>${DB.skills.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("")}</select>
          <select class="input" id="fDept" style="width:170px;"><option value="">Any department</option>${departments.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("")}</select>
          <select class="input" id="fYear" style="width:130px;"><option value="">Any year</option>${years.map((y) => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join("")}</select>
          <select class="input" id="fCat" style="width:170px;"><option value="">Any category</option>${DB.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}</select>
          <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted);">
            <input type="checkbox" id="fGreat"> Two-way matches only
          </label>
        </div>
      </div>
      <div id="resultCount" style="font-size:12.5px;color:var(--muted);margin-bottom:12px;"></div>
      <div class="grid-3" id="results"></div>
    `;

    document.getElementById("fSearch").value = state.q;
    document.getElementById("fSearch").addEventListener("input", (e) => { state.q = e.target.value; applyFilters(); });

    const fieldMap = { fTeach: "teach", fLearn: "learn", fDept: "department", fYear: "year", fCat: "category" };
    Object.keys(fieldMap).forEach((id) => document.getElementById(id).addEventListener("change", (e) => {
      state[fieldMap[id]] = e.target.value;
      applyFilters();
    }));
    document.getElementById("fGreat").addEventListener("change", (e) => { state.greatOnly = e.target.checked; applyFilters(); });

    applyFilters();
  }

  function applyFilters() {
    const q = state.q.trim().toLowerCase();
    const results = DB.students
      .filter((s) => s.id !== me.id && s.status === "Active")
      .map((s) => ({ s, m: MatchingService.evaluate(me, s) }))
      .filter(({ s, m }) => {
        if (q && !(s.name.toLowerCase().includes(q) || (s.code || "").toLowerCase().includes(q))) return false;
        if (state.department && s.department !== state.department) return false;
        if (state.year && s.year !== state.year) return false;
        if (state.teach && !s.teach.includes(state.teach)) return false;
        if (state.learn && !s.learn.includes(state.learn)) return false;
        if (state.category) {
          const inCat = [...s.teach, ...s.learn].some((id) => { const sk = skillById(id); return sk && sk.categoryId === state.category; });
          if (!inCat) return false;
        }
        if (state.greatOnly && m.type !== "great") return false;
        return true;
      });

    document.getElementById("resultCount").textContent = `${results.length} student${results.length !== 1 ? "s" : ""} found`;
    document.getElementById("results").innerHTML = results.length
      ? results.map(({ s, m }) => studentCardHtml(s, { match: m, viewHref: "profile.html?id=" + s.id, requestHref: s.teach.length ? "request-exchange.html?to=" + s.id : undefined })).join("")
      : `<div class="empty-state">No students match those filters.</div>`;
  }
});
