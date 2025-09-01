import { App } from '@slack/bolt';
let bolt = null;
export async function startSlack() {
    if (bolt)
        return;
    const appToken = process.env.SLACK_APP_TOKEN;
    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!appToken || !botToken)
        throw new Error('Missing Slack tokens');
    bolt = new App({ socketMode: true, appToken, token: botToken });
    bolt.event('message', async ({ event }) => {
        const msg = event;
        console.log('[slack] message', { text: msg.text, channel: msg.channel, ts: msg.ts });
    });
    await bolt.start();
    console.log('Slack Socket Mode connected.');
}
export async function slackBackfill() {
    if (!bolt)
        await startSlack();
    // add conversations.history here later; returning 0 keeps UI happy
    return 0;
}
