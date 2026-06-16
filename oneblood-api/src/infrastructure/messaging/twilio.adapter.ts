/**
 * TwilioAdapter — SMS notifications via Twilio Programmable Messaging.
 *
 * STATUS: STUBBED — uncomment and configure when Twilio is ready.
 *
 * To activate:
 *  1. Get a real TWILIO_ACCOUNT_SID (starts with AC...) and TWILIO_AUTH_TOKEN
 *     from https://console.twilio.com → Account Info
 *  2. Add a verified Twilio phone number as TWILIO_PHONE_NUMBER
 *  3. Run:  npm install twilio
 *  4. Uncomment this file and swap in ioc.container.ts:
 *       const messageSender = new TwilioAdapter();   // instead of NodemailerAdapter
 */

import { IMessageSender, OtpPayload, AlertPayload } from './message-sender.interface';

export class TwilioAdapter implements IMessageSender {
  // private readonly client: Twilio;

  constructor() {
    // const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = appConfig;
    // this.client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.warn('[TwilioAdapter] Twilio is not configured — SMS disabled. See comments in twilio.adapter.ts');
  }

  async sendOtp({ to, otp, expiresInMinutes = 10 }: OtpPayload): Promise<void> {
    // await this.client.messages.create({
    //   from: appConfig.TWILIO_PHONE_NUMBER,
    //   to,
    //   body: `Your OneBlood verification code: ${otp}. Valid for ${expiresInMinutes} min. Do not share.`,
    // });
    console.log(`[TwilioAdapter] sendOtp → ${to} | OTP: ${otp} | Expires: ${expiresInMinutes}m (stub — not sent)`);
  }

  async sendAlert({ to, body }: AlertPayload): Promise<void> {
    // await this.client.messages.create({
    //   from: appConfig.TWILIO_PHONE_NUMBER,
    //   to,
    //   body,
    // });
    console.log(`[TwilioAdapter] sendAlert → ${to} | "${body}" (stub — not sent)`);
  }
}
