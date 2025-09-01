import ical from 'node-ical';
import fs from 'fs';
import path from 'path';

const SUB_PATH = path.resolve('.ical_subscriptions.json');
type Sub = { url: string, name?: string };
type Store = { subs: Sub[] };

function load(): Store {
  try { return JSON.parse(fs.readFileSync(SUB_PATH,'utf8')); } catch { return { subs: [] }; }
}
function save(s: Store){ fs.writeFileSync(SUB_PATH, JSON.stringify(s,null,2)); }

export async function icalSubscribe(url:string, name?:string){
  const s = load();
  if (!s.subs.find(x=>x.url===url)) s.subs.push({ url, name });
  save(s);
  return s.subs;
}

export function icalList(){ return load().subs; }

export async function icalSync(): Promise<number> {
  const s = load();
  let count = 0;
  for (const sub of s.subs) {
    try {
      const data = await ical.async.fromURL(sub.url);
      const events = Object.values(data).filter((e:any)=> e.type === 'VEVENT');
      count += events.length;
      console.log(`[ical] ${sub.name||sub.url} → ${events.length} events`);
    } catch (e:any) {
      console.warn('[ical] failed', sub.url, e.message);
    }
  }
  return count;
}
