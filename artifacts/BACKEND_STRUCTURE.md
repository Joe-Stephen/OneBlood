# OneBlood — Backend Folder Structure

**Stack:** Node.js · Express · TypeScript · PostgreSQL · Redis  
**Pattern:** Clean Architecture · Repository Pattern · Service Layer · DI

---

## Complete Folder Tree

```
oneblood-api/
├── src/
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.schema.ts
│   │   │   └── users.types.ts
│   │   ├── donors/
│   │   │   ├── donors.controller.ts
│   │   │   ├── donors.service.ts
│   │   │   ├── donors.repository.ts
│   │   │   ├── donors.routes.ts
│   │   │   ├── donors.schema.ts
│   │   │   └── donors.types.ts
│   │   ├── requests/
│   │   │   ├── requests.controller.ts
│   │   │   ├── requests.service.ts
│   │   │   ├── requests.repository.ts
│   │   │   ├── requests.routes.ts
│   │   │   ├── requests.schema.ts
│   │   │   └── requests.types.ts
│   │   ├── donations/
│   │   │   ├── donations.controller.ts
│   │   │   ├── donations.service.ts
│   │   │   ├── donations.repository.ts
│   │   │   ├── donations.routes.ts
│   │   │   ├── donations.schema.ts
│   │   │   └── donations.types.ts
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.repository.ts
│   │   │   ├── notifications.routes.ts
│   │   │   ├── notifications.schema.ts
│   │   │   └── notifications.types.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       ├── admin.repository.ts
│   │       ├── admin.routes.ts
│   │       ├── admin.schema.ts
│   │       └── admin.types.ts
│   │
│   ├── core/
│   │   ├── matching/
│   │   │   ├── matching.engine.ts
│   │   │   ├── compatibility.map.ts
│   │   │   └── matching.types.ts
│   │   ├── notifications/
│   │   │   ├── fcm.provider.ts
│   │   │   ├── sms.provider.ts
│   │   │   └── notification.dispatcher.ts
│   │   └── jobs/
│   │       ├── jobs.registry.ts
│   │       ├── reset-cooldown.job.ts
│   │       ├── expire-requests.job.ts
│   │       └── send-notification.job.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── db.client.ts
│   │   │   ├── db.transaction.ts
│   │   │   └── migrations/
│   │   │       ├── 001_create_extensions.sql
│   │   │       ├── 002_create_enums.sql
│   │   │       ├── 003_create_users.sql
│   │   │       ├── 004_create_donor_profiles.sql
│   │   │       ├── 005_create_hospitals.sql
│   │   │       ├── 006_create_blood_requests.sql
│   │   │       ├── 007_create_donations.sql
│   │   │       ├── 008_create_notifications.sql
│   │   │       └── 009_create_audit_logs.sql
│   │   ├── redis/
│   │   │   ├── redis.client.ts
│   │   │   ├── redis.cache.ts
│   │   │   └── redis.pubsub.ts
│   │   └── external/
│   │       ├── google-oauth.client.ts
│   │       ├── google-maps.client.ts
│   │       ├── firebase.client.ts
│   │       └── twilio.client.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── audit.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   ├── ValidationError.ts
│   │   │   ├── NotFoundError.ts
│   │   │   ├── ForbiddenError.ts
│   │   │   └── ConflictError.ts
│   │   ├── utils/
│   │   │   ├── pagination.util.ts
│   │   │   ├── date.util.ts
│   │   │   ├── geo.util.ts
│   │   │   ├── hash.util.ts
│   │   │   └── response.util.ts
│   │   ├── constants/
│   │   │   ├── blood.constants.ts
│   │   │   ├── cooldown.constants.ts
│   │   │   └── radius.constants.ts
│   │   └── types/
│   │       ├── express.d.ts
│   │       └── global.types.ts
│   │
│   ├── container/
│   │   └── ioc.container.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   │   ├── matching/
│   │   │   └── matching.engine.spec.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   └── auth.service.spec.ts
│   │   │   ├── donors/
│   │   │   │   └── donors.service.spec.ts
│   │   │   └── requests/
│   │   │       └── requests.service.spec.ts
│   │   └── shared/
│   │       └── geo.util.spec.ts
│   ├── integration/
│   │   ├── auth.integration.spec.ts
│   │   ├── requests.integration.spec.ts
│   │   └── matching.integration.spec.ts
│   ├── e2e/
│   │   └── sos.e2e.spec.ts
│   └── helpers/
│       ├── db.helper.ts
│       ├── mock.factory.ts
│       └── test-server.ts
│
├── .env
├── .env.example
├── .env.test
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.ts
├── Dockerfile
├── docker-compose.yml
├── .eslintrc.js
├── .prettierrc
└── package.json
```

