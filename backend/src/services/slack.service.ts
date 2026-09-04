import { WebClient } from '@slack/web-api';
import { env } from '../config/env';

/**
 * Builds the Slack OAuth authorize URL.
 */
export function getSlackOAuthUrl(state: string): string {
  const scopes = ['chat:write', 'channels:read', 'users:read'];
  return `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&user_scope=${scopes.join(',')}&redirect_uri=${env.SLACK_REDIRECT_URI}&state=${state}`;
}

/**
 * Exchanges an OAuth code for an access token.
 */
export async function exchangeSlackCode(code: string): Promise<{ accessToken: string; teamName: string; botUserId: string }> {
  const client = new WebClient();
  const response = await client.oauth.v2.access({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: env.SLACK_REDIRECT_URI,
  });

  if (!response.ok) {
    throw new Error(`Slack OAuth error: ${response.error}`);
  }

  return {
    accessToken: response.authed_user?.access_token || '',
    teamName: response.team?.name || 'Unknown Team',
    botUserId: response.authed_user?.id || '',
  };
}

/**
 * Sends a rate limit alert message to a Slack channel or user.
 */
export async function sendRateLimitAlert(slackToken: string, channel: string, senderEmail: string, limit: number, count: number): Promise<void> {
  const client = new WebClient(slackToken);
  
  try {
    await client.chat.postMessage({
      channel,
      text: `⚠️ *Rate Limit Alert* ⚠️\nSender ${senderEmail} has hit the hourly limit of ${limit} emails (Current count: ${count}). Further emails have been delayed to the next hour.`,
    });
  } catch (error) {
    console.error('❌ Error sending Slack alert:', error);
  }
}
