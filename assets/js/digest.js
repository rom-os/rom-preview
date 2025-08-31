// assets/js/digest.js
import { jfetch } from './api.js';


const statsEl = document.getElementById('digest-stats');
const itemsEl = document.getElementById('digest-items');
const actsEl = document.getElementById('digest-actions');


function renderItem(i){
if (i.type === 'calendar_conflict') return `Conflict: ${i.title} — ${new Date(i.when).toLocaleString()}`;
if (i.type === 'slack_mention') return `@${i.from}: ${i.text}`;
if (i.type === 'sms_todo') return `SMS from ${i.from}: ${i.text}`;
return JSON.stringify(i);
}


function render(){ /* no-op; placeholder if you add filters */ }


async function loadDigest(){
try {
const { stats, items, actions } = await jfetch('/api/digest/preview');
statsEl.textContent = `${stats.meetingsTomorrow} meetings tomorrow • ${stats.mentions} Slack mentions • ${stats.smsTodos} SMS todos`;
itemsEl.innerHTML = items.map(i => `<li>${renderItem(i)}</li>`).join('');
actsEl.innerHTML = '';
actions.forEach(a => {
const btn = document.createElement('button');
btn.textContent = a.label;
btn.onclick = async () => {
try {
await jfetch(`/api/actions/${a.kind}`, { method:'POST', body: a.payload });
btn.textContent = 'Done ✓';
} catch (e) {
btn.textContent = 'Failed';
console.error(e);
}
};
actsEl.appendChild(btn);
});
} catch (e) {
statsEl.textContent = 'Connect your apps to see a digest.';
}
}


loadDigest();
