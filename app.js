const REFRESH_MS = 15_000;
const STAGES = ["prompting", "cloud_agent", "verifying", "merging", "done"];
const STAGE_LABEL = {
  prompting: "prompting",
  cloud_agent: "cloud agent",
  verifying: "verifying",
  merging: "merging",
  done: "done",
};

const $ = (id) => document.getElementById(id);
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function ago(iso) {
  const t = Date.parse(iso || "");
  if (!Number.isFinite(t)) return "";
  const m = Math.round((Date.now() - t) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function stagePill(stage) {
  const s = STAGES.includes(stage) ? stage : "prompting";
  return `<span class="stage-pill stage-${s}">${esc(STAGE_LABEL[s] || s)}</span>`;
}

function botStrip(tasks, botNames) {
  const names = botNames?.length ? botNames : ["Ghost", "Marauder", "Marine", "Reaper"];
  const active = tasks.filter((t) => t.stage !== "done");
  return names
    .map((name) => {
      const t = active.find((x) => x.owner === name);
      if (!t) {
        return `<div class="bot"><div class="name">${esc(name)}</div><div class="idle">idle</div></div>`;
      }
      return `<div class="bot"><div class="name">${esc(name)}</div><div class="task">${esc(t.name)}</div>${stagePill(t.stage)}</div>`;
    })
    .join("");
}

function renderTasks(tasks) {
  const active = tasks.filter((t) => t.stage !== "done");
  const recentDone = tasks
    .filter((t) => t.stage === "done")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 6);
  const show = [...active, ...recentDone];
  $("tasks-count").textContent = `${active.length} active`;

  if (!show.length) {
    $("tasks").innerHTML = '<div class="empty">No tasks yet — EL seeds data/board.json</div>';
    return;
  }

  $("tasks").innerHTML = show
    .map((t) => {
      const pr = t.pr
        ? `<a href="${esc(t.pr_url || `https://github.com/CamoSnipe200/Synesis/pull/${t.pr}`)}" target="_blank" rel="noopener">#${esc(t.pr)}</a>`
        : "";
      const blocker = t.blocker ? `<div class="blocker">${esc(t.blocker)}</div>` : "";
      return `<article class="task ${t.stage === "done" ? "done" : ""}">
        <div>
          <div class="name">${esc(t.name)}</div>
          <div class="owner">${esc(t.owner)}</div>
        </div>
        <div class="right">
          ${stagePill(t.stage)}
          ${pr}
          <div class="when">${esc(ago(t.updatedAt))}</div>
        </div>
        ${blocker}
      </article>`;
    })
    .join("");
}

function renderTodos(todos) {
  const list = [...(todos || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const open = list.filter((t) => !t.done).length;
  $("todos-count").textContent = `${open} open`;
  if (!list.length) {
    $("todos").innerHTML = '<li class="empty">No V1 todos</li>';
    return;
  }
  $("todos").innerHTML = list
    .map((t) => {
      const text = t.link
        ? `<a href="${esc(t.link)}" target="_blank" rel="noopener">${esc(t.text)}</a>`
        : esc(t.text);
      return `<li class="${t.done ? "done" : ""}"><span class="box" aria-hidden="true"></span><span class="text">${text}</span></li>`;
    })
    .join("");
}

function renderReceipts(receipts) {
  if (!receipts?.length) {
    $("receipts").innerHTML = '<div class="empty">No receipts yet</div>';
    return;
  }
  $("receipts").innerHTML = receipts
    .map(
      (r) => `<a class="receipt" href="${esc(r.thumb)}" target="_blank" rel="noopener">
        <img src="${esc(r.thumb)}" alt="${esc(r.task)}" loading="lazy" />
        <div class="cap">${esc(r.task)}<span>${esc(ago(r.at))}</span></div>
      </a>`
    )
    .join("");
}

function renderHistory(history) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const items = [...(history || [])]
    .filter((h) => Date.parse(h.at) >= cutoff)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  if (!items.length) {
    $("history").innerHTML = '<li class="empty">No history in the last 7 days</li>';
    return;
  }
  $("history").innerHTML = items
    .map((h) => {
      const cls = h.event === "merged" ? "merged" : h.event === "prove" ? "prove" : "stage";
      return `<li class="${cls}">
        <div class="what">${esc(h.task)}${h.owner ? ` · ${esc(h.owner)}` : ""}</div>
        <div class="detail">${esc(h.detail || h.event)}</div>
        <div class="when">${esc(ago(h.at))}</div>
      </li>`;
    })
    .join("");
}

async function load() {
  try {
    const res = await fetch("./board.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const board = await res.json();
    $("bots").innerHTML = botStrip(board.tasks || [], board.bots);
    renderTasks(board.tasks || []);
    renderTodos(board.v1_todos || []);
    renderReceipts(board.receipts || []);
    renderHistory(board.history || []);
    $("meta").textContent = `Updated ${board.updatedAt || "—"}`;
    $("footer").textContent = `Canonical: data/board.json · ${board.updatedBy || "EL/eng bots"} · refresh ${REFRESH_MS / 1000}s`;
  } catch (err) {
    $("meta").textContent = `Load failed: ${err.message}`;
  }
}

load();
setInterval(load, REFRESH_MS);
