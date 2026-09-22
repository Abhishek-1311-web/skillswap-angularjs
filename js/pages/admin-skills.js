(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  render();

  function render() {
    pageContent().innerHTML = `
      ${pageHead("Admin", "Skill Categories")}
      <div class="grid-2" style="align-items:start;">
        <div>
          <div class="card" style="margin-bottom:16px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Add a category</div>
            <div style="display:flex;gap:8px;">
              <input class="input" id="catName" placeholder="New category name">
              <button class="btn btn-primary" id="addCatBtn">+ Add</button>
            </div>
          </div>
          <div id="catList"></div>
        </div>
        <div>
          <div class="card" style="margin-bottom:16px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Add a skill</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input class="input" id="skillName" placeholder="New skill name" style="flex:1;min-width:140px;">
              <select class="input" id="skillCat" style="width:160px;">${DB.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}</select>
              <button class="btn btn-primary" id="addSkillBtn">+ Add</button>
            </div>
          </div>
          <div class="card" style="max-height:420px;overflow-y:auto;">
            <div style="font-size:13px;font-weight:700;margin-bottom:10px;">All skills</div>
            <div id="skillList"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("addCatBtn").addEventListener("click", () => {
      const val = document.getElementById("catName").value.trim();
      if (!val) return;
      adminCategoryAdd(val);
      render();
    });
    document.getElementById("addSkillBtn").addEventListener("click", () => {
      const name = document.getElementById("skillName").value.trim();
      const catId = document.getElementById("skillCat").value;
      if (!name) return;
      adminSkillAdd(name, catId);
      render();
    });

    renderCatList();
    renderSkillList();
  }

  function renderCatList() {
    document.getElementById("catList").innerHTML = `<div class="grid-2">${DB.categories.map((c) => `
      <div class="card" data-cat-row="${c.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <span class="cat-label" style="font-size:13.5px;font-weight:600;">${escapeHtml(c.name)}</span>
          <div style="display:flex;gap:4px;">
            <button class="edit-cat-btn" data-id="${c.id}" style="background:none;border:none;cursor:pointer;color:var(--pine);">✎</button>
            <button class="del-cat-btn" data-id="${c.id}" style="background:none;border:none;cursor:pointer;color:var(--red);">🗑</button>
          </div>
        </div>
      </div>`).join("")}</div>`;

    document.querySelectorAll(".edit-cat-btn").forEach((b) => b.addEventListener("click", () => {
      const row = document.querySelector(`[data-cat-row="${b.dataset.id}"]`);
      const cat = categoryById(b.dataset.id);
      row.innerHTML = `<div style="display:flex;gap:6px;"><input class="input" id="editInput-${cat.id}" value="${escapeHtml(cat.name)}"><button class="btn btn-primary btn-sm" id="saveInput-${cat.id}">Save</button></div>`;
      document.getElementById(`saveInput-${cat.id}`).addEventListener("click", () => {
        adminCategoryEdit(cat.id, document.getElementById(`editInput-${cat.id}`).value.trim());
        render();
      });
    }));
    document.querySelectorAll(".del-cat-btn").forEach((b) => b.addEventListener("click", () => { adminCategoryDelete(b.dataset.id); render(); }));
  }

  function renderSkillList() {
    document.getElementById("skillList").innerHTML = DB.skills.length ? DB.skills.map((s) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);">
        <span style="font-size:13px;">${escapeHtml(s.name)} <span style="color:var(--muted);font-size:11px;">— ${escapeHtml(categoryName(s.categoryId))}</span></span>
        <button class="del-skill-btn" data-id="${s.id}" style="background:none;border:none;cursor:pointer;color:var(--red);">🗑</button>
      </div>`).join("") : `<div class="empty-state">No skills yet.</div>`;
    document.querySelectorAll(".del-skill-btn").forEach((b) => b.addEventListener("click", () => { adminSkillDelete(b.dataset.id); render(); }));
  }
})();