---

## Folder Purposes

### `src/config/`
Centralizes all environment-driven configuration. Each file loads and validates env vars for a specific concern — never import `process.env` directly anywhere else in the codebase.

```typescript
// src/config/app.config.ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV:   z.enum(['development', 'test', 'production']),
  PORT:       z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  CORS_ORIGIN: z.string().url(),
});

export const appConfig = schema.parse(process.env);
```

```typescript
// src/config/index.ts — single import point
export { appConfig }    from './app.config';
export { dbConfig }     from './database.config';
export { redisConfig }  from './redis.config';
```

---

### `src/modules/`
Houses all feature modules. Each module is **fully self-contained** — controller, service, repository, routes, schema, and types live together. No cross-module imports allowed (use `core/` for shared logic).

**File responsibilities within each module:**

| File | Layer | Responsibility |
|------|-------|---------------|
| `*.controller.ts` | HTTP Layer | Parse request, call service, format response. No business logic. |
| `*.service.ts` | Business Layer | Business rules, orchestration, calls repository. |
| `*.repository.ts` | Data Layer | SQL queries only. No business logic. Returns raw DB rows. |
| `*.routes.ts` | Routing | Mount middleware + controller handlers. |
| `*.schema.ts` | Validation | Zod schemas for request body/query/params. |
| `*.types.ts` | Types | Module-specific TypeScript interfaces and DTOs. |

```typescript
// src/modules/requests/requests.controller.ts
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateRequestSchema.parse(req.body);
      const result = await this.requestsService.createRequest(dto, req.user!);
      return res.status(201).json(success(result));
    } catch (err) {
      next(err);
    }
  };
}
```

```typescript
// src/modules/requests/requests.service.ts
export class RequestsService {
  constructor(
    private readonly requestsRepo: RequestsRepository,
    private readonly matchingEngine: MatchingEngine,
    private readonly geoService: GeoService,
  ) {}

  async createRequest(dto: CreateRequestDto, user: AuthUser): Promise<BloodRequestDto> {
    const location = await this.geoService.geocode(dto.hospitalName, dto.city);
    const request  = await this.requestsRepo.create({ ...dto, location, requesterId: user.id });
    await this.matchingEngine.run(request);
    return request;
  }
}
```

```typescript
// src/modules/requests/requests.repository.ts
export class RequestsRepository {
  constructor(private readonly db: DbClient) {}

  async create(data: CreateRequestData): Promise<BloodRequest> {
    const { rows } = await this.db.query(`
      INSERT INTO blood_requests (id, requester_id, blood_type, units_required,
        hospital_name, location_point, urgency_level, contact_name, contact_phone,
        notes, expires_at)
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        ST_MakePoint($5, $6)::GEOGRAPHY, $7, $8, $9, $10, $11
      )
      RETURNING *
    `, [data.requesterId, data.bloodType, data.unitsRequired, data.hospitalName,
        data.location.lon, data.location.lat, data.urgencyLevel,
        data.contactName, data.contactPhone, data.notes, data.expiresAt]);
    return rows[0];
  }
}
```

---

### `src/core/`
Contains domain logic that is **shared across modules** but belongs to the application domain (not generic utilities).

