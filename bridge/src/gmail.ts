import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOK_PATH = path.resolve('.tokens_gmail.json');
const clientId = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const redirect = process.env.GMAIL_OAUTH_REDIRECT || 'http://127.0.0.1:3535/gmail/callback';

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirect);
const gmail = google.gmail({ version: 'v1', auth: oauth2 });

type Tokens = { access_token: string; refresh_token?: string; expiry_date?: number };
function saveTokens(t: Tokens){ fs.writeFileSync(TOK_PATH, JSON.stringify(t, null, 2)); }
function haveTokens(){ return fs.existsSync(TOK_PATH); }
function loadTokens(): Tokens { return JSON.parse(fs.readFileSync(TOK_PATH, 'utf8')); }

export async function beginGmailInstall(){
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly'
    // add 'https://www.googleapis.com/auth/gmail.send' when you’re ready to send from API
  ];
  const url = oauth2.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });
  return url;
}

export async function gmailCallback(req:any, res:any){
  try{
    const code = req.query.code as string;
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    saveTokens(tokens as Tokens);
    res.send('<script>close();</script>Gmail connected. You can close this tab.');
  }catch(e:any){
    res.status(500).send(e.message);
  }
}

function ensureAuth(){
  if (!haveTokens()) throw new Error('Gmail not connected yet');
  oauth2.setCredentials(loadTokens());
}

export async function gmailBackfill(): Promise<number> {
  ensureAuth();
  // Just count last ~50 messages in inbox (demo backfill)
  const list = await gmail.users.messages.list({ userId: 'me', maxResults: 50, q: 'newer_than:30d' });
  const msgs = list.data.messages || [];
  console.log('[gmail] backfill count:', msgs.length);
  return msgs.length;
}
