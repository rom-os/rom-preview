// assets/js/connectors.js
import { jfetch, uiStatus } from './api.js';


const googleBtn = document.getElementById('btn-google');
const slackBtn = document.getElementById('btn-slack');
const smsBtn = document.getElementById('btn-sms');


async function startOAuth(provider){
const { url } = await jfetch(`/api/${provider}/start`);
// remember current page; backend redirects back with ?connected=provider
sessionStorage.setItem('postConnectReturn', location.href);
location.href = url;
}


if (googleBtn) googleBtn.onclick = () => startOAuth('google');
if (slackBtn) slackBtn.onclick = () => startOAuth('slack');
if (smsBtn) smsBtn.onclick = async () => {
const to = prompt('Enter your phone (+1…)');
if (!to) return;
const data = await jfetch('/api/sms/send', { method:'POST', body:{ to, body: 'Hello from ROM!' }});
uiStatus('connect-status', `SMS: ${typeof data === 'string' ? data : 'sent'}`);
};


// mark connected status if redirected
(function markConnected() {
const params = new URLSearchParams(location.search);
const connected = params.get('connected');
if (connected) {
uiStatus('connect-status', `${connected} connected ✓`);
const ret = sessionStorage.getItem('postConnectReturn');
if (ret) { history.replaceState({}, '', ret); sessionStorage.removeItem('postConnectReturn'); }
}
})();
