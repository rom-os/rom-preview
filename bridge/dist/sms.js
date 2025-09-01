import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const client = twilio(accountSid, authToken);
export async function sendSms(to, body) {
    if (!fromNumber && !messagingServiceSid)
        throw new Error('Configure TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID');
    return client.messages.create({
        to, body,
        from: fromNumber || undefined,
        messagingServiceSid: messagingServiceSid || undefined
    });
}
