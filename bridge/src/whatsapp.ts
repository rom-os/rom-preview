import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken  = process.env.TWILIO_AUTH_TOKEN!;
const fromWa     = process.env.TWILIO_WA_FROM; // e.g., 'whatsapp:+1415...'

const client = twilio(accountSid, authToken);

export async function sendWhatsApp(toWa:string, body:string){
  if (!fromWa) throw new Error('Configure TWILIO_WA_FROM (whatsapp:+1...)');
  if (!toWa.startsWith('whatsapp:')) toWa = 'whatsapp:' + toWa.replace(/^whatsapp:/,'');
  return client.messages.create({ from: fromWa, to: toWa, body });
}
