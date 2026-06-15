import crypto from 'crypto';
import { RedisCache } from '@infrastructure/redis/redis.cache';
import { IMessageSender } from '@infrastructure/messaging/message-sender.interface';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const OTP_LENGTH = 6;

export class OtpService {
  constructor(
    private readonly messageSender: IMessageSender,
    private readonly cache: RedisCache,
  ) {}

  /**
   * Generate a numeric OTP, store it in Redis, and send it via the active adapter.
   * Key: `otp:{purpose}:{identifier}` e.g. `otp:verify-phone:+91xxxxxxxxxx`
   */
  async send(identifier: string, purpose: string, recipientName?: string): Promise<void> {
    const otp = this.generate();
    const key = this.cacheKey(purpose, identifier);

    // Store hashed OTP in Redis
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    await this.cache.set(key, hashed, OTP_TTL_SECONDS);

    await this.messageSender.sendOtp({
      to: identifier,
      otp,
      name: recipientName,
      expiresInMinutes: OTP_TTL_SECONDS / 60,
    });
  }

  /**
   * Verify OTP — returns true and deletes the key on success,
   * throws if invalid or expired.
   */
  async verify(identifier: string, purpose: string, otp: string): Promise<true> {
    const key    = this.cacheKey(purpose, identifier);
    const stored = await this.cache.get<string>(key);

    if (!stored) {
      throw new Error('OTP expired or not found');
    }

    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(stored))) {
      throw new Error('Invalid OTP');
    }

    await this.cache.del(key);
    return true;
  }

  private generate(): string {
    return String(crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH));
  }

  private cacheKey(purpose: string, identifier: string): string {
    return `otp:${purpose}:${identifier}`;
  }
}