#### `core/matching/`
The blood donor matching engine — compatibility map, scoring algorithm, radius logic. Called by `RequestsService` but kept separate to isolate the complexity and enable independent testing.

```typescript
// src/core/matching/compatibility.map.ts
export const COMPATIBILITY_MAP: Record<BloodType, BloodType[]> = {
  O_NEG:  ['O_NEG'],
  O_POS:  ['O_NEG', 'O_POS'],
  A_NEG:  ['O_NEG', 'A_NEG'],
  A_POS:  ['O_NEG', 'O_POS', 'A_NEG', 'A_POS'],
  B_NEG:  ['O_NEG', 'B_NEG'],
  B_POS:  ['O_NEG', 'O_POS', 'B_NEG', 'B_POS'],
  AB_NEG: ['O_NEG', 'A_NEG', 'B_NEG', 'AB_NEG'],
  AB_POS: ['O_NEG','O_POS','A_NEG','A_POS','B_NEG','B_POS','AB_NEG','AB_POS'],
};
```

#### `core/notifications/`
FCM and SMS provider wrappers + the dispatcher that decides which channel to use per event type. The `NotificationDispatcher` is called by the notification job worker — not directly by controllers.

#### `core/jobs/`
Bull job definitions. Each job file exports a processor function and a job name constant. Registered centrally in `jobs.registry.ts`.

```typescript
// src/core/jobs/expire-requests.job.ts
export const EXPIRE_REQUESTS_JOB = 'expire-requests';

export async function expireRequestsProcessor(job: Job): Promise<void> {
  const { requestId } = job.data;
  await requestsRepo.updateStatus(requestId, 'EXPIRED');
  await notificationDispatcher.send({
    type: 'REQUEST_EXPIRED',
    requestId,
  });
}
```

---

### `src/infrastructure/`
Adapters to external systems. All third-party dependencies are wrapped here — the rest of the codebase never imports SDKs directly.

#### `infrastructure/database/`
- **`db.client.ts`** — Singleton `pg.Pool` instance; exposes `query()` and `getClient()`.
- **`db.transaction.ts`** — Helper that wraps multiple queries in a `BEGIN/COMMIT/ROLLBACK`.
- **`migrations/`** — Raw SQL migration files, run in order by a migration script (using `node-pg-migrate` or custom runner).

```typescript
// src/infrastructure/database/db.transaction.ts
export async function withTransaction<T>(
  db: DbClient,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

#### `infrastructure/redis/`
- **`redis.client.ts`** — `ioredis` singleton with cluster support.
- **`redis.cache.ts`** — Typed `get/set/del/exists` helpers with JSON serialization.
- **`redis.pubsub.ts`** — Publisher and subscriber instances (ioredis requires separate connections).

#### `infrastructure/external/`
Thin wrappers around third-party SDKs. Each client accepts config in constructor — easy to mock in tests.

---

### `src/middleware/`
Express middleware applied at route or app level.

| File | Purpose |
|------|---------|
| `auth.middleware.ts` | Verify JWT, attach `req.user` |
| `role.middleware.ts` | Factory: `requireRole('ADMIN')` |
| `validate.middleware.ts` | Factory: `validate(ZodSchema)` — runs Zod parse, throws `ValidationError` |
| `rate-limit.middleware.ts` | Redis-backed rate limiter per IP/route |
| `audit.middleware.ts` | Logs admin actions to `audit_logs` after response |
| `error.middleware.ts` | Global error handler — maps `AppError` subclasses to HTTP responses |

```typescript
// src/middleware/validate.middleware.ts
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body:   req.body,
      query:  req.query,
      params: req.params,
    });
    if (!result.success) {
      return next(new ValidationError(result.error.issues));
    }
    req.validated = result.data;
    next();
  };
```

```typescript
// src/middleware/role.middleware.ts
export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
```

---

### `src/shared/`
Generic, domain-agnostic utilities, errors, and types used across the entire codebase.

#### `shared/errors/`
Custom error classes extending `AppError`. The global error middleware inspects `instanceof` to determine HTTP status.

```typescript
// src/shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// src/shared/errors/NotFoundError.ts
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

