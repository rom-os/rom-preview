// assets/js/chat.js
import { jfetch } from './api.js';


const box = document.getElementById('chat-box');
const modelSel = document.getElementById('model');
const personaSel = document.getElementById('persona');
const promptEl = document.getElementById('prompt');
const sendBtn = document.getElementById('send');


// simple per-user prefs (local only; not global)
const PREF_KEY = 'rom_user_prefs_v1';
const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
if (prefs.model) modelSel.value = prefs.model;
if (prefs.persona) personaSel.value = prefs.persona;


function savePrefs(){
localStorage.setItem(PREF_KEY, JSON.stringify({ model: modelSel.value, persona: personaSel.value }));
}


function append(role, text){
const div = document.createElement('div');
div.className = `chat-msg ${role}`;
div.textContent = text;
box.appendChild(div);
box.scrollTop = box.scrollHeight;
}


async function send(){
const text = promptEl.value.trim();
if (!text) return;
append('user', text);
promptEl.value='';
savePrefs();
try {
const data = await jfetch('/api/llm/chat', {
method: 'POST',
body: { prompt: text, model: modelSel.value, persona: personaSel.value }
});
append('ai', data.reply || String(data));
} catch (e) {
append('ai', 'Error contacting model.');
console.error(e);
}
}


sendBtn.onclick = send;
promptEl.addEventListener('keydown', (e)=>{ if (e.key==='Enter') send(); });
