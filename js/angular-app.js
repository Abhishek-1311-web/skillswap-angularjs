/* ============================================================
   SkillSwap — Full AngularJS 1.8 Application Module
   ============================================================ */

var app = angular.module("skillSwapApp", []);

// Root Controller for Shell Header, Sidebar Navigation & User Session
app.controller("MainShellController", function ($scope, $window, $http) {
  $scope.currentUser = getSession();

  $scope.getStudentData = function () {
    if (!$scope.currentUser || !$scope.currentUser.id) return null;
    return studentById($scope.currentUser.id);
  };

  $scope.logout = function () {
    clearSession();
    $window.location.href = "login.html";
  };
});

// 1. Dashboard Controller
app.controller("DashboardController", function ($scope, NotificationService, SessionSchedulingService, MatchingService) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.stats = { exchanges: 0, pendingReqs: 0, upcomingSessions: 0 };
  $scope.suggestions = [];
  $scope.upcomingSessions = [];
  $scope.notifications = [];

  $scope.init = function () {
    if (!$scope.me) return;
    $scope.stats.exchanges = $scope.me.exchanges || 0;
    $scope.stats.pendingReqs = DB.requests.filter(function (r) { return r.receiverId === $scope.me.id && r.status === "Pending"; }).length;
    $scope.upcomingSessions = SessionSchedulingService.getUpcomingForStudent($scope.me.id);
    $scope.stats.upcomingSessions = $scope.upcomingSessions.length;
    $scope.suggestions = MatchingService.suggestFor($scope.me, DB.students, 4);
    $scope.notifications = NotificationService.getForUser($scope.me.id);
  };

  $scope.markAsRead = function (notifId) {
    NotificationService.markRead(notifId);
    $scope.notifications = NotificationService.getForUser($scope.me.id);
  };

  $scope.init();
});

// 2. Explore Controller
app.controller("ExploreController", function ($scope, MatchingService) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.categories = DB.categories;
  $scope.searchQuery = "";
  $scope.selectedCategory = "all";
  $scope.students = DB.students;

  $scope.filterStudents = function () {
    return $scope.students.filter(function (s) {
      if ($scope.me && s.id === $scope.me.id) return false;
      var matchesQuery = !$scope.searchQuery ||
        s.name.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes($scope.searchQuery.toLowerCase());
      return matchesQuery;
    });
  };

  $scope.getMatchInfo = function (targetStudent) {
    if (!$scope.me) return { type: 'none' };
    return MatchingService.evaluate($scope.me, targetStudent);
  };
});

// 3. Post Skill Controller
app.controller("PostSkillController", function ($scope, $http) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.categories = DB.categories;
  $scope.skillsList = DB.skills;
  $scope.newSkill = { type: "teach", categoryId: DB.categories[0] ? DB.categories[0].id : "", name: "" };

  $scope.addSkill = function () {
    if (!$scope.newSkill.name.trim() || !$scope.me) return;
    var name = $scope.newSkill.name.trim();
    var existingSkill = DB.skills.find(function (s) { return s.name.toLowerCase() === name.toLowerCase(); });
    var skillId = existingSkill ? existingSkill.id : uid("s");

    if (!existingSkill) {
      var sObj = { id: skillId, name: name, categoryId: $scope.newSkill.categoryId };
      DB.skills.push(sObj);
      $http.post("/api/skills", sObj).catch(function () {});
    }

    var targetArray = $scope.newSkill.type === "teach" ? $scope.me.teach : $scope.me.learn;
    if (!targetArray.includes(skillId)) {
      targetArray.push(skillId);
      updateStudent($scope.me.id, { teach: $scope.me.teach, learn: $scope.me.learn });
    }
    $scope.newSkill.name = "";
  };

  $scope.removeSkill = function (type, skillId) {
    if (!$scope.me) return;
    if (type === "teach") {
      $scope.me.teach = $scope.me.teach.filter(function (id) { return id !== skillId; });
    } else {
      $scope.me.learn = $scope.me.learn.filter(function (id) { return id !== skillId; });
    }
    updateStudent($scope.me.id, { teach: $scope.me.teach, learn: $scope.me.learn });
  };
});

