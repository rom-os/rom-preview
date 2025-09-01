import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { startSlack, slackBackfill } from './slack.js';
import { beginGoogleInstall, oauthCallback, listCalendars, createHold, backfillCalendar } from './google.js';
import { beginGmailInstall, gmailCallback, gmailBackfill } from './gmail.js';
import { sendSms } from './sms.js';
import { sendWhatsApp } from './whatsapp.js';
import { icalSubscribe, icalSync, icalList } from './ical.js';
import { makePlanFromText } from './tools.js';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: true, methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use((req, res, next) => { res.setHeader('Access-Control-Allow-Private-Network', 'true'); if (req.method==='OPTIONS') return res.sendStatus(204); next(); });

const PORT = 3535;

/* Health */
app.get('/health', (_req, res) => res.json({ ok: true }));

/* Slack */
app.post('/slack/start', async (_req, res) => { try { await startSlack(); res.json({ ok: true }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.post('/slack/backfill', async (_req, res) => { try { const imported = await slackBackfill(); res.json({ ok:true, imported }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});

/* Google Calendar */
app.get('/google/install', async (_req, res) => { try { const url = await beginGoogleInstall(); res.json({ ok:true, url }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.get('/oauth2/callback', oauthCallback);
app.get('/google/calendars', async (_req, res) => { try { res.json({ ok:true, calendars: await listCalendars() }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.post('/google/backfill', async (_req, res) => { try { const imported = await backfillCalendar(); res.json({ ok:true, imported }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.post('/google/hold', async (req, res) => { try { const { calendarId='primary', title, whenISO, durationMin=30 } = req.body||{}; const event = await createHold(calendarId, title, whenISO, durationMin); res.json({ ok:true, event }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});

/* Gmail */
app.get('/gmail/install', async (_req, res) => { try { const url = await beginGmailInstall(); res.json({ ok:true, url }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.get('/gmail/callback', gmailCallback);
app.post('/gmail/backfill', async (_req, res) => { try { const imported = await gmailBackfill(); res.json({ ok:true, imported }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});

/* SMS & WhatsApp */
app.post('/sms/send', async (req, res) => { try { const { to, body } = req.body; const r = await sendSms(to, body); res.json({ ok:true, sid:r.sid }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.post('/whatsapp/send', async (req, res) => { try { const { to, body } = req.body; const r = await sendWhatsApp(to, body); res.json({ ok:true, sid:r.sid }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});

/* iCalendar */
app.post('/ical/subscribe', async (req, res) => { try { const { url, name } = req.body || {}; const subs = await icalSubscribe(url, name); res.json({ ok:true, subs }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});
app.get('/ical/list', (_req, res) => { res.json({ ok:true, subs: icalList() }); });
app.post('/ical/sync', async (_req, res) => { try { const imported = await icalSync(); res.json({ ok:true, imported }); } catch(e:any){ res.status(500).json({ ok:false, error:e.message }); }});

/* AI Talk */
app.post('/ai/talk', async (req, res) => { const { text, context } = req.body || {}; const plan = await makePlanFromText(text || '', context || {}); res.json({ ok:true, plan }); });

app.listen(PORT, () => console.log(`ROM Bridge → http://127.0.0.1:${PORT}`));

