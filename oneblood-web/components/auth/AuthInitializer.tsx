'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { usersApi } from '@/lib/api/client';
import type { ApiResponse, User } from '@/types';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          clearAuth();
          return;
        }
        const { accessToken } = await res.json();

        // Fetch user info using the retrieved access token
        const userRes = await usersApi.getMe(accessToken) as ApiResponse<User>;
        if (userRes.success && userRes.data) {
          setAuth(userRes.data, accessToken);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    if (!isAuthenticated) {
      initAuth();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}