// 4. Request Exchange Controller
app.controller("RequestExchangeController", function ($scope, $window, $http, NotificationService) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.targetStudent = null;
  $scope.teachSkill = "";
  $scope.learnSkill = "";
  $scope.message = "";

  $scope.init = function (targetId) {
    if (targetId) {
      $scope.targetStudent = studentById(targetId);
    }
  };

  $scope.submitExchangeRequest = function () {
    if (!$scope.me || !$scope.targetStudent) return;
    var req = sendRequest($scope.me, $scope.targetStudent, $scope.teachSkill, $scope.learnSkill, $scope.message);
    $window.location.href = "requests.html";
  };
});

// 5. Requests Controller
app.controller("RequestsController", function ($scope, $http, NotificationService) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.activeTab = "incoming";

  $scope.getIncomingRequests = function () {
    if (!$scope.me) return [];
    return DB.requests.filter(function (r) { return r.receiverId === $scope.me.id; });
  };

  $scope.getOutgoingRequests = function () {
    if (!$scope.me) return [];
    return DB.requests.filter(function (r) { return r.senderId === $scope.me.id; });
  };

  $scope.respond = function (reqId, status) {
    if (!$scope.me) return;
    respondRequest(reqId, status, $scope.me.name);
  };
});

// 6. Sessions Controller
app.controller("SessionsController", function ($scope, SessionSchedulingService) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.activeConnections = [];
  $scope.upcomingSessions = [];
  $scope.newSession = { connectionId: "", skill: "", date: "", time: "", location: "", notes: "" };

  $scope.init = function () {
    if (!$scope.me) return;
    $scope.activeConnections = SessionSchedulingService.getActiveConnections($scope.me.id);
    $scope.upcomingSessions = SessionSchedulingService.getUpcomingForStudent($scope.me.id);
  };

  $scope.scheduleNewSession = function () {
    if (!$scope.me || !$scope.newSession.connectionId) return;
    var conn = DB.connections.find(function (c) { return c.id === $scope.newSession.connectionId; });
    if (!conn) return;
    SessionSchedulingService.schedule(conn, $scope.me, $scope.newSession);
    $scope.init();
    $scope.newSession = { connectionId: "", skill: "", date: "", time: "", location: "", notes: "" };
  };

  $scope.init();
});

// 7. Profile Controller
app.controller("ProfileController", function ($scope) {
  $scope.me = getSession() ? studentById(getSession().id) : null;
  $scope.isEditing = false;
  $scope.editData = {};

  $scope.startEdit = function () {
    $scope.editData = angular.copy($scope.me);
    $scope.isEditing = true;
  };

  $scope.saveProfile = function () {
    if (!$scope.me) return;
    updateStudent($scope.me.id, {
      name: $scope.editData.name,
      department: $scope.editData.department,
      year: $scope.editData.year,
      bio: $scope.editData.bio,
      availability: $scope.editData.availability
    });
    $scope.me = studentById($scope.me.id);
    $scope.isEditing = false;
  };
});

// 8. Admin Users Controller
app.controller("AdminUsersController", function ($scope) {
  $scope.searchQuery = "";
  $scope.tabFilter = "all";
  $scope.students = DB.students;

  $scope.getFilteredStudents = function () {
    var q = ($scope.searchQuery || "").toLowerCase();
    return DB.students.filter(function (s) {
      var matchesSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.code || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if ($scope.tabFilter === "pending") return !s.verified;
      if ($scope.tabFilter === "blocked") return s.status === "Blocked" || s.status === "Suspended";
      return true;
    });
  };

  $scope.performAction = function (studentId, action) {
    adminStudentAction(studentId, action);
    $scope.students = DB.students;
  };
});

// 9. Admin Skills Controller
app.controller("AdminSkillsController", function ($scope) {
  $scope.categories = DB.categories;
  $scope.skills = DB.skills;
  $scope.newCatName = "";
  $scope.newSkillName = "";
  $scope.selectedCatId = DB.categories[0] ? DB.categories[0].id : "";

  $scope.addCategory = function () {
    if (!$scope.newCatName.trim()) return;
    adminCategoryAdd($scope.newCatName.trim());
    $scope.newCatName = "";
    $scope.categories = DB.categories;
  };

  $scope.deleteCategory = function (id) {
    adminCategoryDelete(id);
    $scope.categories = DB.categories;
  };

  $scope.addSkill = function () {
    if (!$scope.newSkillName.trim() || !$scope.selectedCatId) return;
    adminSkillAdd($scope.newSkillName.trim(), $scope.selectedCatId);
    $scope.newSkillName = "";
    $scope.skills = DB.skills;
  };

  $scope.deleteSkill = function (id) {
    adminSkillDelete(id);
    $scope.skills = DB.skills;
  };
});
