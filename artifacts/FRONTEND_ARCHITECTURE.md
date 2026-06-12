# OneBlood — Frontend Architecture

**Stack:** Next.js 15 App Router · TypeScript · Tailwind · Zustand · React Hook Form · Zod

---

## 1. Folder Structure

```
oneblood-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── donations/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── hospitals/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── sos/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── forms/
│   │   ├── CreateRequestForm.tsx
│   │   ├── DonorProfileForm.tsx
│   │   └── SOSForm.tsx
│   ├── maps/
│   │   ├── DonorMap.tsx
│   │   └── RequestLocationPicker.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   └── NotificationList.tsx
│   ├── requests/
│   │   ├── RequestCard.tsx
│   │   ├── RequestDetail.tsx
│   │   └── RequestStatusBadge.tsx
│   ├── donors/
│   │   ├── EligibilityCountdown.tsx
│   │   └── BloodTypeTag.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Navbar.tsx
│       └── PageHeader.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── donors.api.ts
│   │   ├── requests.api.ts
│   │   ├── donations.api.ts
│   │   └── notifications.api.ts
│   ├── hooks/
│   │   ├── useRequests.ts
│   │   ├── useDonations.ts
│   │   ├── useNotifications.ts
│   │   ├── useGeolocation.ts
│   │   └── useSocket.ts
│   ├── schemas/
│   │   ├── request.schema.ts
│   │   ├── donor.schema.ts
│   │   └── sos.schema.ts
│   └── utils/
│       ├── blood-type.util.ts
│       ├── date.util.ts
│       └── geo.util.ts
│
├── store/
│   ├── auth.store.ts
│   ├── notifications.store.ts
│   ├── requests.store.ts
│   └── index.ts
│
├── types/
│   ├── api.types.ts
│   ├── blood.types.ts
│   └── user.types.ts
│
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 2. Routing Structure

Route groups control layouts and auth protection.

| Route Group | Path | Protection | Layout |
|-------------|------|-----------|--------|
| `(auth)` | `/login` | Public only (redirect if logged in) | Minimal |
| `(dashboard)` | `/dashboard`, `/requests/*`, `/donations`, `/profile` | Auth required | Sidebar + Navbar |
| `(admin)` | `/admin/*` | Auth + Admin role | Admin sidebar |
| None | `/onboarding` | Auth required, no profile | Minimal |
| None | `/sos` | Auth required | Minimal (emergency UI) |

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar }  from '@/components/layout/Navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.isProfileComplete) redirect('/onboarding');

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## 3. State Management (Zustand)

Three focused stores — no monolithic global state.

### Auth Store
```typescript
// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user:         AuthUser | null;
  accessToken:  string | null;
  isLoading:    boolean;
  setAuth:      (user: AuthUser, token: string) => void;
  clearAuth:    () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,
      setAuth:  (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    { name: 'oneblood-auth', partialize: (s) => ({ user: s.user }) }
  )
);
```

### Notifications Store
```typescript
// store/notifications.store.ts
import { create } from 'zustand';

interface NotificationsState {
  unreadCount:   number;
  notifications: AppNotification[];
  addNotification:    (n: AppNotification) => void;
  markAllRead:        () => void;
  setUnreadCount:     (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount:   0,
  notifications: [],
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount:   s.unreadCount + 1,
    })),
  markAllRead:   () => set({ unreadCount: 0 }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
```

### Requests Store (active request tracking)
```typescript
// store/requests.store.ts
import { create } from 'zustand';

interface RequestsState {
  activeRequestId: string | null;
  setActiveRequest: (id: string | null) => void;
}

export const useRequestsStore = create<RequestsState>((set) => ({
  activeRequestId: null,
  setActiveRequest: (id) => set({ activeRequestId: id }),
}));
```

---

## 4. API Layer

Typed, centralized API client with automatic token refresh.

```typescript
// lib/api/client.ts
import { appConfig } from '@/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    method,
    credentials: 'include', // httpOnly cookie
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Attempt silent token refresh
    const refreshed = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
      method: 'POST', credentials: 'include',
    });
    if (!refreshed.ok) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    // Retry original request
    return request<T>(path, method, body);
  }

  const json = await res.json();
  if (!res.ok) throw new ApiError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

export const api = {
  get:    <T>(path: string)                  => request<T>(path, 'GET'),
  post:   <T>(path: string, body: unknown)   => request<T>(path, 'POST', body),
  patch:  <T>(path: string, body: unknown)   => request<T>(path, 'PATCH', body),
  delete: <T>(path: string)                  => request<T>(path, 'DELETE'),
};

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown,
  ) { super(message); }
}
```

```typescript
// lib/api/requests.api.ts
import { api } from './client';
import type { BloodRequest, CreateRequestDto, PaginatedResponse } from '@/types';

export const requestsApi = {
  create: (dto: CreateRequestDto) =>
    api.post<BloodRequest>('/requests', dto),

  list: (params: RequestsFilter) =>
    api.get<PaginatedResponse<BloodRequest>>(`/requests?${toQuery(params)}`),

  getById: (id: string) =>
    api.get<BloodRequest>(`/requests/${id}`),

  respond: (id: string, action: 'ACCEPTED' | 'DECLINED') =>
    api.post<RespondResult>(`/requests/${id}/respond`, { action }),

  createSOS: (dto: SOSRequestDto) =>
    api.post<SOSResult>('/requests/sos', dto),
};
```

---

## 5. Authentication Flow

```
User clicks "Sign in with Google"
        ↓
Next.js redirects to Google OAuth consent screen
        ↓
Google redirects to /api/auth/callback?code=...
        ↓
Route handler exchanges code with backend POST /auth/google
        ↓
Backend sets httpOnly cookies (accessToken, refreshToken)
        ↓
Route handler reads user data, stores in Zustand (client)
        ↓
Redirect → /onboarding (new user) or /dashboard (returning)
```

```typescript
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=no_code', req.url));

  const res = await fetch(`${process.env.API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: process.env.GOOGLE_REDIRECT_URI }),
  });

  if (!res.ok) return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));

  const { data } = await res.json();
  const response = NextResponse.redirect(
    new URL(data.user.isProfileComplete ? '/dashboard' : '/onboarding', req.url)
  );

  // Forward httpOnly cookies from backend
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);

  return response;
}
```

---

## 6. Protected Routes (Middleware)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS  = ['/login', '/api/auth/callback'];
const ADMIN_PATHS   = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token  = req.cookies.get('access_token')?.value;
  const role   = req.cookies.get('user_role')?.value;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url));
  }

  // Admin route guard
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 7. Component Organization

### Design System — UI Primitives

```typescript
// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25',
        secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700',
        danger:    'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-800',
        sos:       'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-500/50 shadow-lg',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ variant, size, isLoading, children, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
      {children}
    </button>
  );
}
```

### Form Example — Create Blood Request

```typescript
// components/forms/CreateRequestForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateRequestSchema } from '@/lib/schemas/request.schema';

export function CreateRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(CreateRequestSchema),
  });

  const onSubmit = async (data: CreateRequestDto) => {
    await requestsApi.create(data);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300">Blood Type Required</label>
        <select {...register('bloodType')} className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2">
          {BLOOD_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        {errors.bloodType && <p className="text-red-400 text-xs mt-1">{errors.bloodType.message}</p>}
      </div>
      {/* ... other fields */}
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Post Blood Request
      </Button>
    </form>
  );
}
```

### Custom Hooks

```typescript
// lib/hooks/useRequests.ts
import useSWR from 'swr';
import { requestsApi } from '@/lib/api/requests.api';

