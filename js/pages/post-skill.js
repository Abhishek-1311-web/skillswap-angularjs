(function () {
  let me = requireStudent();
  if (!me) return;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  render();

  function render() {
    me = studentById(me.id);
    const catOptions = DB.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");

    pageContent().innerHTML = `
      ${pageHead("Skills Management", "My Skills")}
      <div class="card" style="margin-bottom:20px;max-width:680px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Add a skill</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
          <div><div style="font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:5px;">Type</div>
            <select class="input" id="fType" style="width:170px;">
              <option value="teach">I can teach</option>
              <option value="learn">I want to learn</option>
            </select>
          </div>
          <div><div style="font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:5px;">Category</div>
            <select class="input" id="fCategory" style="width:170px;">${catOptions}</select>
          </div>
          <div><div style="font-size:11.5px;color:var(--muted);font-weight:600;margin-bottom:5px;">Skill</div>
            <select class="input" id="fSkill" style="width:190px;"></select>
          </div>
          <button class="btn btn-primary" id="addBtn">+ Add</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Skills I can teach</div>
          <div id="teachList">${listRows("teach")}</div>
        </div>
        <div class="card">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Skills I want to learn</div>
          <div id="learnList">${listRows("learn")}</div>
        </div>
      </div>
    `;

    function listRows(type) {
      if (!me[type].length) return `<div class="empty-state">No ${type === "teach" ? "teaching skills" : "learning goals"} added yet.</div>`;
      return me[type].map((id) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);">
          <span style="font-size:13.5px;">${escapeHtml(skillName(id))}</span>
          <button class="rm-btn" data-type="${type}" data-id="${id}" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:15px;">🗑</button>
        </div>`).join("");
    }

    function refreshSkillOptions() {
      const type = document.getElementById("fType").value;
      const cat = document.getElementById("fCategory").value;
      const available = DB.skills.filter((s) => s.categoryId === cat && !me[type].includes(s.id));
      const sel = document.getElementById("fSkill");
      sel.innerHTML = `<option value="">Select a skill…</option>` + available.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("");
    }
    refreshSkillOptions();
    document.getElementById("fType").addEventListener("change", refreshSkillOptions);
    document.getElementById("fCategory").addEventListener("change", refreshSkillOptions);

    document.getElementById("addBtn").addEventListener("click", () => {
      const type = document.getElementById("fType").value;
      const skillId = document.getElementById("fSkill").value;
      if (!skillId) return;
      updateStudent(me.id, { [type]: [...me[type], skillId] });
      render();
    });

    document.querySelectorAll(".rm-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type, id = btn.dataset.id;
        updateStudent(me.id, { [type]: me[type].filter((x) => x !== id) });
        render();
      });
    });
  }
})();
