import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOK_PATH = path.resolve('.tokens_google.json');
const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const redirect = process.env.OAUTH_REDIRECT || 'http://127.0.0.1:3535/oauth2/callback';

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirect);
const calendar = google.calendar({ version: 'v3', auth: oauth2 });

type Tokens = { access_token: string; refresh_token?: string; expiry_date?: number };
function saveTokens(t: Tokens){ fs.writeFileSync(TOK_PATH, JSON.stringify(t, null, 2)); }
function haveTokens(){ return fs.existsSync(TOK_PATH); }
function loadTokens(): Tokens { return JSON.parse(fs.readFileSync(TOK_PATH, 'utf8')); }

export async function beginGoogleInstall() {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  const url = oauth2.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });
  return url;
}

export async function oauthCallback(req:any, res:any) {
  try {
    const code = req.query.code as string;
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    saveTokens(tokens as Tokens);
    res.send('<script>close();</script>Connected. You can close this tab.');
  } catch (e:any) {
    res.status(500).send(e.message);
  }
}

function ensureAuth(){
  if (!haveTokens()) throw new Error('Google not connected yet');
  oauth2.setCredentials(loadTokens());
}

export async function listCalendars(){
  ensureAuth();
  const r = await calendar.calendarList.list();
  return (r.data.items || []).map(c => ({ id:c.id, summary:c.summary }));
}

export async function backfillCalendar(){
  ensureAuth();
  const now = new Date();
  const r = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime()+24*3600*1000).toISOString(),
    singleEvents: true, orderBy: 'startTime'
  });
  const items = r.data.items || [];
  console.log('[calendar] upcoming (24h):', items.map(e => e.summary));
  return items.length;
}

export async function createHold(calendarId:string, title:string, whenISO:string, durationMin:number){
  ensureAuth();
  const start = new Date(whenISO);
  const end = new Date(start.getTime() + durationMin*60*1000);
  const r = await calendar.events.insert({
    calendarId, requestBody: {
      summary: title || 'ROM Hold',
      start: { dateTime: start.toISOString() },
      end:   { dateTime: end.toISOString() },
      source: { title: 'ROM', url: 'https://rom-os.github.io/rom-preview/' },
      description: 'Created by ROM'
    }
  });
  return r.data;
}

