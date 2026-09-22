(function () {
  const me = requireStudent();
  if (!me) return;
  renderShell("student", me);
  if (renderBlockedIfNeeded(me)) return;

  render();

  function render() {
    const incoming = DB.requests.filter((r) => r.receiverId === me.id);
    const outgoing = DB.requests.filter((r) => r.senderId === me.id);

    pageContent().innerHTML = `
      ${pageHead("Connection Requests", "Requests")}
      <div style="font-size:13px;font-weight:700;margin-bottom:10px;">Incoming</div>
      <div id="incomingBox">${incoming.length ? incoming.map(incomingCard).join("") : `<div class="empty-state">No incoming requests.</div>`}</div>

      <div style="font-size:13px;font-weight:700;margin:22px 0 10px;">Outgoing</div>
      <div>${outgoing.length ? outgoing.map(outgoingCard).join("") : `<div class="empty-state">You haven't sent any requests yet.</div>`}</div>
    `;

    document.querySelectorAll(".accept-btn").forEach((b) => b.addEventListener("click", () => { respondRequest(b.dataset.id, "Accepted", me.name); render(); }));
    document.querySelectorAll(".reject-btn").forEach((b) => b.addEventListener("click", () => { respondRequest(b.dataset.id, "Rejected", me.name); render(); }));
  }

  function incomingCard(r) {
    const from = studentById(r.senderId);
    if (!from) return "";
    const statusTone = r.status === "Pending" ? "gold" : r.status === "Accepted" ? "pine" : "red";
    return `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;">
          ${avatarHtml(from.name, from.avatarSeed, 44)}
          <div style="flex:1;min-width:220px;">
            <div style="font-weight:600;font-size:14.5px;">${escapeHtml(from.name)}</div>
            <div style="font-size:12.5px;color:var(--muted);margin:4px 0;">
              Offers to teach ${pillHtml(skillName(r.teachSkill), "pine")} in exchange for learning ${pillHtml(skillName(r.learnSkill), "gold")}
            </div>
            ${r.message ? `<div style="font-size:13px;font-style:italic;margin-top:6px;">"${escapeHtml(r.message)}"</div>` : ""}
            <div style="margin-top:8px;">${pillHtml(r.status, statusTone)}</div>
          </div>
          ${r.status === "Pending" ? `
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary accept-btn" data-id="${r.id}">✓ Accept</button>
            <button class="btn btn-danger reject-btn" data-id="${r.id}">✕ Reject</button>
          </div>` : ""}
        </div>
      </div>`;
  }

  function outgoingCard(r) {
    const to = studentById(r.receiverId);
    if (!to) return "";
    const statusTone = r.status === "Pending" ? "gold" : r.status === "Accepted" ? "pine" : "red";
    return `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;gap:12px;align-items:center;">
          ${avatarHtml(to.name, to.avatarSeed, 40)}
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;">${escapeHtml(to.name)}</div>
            <div style="font-size:12px;color:var(--muted);">You teach ${escapeHtml(skillName(r.teachSkill))} · you learn ${escapeHtml(skillName(r.learnSkill))}</div>
          </div>
          ${pillHtml(r.status, statusTone)}
        </div>
      </div>`;
  }
})();