export function useRequests(filter: RequestsFilter) {
  const key = `/requests?${toQuery(filter)}`;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => requestsApi.list(filter),
    { refreshInterval: 30_000 } // poll every 30s
  );
  return { requests: data?.requests ?? [], pagination: data?.pagination, isLoading, error, mutate };
}
```

```typescript
// lib/hooks/useSocket.ts
'use client';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationsStore } from '@/store/notifications.store';

let socket: Socket | null = null;

export function useSocket() {
  const addNotification = useNotificationsStore(s => s.addNotification);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, { withCredentials: true });

    socket.on('notification:new', (data: AppNotification) => {
      addNotification(data);
      // Browser notification API
      if (Notification.permission === 'granted') {
        new Notification(data.body, { icon: '/logo.png' });
      }
    });

    socket.on('request:update', (data: RequestUpdate) => {
      // Trigger SWR revalidation for affected request
    });

    return () => { socket?.disconnect(); };
  }, []);
}
```

### Validation Schemas

```typescript
// lib/schemas/request.schema.ts
import { z } from 'zod';

export const CreateRequestSchema = z.object({
  bloodType:     z.enum(['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG']),
  unitsRequired: z.number().int().min(1).max(20),
  hospitalName:  z.string().min(2).max(255),
  urgencyLevel:  z.enum(['NORMAL','URGENT','SOS']),
  contactName:   z.string().min(2).max(255),
  contactPhone:  z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  }),
  notes: z.string().max(500).optional(),
});

