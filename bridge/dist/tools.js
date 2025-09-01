export function resonateReply(text) {
    const t = text.toLowerCase();
    if (/\b(1?\d(:\d\d)?\s?(am|pm))\b/.test(t))
        return 'Meet you there.';
    if (/\b(invoice|payment|overdue|bill)\b/.test(t))
        return 'Thanks—processing now, I’ll confirm once it’s paid.';
    if (/\b(review|draft|feedback|approve|look)\b/.test(t))
        return 'Got it—I’ll review and circle back shortly.';
    if (/\?\s*$/.test(text))
        return 'Good question—I’ll check and get back shortly.';
    return 'Noted—on it.';
}
function parseTimeISO(text) {
    const m = text.match(/\b(1?\d)(?::(\d{2}))?\s?(am|pm)\b/i);
    if (!m)
        return null;
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m[3].toLowerCase();
    if (ampm === 'pm' && h < 12)
        h += 12;
    if (ampm === 'am' && h === 12)
        h = 0;
    const now = new Date();
    now.setHours(h, min, 0, 0);
    // if time has already passed today, schedule tomorrow
    if (now.getTime() < Date.now() - 60 * 1000)
        now.setDate(now.getDate() + 1);
    return now.toISOString();
}
// Minimal “AI Talk” plan generator (rule-based MVP)
export async function makePlanFromText(text, ctx) {
    const reply = resonateReply(text);
    const whenISO = parseTimeISO(text);
    const actions = [];
    if (whenISO)
        actions.push({ tool: 'calendar.insert', args: { calendarId: 'primary', title: 'Hold', whenISO, durationMin: 30 } });
    if (ctx?.source === 'slack' && ctx.channel)
        actions.push({ tool: 'reply.slack', args: { channel: ctx.channel, text: reply, threadTs: ctx.threadTs } });
    if (ctx?.source === 'sms' && ctx.to)
        actions.push({ tool: 'sms.send', args: { to: ctx.to, body: reply } });
    return { previewReply: reply, actions };
}
