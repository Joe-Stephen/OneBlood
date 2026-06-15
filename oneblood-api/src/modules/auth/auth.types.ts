export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  googleId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
