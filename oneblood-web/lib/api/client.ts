const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: Method;
  body?: unknown;
  token?: string;
  tags?: string[];
  revalidate?: number;
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, tags, revalidate } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const nextOptions: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {
    method,
    headers,
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(tags || revalidate !== undefined
      ? { next: { ...(tags ? { tags } : {}), ...(revalidate !== undefined ? { revalidate } : {}) } }
      : {}),
  };

  const res = await fetch(`${API_URL}${path}`, nextOptions);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: 'FETCH_ERROR', message: res.statusText } })) as { error: { code: string; message: string; details?: unknown } };
    throw new ApiError(err.error.code, err.error.message, res.status, err.error.details);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  google: (code: string, redirectUri: string) =>
    apiFetch('/v1/auth/google', { method: 'POST', body: { code, redirectUri } }),
  refresh: () =>
    apiFetch('/v1/auth/refresh', { method: 'POST' }),
  logout: (token: string) =>
    apiFetch('/v1/auth/logout', { method: 'POST', token }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: (token: string) =>
    apiFetch('/v1/users/me', { token }),
  updateMe: (token: string, data: { name?: string; phone?: string }) =>
    apiFetch('/v1/users/me', { method: 'PATCH', token, body: data }),
  deleteMe: (token: string) =>
    apiFetch('/v1/users/me', { method: 'DELETE', token }),
};

// ─── Donors ───────────────────────────────────────────────────────────────────
export const donorsApi = {
  createProfile: (token: string, data: unknown) =>
    apiFetch('/v1/donors/profile', { method: 'POST', token, body: data }),
  getProfile: (token: string) =>
    apiFetch('/v1/donors/profile', { token }),
  updateProfile: (token: string, data: unknown) =>
    apiFetch('/v1/donors/profile', { method: 'PATCH', token, body: data }),
  getEligibility: (token: string) =>
    apiFetch('/v1/donors/eligibility', { token }),
};

// ─── Requests ─────────────────────────────────────────────────────────────────
export const requestsApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/requests${qs}`, { revalidate: 30 });
  },
  getById: (id: string) =>
    apiFetch(`/v1/requests/${id}`, { revalidate: 0 }),
  create: (token: string, data: unknown) =>
    apiFetch('/v1/requests', { method: 'POST', token, body: data }),
  update: (token: string, id: string, data: unknown) =>
    apiFetch(`/v1/requests/${id}`, { method: 'PATCH', token, body: data }),
  respond: (token: string, id: string, action: 'ACCEPTED' | 'DECLINED') =>
    apiFetch(`/v1/requests/${id}/respond`, { method: 'POST', token, body: { action } }),
};

// ─── Donations ────────────────────────────────────────────────────────────────
export const donationsApi = {
  list: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/donations${qs}`, { token });
  },
  log: (token: string, data: unknown) =>
    apiFetch('/v1/donations', { method: 'POST', token, body: data }),
  getById: (token: string, id: string) =>
    apiFetch(`/v1/donations/${id}`, { token }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/notifications${qs}`, { token });
  },
  markRead: (token: string, id: string) =>
    apiFetch(`/v1/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllRead: (token: string) =>
    apiFetch('/v1/notifications/read-all', { method: 'PATCH', token }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: (token: string) =>
    apiFetch('/v1/admin/dashboard', { token }),
  listUsers: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/admin/users${qs}`, { token });
  },
  updateUser: (token: string, id: string, data: unknown) =>
    apiFetch(`/v1/admin/users/${id}`, { method: 'PATCH', token, body: data }),
  listHospitals: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/admin/hospitals${qs}`, { token });
  },
  createHospital: (token: string, data: unknown) =>
    apiFetch('/v1/admin/hospitals', { method: 'POST', token, body: data }),
  verifyHospital: (token: string, id: string, status: string) =>
    apiFetch(`/v1/admin/hospitals/${id}/verify`, { method: 'PATCH', token, body: { status } }),
  getAuditLogs: (token: string, params?: Record<string, string | number>) => {
    const qs = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return apiFetch(`/v1/admin/audit-logs${qs}`, { token });
  },
};
