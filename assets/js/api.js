// assets/js/api.js
export const API_BASE = 'https://<YOUR-VERCEL-API>'; // e.g. https://rom-connectors.vercel.app


export async function jfetch(path, opts={}) {
const r = await fetch(`${API_BASE}${path}`, {
credentials: 'include',
headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
method: opts.method || 'GET',
body: opts.body ? JSON.stringify(opts.body) : undefined
});
if (!r.ok) throw new Error(await r.text());
return r.headers.get('content-type')?.includes('application/json') ? r.json() : r.text();
}


export function uiStatus(id, msg){
const el = document.getElementById(id);
if (el) el.textContent = msg;
}
