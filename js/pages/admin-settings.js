(function () {
  if (!requireAdmin()) return;
  renderShell("admin", null);

  pageContent().innerHTML = `
    ${pageHead("Admin", "Settings")}
    <div class="card" style="max-width:480px;margin-bottom:16px;">
      <p style="font-size:13.5px;color:var(--muted);line-height:1.6;">
        This is a demo build of SkillSwap. Data is stored in your browser's local storage, so it stays on this
        device only and resets if you clear it.
      </p>
    </div>
    <div class="card" style="max-width:480px;">
      <div style="font-size:13px;font-weight:700;margin-bottom:8px;">Reset demo data</div>
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:12px;">Restore all students, requests, and reports to their original seed values. This cannot be undone.</p>
      <button class="btn btn-danger" id="resetBtn">Reset all data</button>
    </div>
  `;
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("This will erase all changes and restore the original demo data. Continue?")) {
      resetDB();
      clearSession();
      window.location.href = "index.html";
    }
  });
})();
