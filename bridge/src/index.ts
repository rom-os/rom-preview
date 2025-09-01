import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { beginGmailInstall, gmailCallback, gmailBackfill } from './gmail.js';
import { sendWhatsApp } from './whatsapp.js';
import { icalSubscribe, icalSync, icalList } from './ical.js';

const app = express();
app.use(cors());
app.use(express.json());

/* Health */
app.get('/health', (_req, res)=> res.json({ ok:true }));

/* Gmail */
app.get('/gmail/install', async (_req, res) => {
  try { const url = await beginGmailInstall(); res.json({ ok:true, url }); }
  catch (e:any){ res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/gmail/callback', gmailCallback);
app.post('/gmail/backfill', async (_req, res) => {
  try { const imported = await gmailBackfill(); res.json({ ok:true, imported }); }
  catch (e:any){ res.status(500).json({ ok:false, error:e.message }); }
});

/* WhatsApp (send only) */
app.post('/whatsapp/send', async (req, res) => {
  try { const { to, body } = req.body || {}; const r = await sendWhatsApp(to, body); res.json({ ok:true, sid:r.sid }); }
  catch (e:any){ res.status(500).json({ ok:false, error:e.message }); }
});

/* iCalendar */
app.post('/ical/subscribe', async (req, res) => {
  try { const { url, name } = req.body || {}; const subs = await icalSubscribe(url, name); res.json({ ok:true, subs }); }
  catch (e:any){ res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/ical/list', (_req, res) => { res.json({ ok:true, subs: icalList() }); });
app.post('/ical/sync', async (_req, res) => {
  try { const imported = await icalSync(); res.json({ ok:true, imported }); }
  catch (e:any){ res.status(500).json({ ok:false, error:e.message }); }
});

/* Placeholder routes for existing Google/Slack used by frontend */
app.get('/google/install', (_req, res)=> res.json({ ok:true, url: null }));
app.post('/google/backfill', (_req, res)=> res.json({ ok:true, imported: 0 }));
app.post('/google/hold', (_req, res)=> res.json({ ok:true }));
app.post('/slack/start', (_req, res)=> res.json({ ok:true }));
app.post('/slack/backfill', (_req, res)=> res.json({ ok:true, imported: 0 }));

const PORT = Number(process.env.PORT) || 3535;
app.listen(PORT, ()=> console.log(`ROM Bridge listening on http://127.0.0.1:${PORT}`));