#### `shared/utils/`

```typescript
// src/shared/utils/response.util.ts
export const success = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data,
});

// src/shared/utils/pagination.util.ts
export const paginate = (total: number, page: number, limit: number) => ({
  page, limit, total,
  totalPages: Math.ceil(total / limit),
});

// src/shared/utils/geo.util.ts
export const metersToKm = (meters: number) =>
  Math.round((meters / 1000) * 10) / 10;

export const buildMapsLink = (lat: number, lon: number) =>
  `https://maps.google.com/?q=${lat},${lon}`;
```

#### `shared/constants/`

```typescript
// src/shared/constants/cooldown.constants.ts
export const COOLDOWN_DAYS: Record<DonationType, number> = {
  WHOLE_BLOOD:       90,
  PLATELETS:         14,
  PLASMA:            28,
  DOUBLE_RED_CELLS:  112,
};

// src/shared/constants/radius.constants.ts
export const SEARCH_RADIUS_METERS = {
  NORMAL: { initial: 10_000, max: 25_000 },
  URGENT: { initial: 25_000, max: 50_000 },
  SOS:    { initial: 50_000, max: 150_000 },
};
```

#### `shared/types/express.d.ts`
Augments Express `Request` with custom fields.

```typescript
// src/shared/types/express.d.ts
import { AuthUser } from '@modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      validated?: unknown;
    }
  }
}
```

---

### `src/container/ioc.container.ts`
Manual Dependency Injection container. Wires all dependencies together in one place — no magic, no decorators, full TypeScript type safety.

```typescript
// src/container/ioc.container.ts
import { DbClient }                from '@infrastructure/database/db.client';
import { RedisCache }              from '@infrastructure/redis/redis.cache';
import { RedisPubSub }             from '@infrastructure/redis/redis.pubsub';
import { UsersRepository }         from '@modules/users/users.repository';
import { UsersService }            from '@modules/users/users.service';
import { UsersController }         from '@modules/users/users.controller';
import { DonorsRepository }        from '@modules/donors/donors.repository';
import { DonorsService }           from '@modules/donors/donors.service';
import { DonorsController }        from '@modules/donors/donors.controller';
import { RequestsRepository }      from '@modules/requests/requests.repository';
import { RequestsService }         from '@modules/requests/requests.service';
import { RequestsController }      from '@modules/requests/requests.controller';
import { MatchingEngine }          from '@core/matching/matching.engine';
import { NotificationDispatcher }  from '@core/notifications/notification.dispatcher';

// Infrastructure
const db        = new DbClient();
const cache     = new RedisCache();
const pubsub    = new RedisPubSub();

// Core
const matchingEngine         = new MatchingEngine(db, cache);
const notificationDispatcher = new NotificationDispatcher(cache);

// Repositories
const usersRepo    = new UsersRepository(db);
const donorsRepo   = new DonorsRepository(db);
const requestsRepo = new RequestsRepository(db);

// Services
const usersService    = new UsersService(usersRepo, cache);
const donorsService   = new DonorsService(donorsRepo, usersRepo, cache);
const requestsService = new RequestsService(requestsRepo, matchingEngine);

// Controllers
export const controllers = {
  users:    new UsersController(usersService),
  donors:   new DonorsController(donorsService),
  requests: new RequestsController(requestsService),
};
```

---

### `src/app.ts` and `src/server.ts`

```typescript
// src/app.ts — Express app setup (importable for tests)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorMiddleware } from '@middleware/error.middleware';
import { authRoutes }     from '@modules/auth/auth.routes';
import { usersRoutes }    from '@modules/users/users.routes';
import { donorsRoutes }   from '@modules/donors/donors.routes';
import { requestsRoutes } from '@modules/requests/requests.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: appConfig.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10kb' }));

  app.use('/v1/auth',      authRoutes);
  app.use('/v1/users',     usersRoutes);
  app.use('/v1/donors',    donorsRoutes);
  app.use('/v1/requests',  requestsRoutes);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorMiddleware);
  return app;
}
```

```typescript
// src/server.ts — process entry point (not imported in tests)
import { createApp } from './app';
import { appConfig } from '@config';

