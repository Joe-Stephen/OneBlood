/**
 * IMessageSender — adapter interface for notification delivery.
 *
 * Implementations:
 *  - NodemailerAdapter  (active — email via SMTP/Gmail)
 *  - TwilioAdapter      (stubbed — uncomment when Twilio is configured)
 *
 * Swap the active adapter in ioc.container.ts without touching any business logic.
 */

export interface OtpPayload {
  to: string;        // email or phone number depending on adapter
  otp: string;
  name?: string;
  expiresInMinutes?: number;
}

export interface AlertPayload {
  to: string;
  subject?: string;  // used by email adapter
  body: string;
}

export interface IMessageSender {
  /** Send a one-time password for verification */
  sendOtp(payload: OtpPayload): Promise<void>;

  /** Send a general notification / donor alert */
  sendAlert(payload: AlertPayload): Promise<void>;
}
