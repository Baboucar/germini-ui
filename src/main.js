// src/main.js – GemMini UI using **Eternium** layout utilities only
// – Run button now forced onto its own line
// – Container stops growing at 1100 px (px1100) and is centred
// – Strict Eternium class names from docs: https://vorticode.github.io/eternium/

import { r } from "solarite/dist/Solarite.js";

const API = "https://gemmini-query.baboucarr-lab.workers.dev";

const state = {
  prompt: "",
  sql: "",
  rows: [],
  error: "",
  loading: false,
  intro: true
};

const set = patch => {
  Object.assign(state, patch);
  render();
};

/* ───────── actions ───────── */
async function run() {
  if (!state.prompt.trim() || state.loading) return;
  set({ loading: true, error: "" });

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: state.prompt })
    });
    if (!res.ok) throw new Error(await res.text());
    const { sql, rows } = await res.json();
    set({ sql, rows, loading: false, intro: false });
  } catch (err) {
    set({ error: err.message || "Unexpected error", sql: "", rows: [], loading: false });
  }
}

function exportCSV() {
  if (!state.rows.length) return;
  const cols = Object.keys(state.rows[0]);
  const csv = [cols.join(",")].concat(
    state.rows.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))
  ).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "query-result.csv" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ───────── render ───────── */
function render() {
  r(document.getElementById("app"))`
    <section class="eternium col gap-big pad big pc75 pc75-mobile center-h">
      <h1 class="text-4xl font-bold">GemMini&nbsp;Query</h1>

      <!-- prompt + run (column) -->
      <textarea rows="3" class="input big w-full" placeholder="Ask a question…"
        value="${() => state.prompt}"
        oninput=${e => set({ prompt: e.target.value })}></textarea>

      <button class="button primary big w-full" onclick=${run} disabled="${() => state.loading}">
        ${() => (state.loading ? "Running…" : "Run")}
      </button>

      <!-- helper banner -->
      ${() => state.intro && !state.loading && !state.error && r`
        <div class="info-alert w-full">Try queries like <code>total quantity per supplier</code> or <code>shipments from France</code>.</div>`}

      ${() => state.error && r`<div class="error-alert w-full">${state.error}</div>`}

      ${() => state.sql && !state.error && r`<pre class="card pad-small w-full overflow-x-auto">${state.sql}</pre>`}

      ${() => state.rows.length && !state.error && r`
        <div class="row space-between center-v w-full">
          <span class="little muted">${state.rows.length} rows</span>
          <button class="primary pad" onclick=${exportCSV}>Export&nbsp;CSV</button>
        </div>
        <div class="card overflow-x-auto w-full">
          <table class="data-table w-full text-small">
            <thead><tr>${Object.keys(state.rows[0]).map(k => r`<th>${k}</th>`)}</tr></thead>
            <tbody>${state.rows.map(row => r`<tr>${Object.values(row).map(v => r`<td>${v}</td>`)}</tr>`)}</tbody>
          </table>
        </div>`}
    </section>`;
}

render();