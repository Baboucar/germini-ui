// src/main.js — GemMini UI (Eternium-only)

import { r } from "solarite/dist/Solarite.js";

const API = "https://gemmini-query.baboucarr-lab.workers.dev";

/* ─── reactive state ─────────────────────────────── */
const state = { prompt:"", sql:"", rows:[], error:"", loading:false, intro:true };
const set   = patch => { Object.assign(state, patch); render(); };

/* ─── helpers ────────────────────────────────────── */
const isImg      = key => /(?:img|image|_url)$/i.test(key);
const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23ddd'/%3E%3C/svg%3E";

/** Strip everything after the first comma (fixes “cargo,abcd1234” URLs) */
const cleanURL = url => {
  if (typeof url !== "string") return placeholder;
  const [head] = url.split(",");
  return head || placeholder;
};

function exportCSV () {
  if (!state.rows.length) return;
  const cols = Object.keys(state.rows[0]);
  const csv  = [cols.join(","), ...state.rows.map(r => cols.map(c => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
  const url  = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
  Object.assign(document.createElement("a"), { href:url, download:"gemmini-results.csv" }).click();
  setTimeout(()=>URL.revokeObjectURL(url), 2_000);
}

async function run () {
  if (!state.prompt.trim() || state.loading) return;
  set({ loading:true, error:"" });

  try {
    const res = await fetch(API, {
      method :"POST",
      headers:{ "Content-Type":"application/json" },
      body   :JSON.stringify({ prompt:state.prompt })
    });
    if (!res.ok) throw new Error(await res.text());
    const { sql, rows } = await res.json();
    set({ sql, rows, loading:false, intro:false });
  } catch (e) {
    set({ error:e.message || "Unexpected error", sql:"", rows:[], loading:false });
  }
}

/* ─── render ─────────────────────────────────────── */
function render () {
  r(document.getElementById("app"))`
    <section class="eternium col gap-big pad big center-h px1100 pc95-mobile">
      <h1 class="bold big">GemMini Query</h1>

      <textarea rows="4" class="input big w-full"
        placeholder="Ask a question…"
        value="${()=>state.prompt}"
        oninput=${e=>set({prompt:e.target.value})}></textarea>

      <button class="button primary big w-full"
        onclick=${run}
        disabled="${()=>state.loading}">
        ${()=>state.loading?"Running…":"Run"}
      </button>

      ${()=>state.intro && !state.error && r`
        <p class="info-alert w-full">
          Try queries like <code>shipments from France last week</code> or
          <code>total quantity per supplier</code>.
        </p>`}

      ${()=>state.error && r`<p class="error-alert w-full">${state.error}</p>`}

      ${()=>state.sql && !state.error && r`
        <pre class="card pad-small w-full overflow-x-auto">${state.sql}</pre>`}

      ${()=>state.rows.length && !state.error && r`
        <div class="row space-between center-v w-full">
          <span class="little muted">${state.rows.length} rows</span>
          <button class="primary pad" onclick=${exportCSV}>Export CSV</button>
          
        </div>
         <div class="pad"></div>

        <div class="card overflow-x-auto w-full">
          <table class="data-table w-full text-small">
            <thead>
              <tr>${Object.keys(state.rows[0]).map(k=>r`<th>${k}</th>`)}</tr>
            </thead>
            <tbody>
              ${state.rows.map(row => r`
                <tr>
                  ${Object.entries(row).map(([k,v]) => r`
                    <td>
                      ${isImg(k)
                        ? r`<img src="${cleanURL(v)}"
                                 style="height:48px;width:48px;object-fit:cover">`
                        : v}
                    </td>`)}
                </tr>`)}
            </tbody>
          </table>
        </div>`}
    </section>`;
}

render();
