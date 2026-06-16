import jwt from 'jsonwebtoken';
import { appConfig } from '@config';
import { RedisCache } from '@infrastructure/redis/redis.cache';
import { OtpService } from '@infrastructure/messaging/otp.service';
import { AuthRepository } from './auth.repository';
import { AuthUser, TokenPair, GoogleProfile } from './auth.types';
import { UnauthorizedError } from '@shared/errors';

export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly cache: RedisCache,
    private readonly otpService: OtpService,
  ) {}

  async loginWithGoogle(profile: GoogleProfile): Promise<{ tokens: TokenPair; user: AuthUser; isProfileComplete: boolean }> {
    const user = await this.authRepo.upsertUser(profile);
    const isProfileComplete = await this.authRepo.hasProfile(user.id);

    const authUser: AuthUser = {
      id:       user.id,
      email:    user.email,
      name:     user.name,
      role:     user.role,
      googleId: user.google_id,
    };

    const tokens = this.generateTokens(authUser);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: authUser, isProfileComplete };
  }

  async sendOtp(email: string, name?: string): Promise<void> {
    await this.otpService.send(email, 'auth', name);
    if (name) {
      await this.cache.set(`signup-name:${email}`, name, 10 * 60); // 10 minutes cache
    }
  }

  async verifyOtp(email: string, code: string): Promise<{ tokens: TokenPair; user: AuthUser; isProfileComplete: boolean }> {
    await this.otpService.verify(email, 'auth', code);

    let user = await this.authRepo.findByEmail(email);
    if (!user) {
      // Register new user
      const signupName = await this.cache.get<string>(`signup-name:${email}`) || 'New User';
      await this.cache.del(`signup-name:${email}`); // Clean up cache
      
      user = await this.authRepo.createUser({
        name: signupName,
        email,
        googleId: 'local:' + email,
      });
    }

    const isProfileComplete = await this.authRepo.hasProfile(user.id);

    const authUser: AuthUser = {
      id:       user.id,
      email:    user.email,
      name:     user.name,
      role:     user.role,
      googleId: user.google_id,
    };

    const tokens = this.generateTokens(authUser);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: authUser, isProfileComplete };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    let decoded: AuthUser;
    try {
      decoded = jwt.verify(refreshToken, appConfig.JWT_REFRESH_SECRET) as AuthUser;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await this.cache.get<string>(`session:${decoded.id}`);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedError('Refresh token revoked or not found');
    }

    const user = await this.authRepo.findById(decoded.id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Account not found or suspended');
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, googleId: user.google_id },
      appConfig.JWT_SECRET,
      { expiresIn: appConfig.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return { accessToken, expiresIn: 3600 };
  }

  async logout(userId: string, token: string): Promise<void> {
    // Blacklist current access token
    await this.cache.set(`blacklist:${token}`, '1', 3600);
    // Remove refresh token
    await this.cache.del(`session:${userId}`);
  }

  private generateTokens(user: AuthUser): TokenPair {
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, googleId: user.googleId };

    const accessToken = jwt.sign(payload, appConfig.JWT_SECRET, {
      expiresIn: appConfig.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, appConfig.JWT_REFRESH_SECRET, {
      expiresIn: appConfig.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);

    return { accessToken, refreshToken, expiresIn: 3600 };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    // 30 days in seconds
    await this.cache.set(`session:${userId}`, token, 30 * 24 * 60 * 60);
  }
}
