import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { success } from '@shared/utils/response.util';
import { appConfig } from '@config';

// Thin Google OAuth client wrapper for production use
async function exchangeCodeForProfile(code: string, redirectUri: string) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirect_uri:  redirectUri,
      client_id:     appConfig.GOOGLE_CLIENT_ID,
      client_secret: appConfig.GOOGLE_CLIENT_SECRET,
      grant_type:    'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) throw new Error('Failed to fetch Google profile');
  return profileRes.json() as Promise<{ id: string; email: string; name: string; picture?: string }>;
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  google = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, redirectUri } = req.body as { code: string; redirectUri: string };
      const profile = await exchangeCodeForProfile(code, redirectUri);

      const { tokens, user, isProfileComplete } = await this.authService.loginWithGoogle(profile);

      // Set httpOnly cookies
      const isProd = appConfig.NODE_ENV === 'production';
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: tokens.expiresIn * 1000,
      });
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.cookie('user_role', user.role, {
        secure: isProd,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(success({
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn:    tokens.expiresIn,
        user:         { ...user, isProfileComplete },
      }));
    } catch (err) {
      next(err);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name } = req.body as { email: string; name?: string };
      await this.authService.sendOtp(email, name);
      res.status(200).json(success(null, 'OTP sent successfully'));
    } catch (err) {
      next(err);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code } = req.body as { email: string; code: string };
      const { tokens, user, isProfileComplete } = await this.authService.verifyOtp(email, code);

      // Set httpOnly cookies
      const isProd = appConfig.NODE_ENV === 'production';
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: tokens.expiresIn * 1000,
      });
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.cookie('user_role', user.role, {
        secure: isProd,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(success({
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn:    tokens.expiresIn,
        user:         { ...user, isProfileComplete },
      }));
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token ?? (req.body as { refreshToken?: string }).refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
        return;
      }
      const result = await this.authService.refresh(refreshToken);
      res.json(success(result));
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.slice(7) ?? req.cookies?.access_token ?? '';
      await this.authService.logout(req.user!.id, token);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('user_role');
      res.json(success(null, 'Logged out successfully'));
    } catch (err) {
      next(err);
    }
  };
}
