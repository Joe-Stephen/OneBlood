import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { appConfig } from '@config';
import { IMessageSender, OtpPayload, AlertPayload } from './message-sender.interface';

/**
 * NodemailerAdapter
 *
 * Sends emails via SMTP (works with Gmail, Outlook, Mailtrap, etc.).
 * For local dev: use Mailtrap (free) or Gmail app-password.
 * For production: swap SMTP_HOST to AWS SES / SendGrid / Postmark.
 */
export class NodemailerAdapter implements IMessageSender {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host:   appConfig.SMTP_HOST,
      port:   appConfig.SMTP_PORT,
      secure: appConfig.SMTP_PORT === 465, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user: appConfig.SMTP_USER,
        pass: appConfig.SMTP_PASS,
      },
    });
  }

  // ─── OTP ─────────────────────────────────────────────────────────────────────

  async sendOtp({ to, otp, name = 'Donor', expiresInMinutes = 10 }: OtpPayload): Promise<void> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#f4f4f6;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:32px;">🩸</span>
          <h2 style="color:#ef4444;margin:8px 0 0;font-size:22px;">OneBlood Verification</h2>
        </div>
        <p style="color:#9494a8;font-size:15px;">Hi <strong style="color:#f4f4f6;">${name}</strong>,</p>
        <p style="color:#9494a8;font-size:15px;">Your one-time verification code is:</p>
        <div style="background:#1a1a24;border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
          <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#ef4444;">${otp}</span>
        </div>
        <p style="color:#9494a8;font-size:13px;">This code expires in <strong style="color:#f4f4f6;">${expiresInMinutes} minutes</strong>. Never share it with anyone.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
        <p style="color:#5a5a70;font-size:12px;text-align:center;">OneBlood Foundation · India · Non-profit</p>
      </div>
    `;

    await this.send({
      to,
      subject: `${otp} — Your OneBlood verification code`,
      html,
    });
  }

  // ─── Alert ───────────────────────────────────────────────────────────────────

  async sendAlert({ to, subject = 'OneBlood Notification', body }: AlertPayload): Promise<void> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0f;color:#f4f4f6;border-radius:12px;">
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-size:28px;">🩸</span>
          <h2 style="color:#ef4444;margin:8px 0 0;font-size:18px;">OneBlood</h2>
        </div>
        <div style="background:#1a1a24;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;">
          <p style="color:#f4f4f6;font-size:15px;margin:0;line-height:1.6;">${body}</p>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
        <p style="color:#5a5a70;font-size:12px;text-align:center;">OneBlood Foundation · India · Non-profit</p>
      </div>
    `;

    await this.send({ to, subject, html });
  }

  // ─── Internal ─────────────────────────────────────────────────────────────────

  private async send(opts: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: `"OneBlood 🩸" <${appConfig.SMTP_FROM}>`,
      ...opts,
    });
  }

  /** Verify SMTP connection on startup */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (err) {
      console.warn('⚠️  SMTP connection failed (email disabled):', (err as Error).message);
      return false;
    }
  }
}
