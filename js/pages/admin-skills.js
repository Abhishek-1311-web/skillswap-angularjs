app.controller("AdminSkillsController", function ($scope, $http) {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  $scope.render = function () {
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
              <select class="input" id="skillCat" style="width:170px;"></select>
              <button class="btn btn-primary" id="addSkillBtn">+ Add</button>
            </div>
          </div>
          <div id="skillList"></div>
        </div>
      </div>
    `;

    document.getElementById("skillCat").innerHTML = DB.categories.map(function (c) {
      return `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
    }).join("");

    renderCategories();
    renderSkills();

    document.getElementById("addCatBtn").addEventListener("click", function () {
      var name = document.getElementById("catName").value.trim();
      if (!name) return;
      adminCategoryAdd(name);
      $http.post("/api/categories", { name: name }).catch(function () {});
      $scope.render();
    });

    document.getElementById("addSkillBtn").addEventListener("click", function () {
      var name = document.getElementById("skillName").value.trim();
      var catId = document.getElementById("skillCat").value;
      if (!name || !catId) return;
      adminSkillAdd(name, catId);
      $http.post("/api/skills", { name: name, categoryId: catId }).catch(function () {});
      $scope.render();
    });
  };

  function renderCategories() {
    document.getElementById("catList").innerHTML = DB.categories.map(function (c) {
      var count = DB.skills.filter(function (s) { return s.categoryId === c.id; }).length;
      return `
        <div class="card" style="margin-bottom:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-weight:600;font-size:14px;">${escapeHtml(c.name)}</div>
            <div style="font-size:11.5px;color:var(--muted);">${count} skill${count !== 1 ? "s" : ""}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm edit-cat-btn" data-id="${c.id}" data-name="${escapeHtml(c.name)}">Edit</button>
            <button class="btn btn-danger btn-sm del-cat-btn" data-id="${c.id}">Delete</button>
          </div>
        </div>`;
    }).join("");

    document.querySelectorAll(".edit-cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.id, name = btn.dataset.name;
        var newName = prompt("Rename category:", name);
        if (newName && newName.trim()) {
          adminCategoryEdit(id, newName.trim());
          $scope.render();
        }
      });
    });

    document.querySelectorAll(".del-cat-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.id;
        if (confirm("Delete this category? Skills inside it won't be deleted.")) {
          adminCategoryDelete(id);
          $http.delete("/api/categories/" + id).catch(function () {});
          $scope.render();
        }
      });
    });
  }

  function renderSkills() {
    document.getElementById("skillList").innerHTML = DB.skills.map(function (s) {
      var cat = categoryById(s.categoryId);
      return `
        <div class="card" style="margin-bottom:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="font-weight:600;font-size:13.5px;">${escapeHtml(s.name)}</span>
            <span class="pill pill-muted" style="margin-left:8px;font-size:11px;">${escapeHtml(cat ? cat.name : "Uncategorized")}</span>
          </div>
          <button class="btn btn-danger btn-sm del-skill-btn" data-id="${s.id}">Delete</button>
        </div>`;
    }).join("");

    document.querySelectorAll(".del-skill-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.dataset.id;
        adminSkillDelete(id);
        $http.delete("/api/skills/" + id).catch(function () {});
        $scope.render();
      });
    });
  }

  $scope.render();
});