const app = createApp();
const server = app.listen(appConfig.PORT, () => {
  console.log(`OneBlood API running on port ${appConfig.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
```

---

### `tests/`

| Folder | Purpose |
|--------|---------|
| `unit/` | Test services and engine logic in isolation — all dependencies mocked |
| `integration/` | Test full request → service → real DB (test DB) flow |
| `e2e/` | Test complete HTTP request/response lifecycle using `supertest` |
| `helpers/` | Shared test utilities: mock factory, test DB seed/teardown, test server setup |

```typescript
// tests/unit/matching/matching.engine.spec.ts
describe('MatchingEngine', () => {
  it('returns only compatible donors for O_NEG request', async () => {
    const mockDonors = [
      { bloodType: 'O_NEG', distanceMeters: 1000 },
      { bloodType: 'A_POS', distanceMeters: 500 },  // incompatible
    ];
    mockDb.query.mockResolvedValue({ rows: mockDonors });

    const result = await engine.run(sosRequest);
    expect(result.donors).toHaveLength(1);
    expect(result.donors[0].bloodType).toBe('O_NEG');
  });
});
```

```typescript
// tests/helpers/mock.factory.ts
export const mockUser = (overrides = {}): AuthUser => ({
  id:        'uuid-123',
  email:     'test@oneblood.in',
  role:      'DONOR',
  ...overrides,
});

export const mockBloodRequest = (overrides = {}): BloodRequest => ({
  id:           'req-uuid-456',
  bloodType:    'O_POS',
  urgencyLevel: 'NORMAL',
  status:       'OPEN',
  ...overrides,
});
```

---

## Key Config Files

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@config":            ["src/config"],
      "@modules/*":         ["src/modules/*"],
      "@core/*":            ["src/core/*"],
      "@infrastructure/*":  ["src/infrastructure/*"],
      "@middleware/*":      ["src/middleware/*"],
      "@shared/*":          ["src/shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### `jest.config.ts`
```typescript
export default {
  preset:              'ts-jest',
  testEnvironment:     'node',
  moduleNameMapper:    {
    '^@config$':            '<rootDir>/src/config',
    '^@modules/(.*)$':      '<rootDir>/src/modules/$1',
    '^@core/(.*)$':         '<rootDir>/src/core/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@shared/(.*)$':       '<rootDir>/src/shared/$1',
  },
  coverageThreshold: {
    global: { branches: 80, functions: 85, lines: 85, statements: 85 }
  },
};
```

### `package.json` (scripts)
```json
{
  "scripts": {
    "dev":          "ts-node-dev --respawn --transpile-only src/server.ts",
    "build":        "tsc -p tsconfig.build.json",
    "start":        "node dist/server.js",
    "test":         "jest --runInBand",
    "test:unit":    "jest tests/unit --runInBand",
    "test:int":     "jest tests/integration --runInBand",
    "test:e2e":     "jest tests/e2e --runInBand",
    "test:cov":     "jest --coverage",
    "migrate":      "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "lint":         "eslint src --ext .ts",
    "typecheck":    "tsc --noEmit"
  }
}
```

---

## Dependency Injection — Design Principle

```
No IoC framework (InversifyJS / tsyringe) at MVP.
Manual DI via ioc.container.ts keeps things:
  - Transparent (every dependency visible at a glance)
  - Testable (inject mocks directly in tests)
  - Zero magic (no decorators, no reflect-metadata)

Extract to InversifyJS only if the team grows beyond ~15 engineers
and the container file becomes unmanageable.
```

---

*Document Owner: OneBlood Backend Engineering | June 12, 2026*