export type CreateRequestDto = z.infer<typeof CreateRequestSchema>;
```

---

## 8. Dashboard Design

### Donor Dashboard — Page Structure
```typescript
// app/(dashboard)/dashboard/page.tsx
import { getServerSession } from '@/lib/auth/session';
import { EligibilityCard }   from '@/components/donors/EligibilityCountdown';
import { ActiveRequests }    from '@/components/requests/ActiveRequests';
import { DonationHistory }   from '@/components/donors/DonationHistory';
import { SOSButton }         from '@/components/sos/SOSButton';

export default async function DashboardPage() {
  const session = await getServerSession();

  // Server-side prefetch
  const [eligibility, requests] = await Promise.all([
    donorsApi.getEligibility(),
    requestsApi.list({ status: 'OPEN', page: 1, limit: 5 }),
  ]);

  return (
    <div className="space-y-6">
      {/* SOS CTA — always prominent */}
      <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-red-400 font-semibold">Emergency?</h2>
          <p className="text-gray-400 text-sm">Instantly alert donors near any hospital</p>
        </div>
        <SOSButton />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Donations" value={session.user.donationCount} icon="🩸" />
        <StatCard title="Lives Impacted"  value={session.user.donationCount} icon="❤️" />
        <StatCard title="Next Eligible"   value={eligibility.cooldownDaysRemaining === 0 ? 'Now' : `${eligibility.cooldownDaysRemaining}d`} icon="📅" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EligibilityCard eligibility={eligibility} />
        <ActiveRequests initialData={requests} />
      </div>

      <DonationHistory />
    </div>
  );
}
```

### Admin Dashboard — Page Structure
```typescript
// app/(admin)/admin/dashboard/page.tsx
import { analyticsApi } from '@/lib/api/admin.api';
import { MetricsGrid }  from '@/components/admin/MetricsGrid';
import { RequestsMap }  from '@/components/maps/RequestsMap';
import { FulfillmentChart } from '@/components/admin/FulfillmentChart';
import { SOSAlertFeed } from '@/components/admin/SOSAlertFeed';

export default async function AdminDashboardPage() {
  const stats = await analyticsApi.getDashboard();

  return (
    <div className="space-y-6">
      <MetricsGrid stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RequestsMap />
        </div>
        <SOSAlertFeed />
      </div>
      <FulfillmentChart />
    </div>
  );
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
```

---

## Key Principles

| Principle | Implementation |
|-----------|---------------|
| **Server-first** | All data fetching done in Server Components; Client Components only for interactivity |
| **Type safety** | Zod schemas as single source of truth for both validation and TypeScript types |
| **Auth via cookies** | httpOnly cookies — no tokens in localStorage or Zustand persistence |
| **SWR for client data** | Polling (30s) for request lists; WebSocket for real-time push updates |
| **Colocation** | Component-specific hooks live next to components, not in a global hooks folder |
| **Error boundaries** | Each page section wrapped in React Error Boundary for graceful partial failures |

---

*Document Owner: OneBlood Frontend Engineering | June 12, 2026*
