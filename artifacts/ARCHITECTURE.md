# OneBlood — System Architecture Document

**Version:** 1.0  
**Date:** June 12, 2026  
**Author:** Solution Architecture Team  
**Status:** Draft

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Component Breakdown](#2-component-breakdown)
3. [Service Interactions](#3-service-interactions)
4. [Request Flow Diagrams](#4-request-flow-diagrams)
5. [Notification Architecture](#5-notification-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Scaling Strategy](#9-scaling-strategy)

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Clients["Client Layer"]
        WEB["Next.js 15 Web App<br/>(TypeScript + Tailwind)"]
        PWA["PWA / Mobile Browser"]
    end

    subgraph CDN["Edge Layer"]
        CF["CloudFront CDN"]
        WAF["AWS WAF"]
    end

    subgraph Gateway["API Gateway Layer"]
        AG["API Gateway<br/>(Rate Limiting, Auth, Routing)"]
    end

    subgraph Services["Backend Services"]
        AUTH["Auth Service<br/>(Google OAuth + JWT)"]
        DONOR["Donor Service"]
        REQUEST["Request Service"]
        MATCH["Matching Engine"]
        NOTIF["Notification Service"]
        GEO["Geolocation Service"]
        ADMIN["Admin Service"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL + PostGIS<br/>Primary DB")]
        REDIS[("Redis<br/>Cache + Pub/Sub + Queue")]
        S3["AWS S3<br/>File Storage"]
    end

    subgraph External["External Services"]
        GOOGLE["Google OAuth 2.0"]
        FCM["Firebase Cloud Messaging"]
        SMS["Twilio SMS"]
        MAPS["Google Maps API"]
    end

    WEB --> CF
    PWA --> CF
    CF --> WAF
    WAF --> AG
    AG --> AUTH
    AG --> DONOR
    AG --> REQUEST
    AG --> MATCH
    AG --> NOTIF
    AG --> GEO
    AG --> ADMIN
    AUTH --> GOOGLE
    AUTH --> PG
    AUTH --> REDIS
    DONOR --> PG
    DONOR --> REDIS
    REQUEST --> PG
    REQUEST --> REDIS
    MATCH --> PG
    MATCH --> GEO
    NOTIF --> FCM
    NOTIF --> SMS
    NOTIF --> REDIS
    GEO --> MAPS
    GEO --> PG
    ADMIN --> PG
    ADMIN --> REDIS
```

---

## 2. Component Breakdown

### 2.1 Frontend — Next.js 15

| Module | Responsibility |
|--------|---------------|
| **App Router** | File-based routing, layouts, server components |
| **Auth Module** | Google OAuth flow, JWT storage (httpOnly cookie) |
| **Donor Module** | Profile setup, availability toggle, donation history |
| **Request Module** | Create/view blood requests, SOS trigger |
| **Map Module** | Google Maps integration, donor proximity visualization |
| **Notification Module** | WebSocket client, FCM service worker, notification center |
| **Admin Module** | Dashboard, analytics, user management (role-gated) |

**Key Frontend Decisions:**
- Server Components for initial data fetching (SEO + performance)
- Client Components only for interactive elements (map, real-time)
- Service Worker for FCM push notifications
- React Query for client-side caching and background refresh
- Zustand for lightweight global state (auth, notifications)

---

### 2.2 Backend Services

Each service is an Express.js module within a monorepo. They share a common middleware layer but can be extracted to independent microservices when scaling demands it.

#### Auth Service
- Handles Google OAuth 2.0 callback
- Issues access tokens (JWT, 1h TTL) and refresh tokens (30d TTL, stored in Redis)
- Validates tokens on all protected routes via shared middleware
- Blacklists tokens on logout via Redis

#### Donor Service
- CRUD for donor profiles
- Eligibility validation (age, weight, blood type)
- Availability status management
- Cooldown enforcement (reads last donation date)

#### Request Service
- CRUD for blood requests
- Expiry scheduling via Redis TTL + Bull queue
- Request lifecycle: `OPEN → MATCHED → FULFILLED / EXPIRED / CANCELLED`

#### Matching Engine
- Triggered when a new request is created
- Queries PostGIS for donors within the request's radius
- Filters by blood compatibility rules
- Returns sorted donor list (nearest first)
- Pushes matched donor IDs to Notification Service via Redis pub/sub

#### Notification Service
- Subscribes to Redis channels for match events
- Dispatches FCM push to matched donors
- Dispatches Twilio SMS for SOS requests
- Broadcasts real-time updates via WebSocket (Socket.io)
- Tracks notification delivery status in DB

#### Geolocation Service
- Geocodes hospital addresses to lat/lng via Google Maps API
- Updates donor location points in PostGIS
- Provides distance calculations for request views

#### Admin Service
- Aggregate analytics queries (fulfilled rate, avg response time)
- Account management (suspend, verify)
- Report generation and CSV export

---

### 2.3 Infrastructure Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Gateway | AWS API GW / custom Express gateway | Routing, rate limiting, auth |
| Cache | Redis 7 (Cluster) | Session, query cache, pub/sub, job queue |
| Message Queue | Bull (Redis-backed) | Async jobs (notifications, expiry, reports) |
| WebSocket Server | Socket.io | Real-time donor/request status updates |
| CDN | AWS CloudFront | Static assets, edge caching |
| Object Storage | AWS S3 | Profile images, CSV exports |
| Secret Management | AWS Secrets Manager | DB credentials, API keys |

---

## 3. Service Interactions

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant RS as Request Service
    participant ME as Matching Engine
    participant NS as Notification Service
    participant GS as Geolocation Service
    participant DB as PostgreSQL+PostGIS
    participant RD as Redis
    participant FCM as Firebase FCM

    C->>GW: POST /requests (blood type, location, urgency)
    GW->>GS: Geocode hospital address
    GS-->>GW: lat/lng coordinates
    GW->>RS: Create request record
    RS->>DB: INSERT bloodRequest
    RS->>RD: SET request:expiry TTL
    RS-->>GW: requestId
    GW-->>C: 201 Created

    RS->>RD: PUBLISH match:new {requestId}
    RD-->>ME: match:new event
    ME->>DB: ST_DWithin(donorLocations, requestLocation, radius)
    ME->>ME: Filter by blood compatibility
    ME->>DB: SELECT eligible donors (ordered by distance)
    ME->>RD: PUBLISH notify:donors {donorIds, requestId}
    RD-->>NS: notify:donors event
    NS->>FCM: Batch push to donor devices
    NS->>DB: INSERT notifications (status=SENT)
    FCM-->>NS: Delivery receipts
```

---

## 4. Request Flow Diagrams

### 4.1 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant GW as API Gateway
    participant AS as Auth Service
    participant GO as Google OAuth
    participant DB as PostgreSQL
    participant RD as Redis

    U->>FE: Click "Sign in with Google"
    FE->>GO: OAuth redirect
    GO-->>FE: Auth code callback
    FE->>GW: POST /auth/google {code}
    GW->>AS: Exchange code
    AS->>GO: Verify token
    GO-->>AS: User profile (email, name, googleId)
    AS->>DB: UPSERT user record
    AS->>RD: STORE refreshToken (30d TTL)
    AS-->>GW: {accessToken, refreshToken}
    GW-->>FE: Set httpOnly cookies
    FE-->>U: Redirect to dashboard
```

---

### 4.2 SOS Request Flow

```mermaid
flowchart TD
    A["User taps SOS button"] --> B["GPS location auto-detected"]
    B --> C["User confirms blood type & units"]
    C --> D["POST /requests/sos"]
    D --> E["API Gateway validates JWT"]
    E --> F["Request Service creates SOS record\n urgency=SOS, radius=50km"]
    F --> G["Matching Engine queries PostGIS\nST_DWithin(50km)"]
    G --> H["Filter by blood compatibility"]
    H --> I{Donors found?}
    I -->|Yes| J["Publish notify:sos to Redis"]
    I -->|No| K["Expand radius to 100km\nRetry once"]
    K --> G
    J --> L["Notification Service broadcasts"]
    L --> M["FCM Push to all matched donors"]
    L --> N["Twilio SMS to all matched donors"]
    L --> O["Admin alert triggered"]
    M --> P["Real-time status update\nvia WebSocket to requester"]
    N --> P
```

---

### 4.3 Donor Response Flow

```mermaid
sequenceDiagram
    participant D as Donor App
    participant GW as API Gateway
    participant DS as Donor Service
    participant RS as Request Service
    participant NS as Notification Service
    participant DB as PostgreSQL
    participant WS as WebSocket

    D->>GW: POST /requests/:id/respond {action: ACCEPT}
    GW->>DS: Validate donor eligibility & cooldown
    DS->>DB: SELECT donations WHERE donorId=? ORDER BY donatedAt DESC
    DB-->>DS: Last donation date
    DS-->>GW: Eligible: true
    GW->>RS: Record donor acceptance
    RS->>DB: INSERT donorResponse {donorId, requestId, status=ACCEPTED}
    RS->>NS: Notify requester of acceptance
    NS->>WS: Emit request:update to requester room
    NS->>DB: INSERT notification (to requester)
    GW-->>D: 200 OK {hospitalAddress, contactNumber}
```

---

## 5. Notification Architecture

```mermaid
graph LR
    subgraph Triggers["Event Triggers"]
        T1["New Blood Request"]
        T2["SOS Request"]
        T3["Donor Acceptance"]
        T4["Request Fulfilled"]
        T5["Cooldown Ended"]
    end

    subgraph Queue["Redis Pub/Sub + Bull Queue"]
        CH1["Channel: notify:match"]
        CH2["Channel: notify:sos"]
        CH3["Channel: notify:status"]
        JQ["Bull Job Queue\n(retry, delay, schedule)"]
    end

    subgraph Dispatcher["Notification Dispatcher"]
        ND["Notification Service\n(Node.js Worker)"]
        RT["Real-time Layer\n(Socket.io)"]
    end

    subgraph Channels["Delivery Channels"]
        FCM["FCM Push\n(foreground + background)"]
        SMS["Twilio SMS\n(SOS only)"]
        WS["WebSocket\n(active sessions)"]
        EMAIL["Email\n(future)"]
    end

    subgraph Tracking["Delivery Tracking"]
        DB[("notifications table\n(status, sentAt, readAt)")]
    end

    T1 --> CH1
    T2 --> CH2
    T3 --> CH3
    T4 --> CH3
    T5 --> JQ
    CH1 --> ND
    CH2 --> ND
    CH3 --> ND
    JQ --> ND
    ND --> FCM
    ND --> SMS
    ND --> RT
    RT --> WS
    ND --> EMAIL
    ND --> DB
    FCM --> DB
```

### Notification Delivery Rules

| Event | FCM Push | SMS | WebSocket | Priority |
|-------|----------|-----|-----------|----------|
| New Normal Request | ✅ | ❌ | ✅ | Normal |
| New Urgent Request | ✅ | ❌ | ✅ | High |
| SOS Request | ✅ | ✅ | ✅ | Critical |
| Donor Accepted | ✅ | ❌ | ✅ | High |
| Request Fulfilled | ✅ | ❌ | ✅ | Normal |
| Cooldown Ended | ✅ | ❌ | ❌ | Low |

### Retry Strategy
- **FCM failures**: 3 retries with exponential backoff (1s, 3s, 9s)
- **SMS failures**: 2 retries, fallback to push notification
- **Dead Letter Queue**: Failed jobs after all retries stored for manual review

---

## 6. Database Architecture

### 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string googleId UK
        string name
        string email UK
        string phone
        enum role
        enum bloodType
        int weight
        date dob
        geography locationPoint
        enum availabilityStatus
        boolean isEligible
        timestamp createdAt
        timestamp updatedAt
    }

    BLOOD_REQUESTS {
        uuid id PK
        uuid requesterId FK
        enum bloodType
        int unitsRequired
        string hospitalName
        geography locationPoint
        enum urgencyLevel
        enum status
        string contactNumber
        text notes
        timestamp expiresAt
        timestamp fulfilledAt
        timestamp createdAt
    }

    DONATIONS {
        uuid id PK
        uuid donorId FK
        uuid requestId FK
        timestamp donatedAt
        int units
        string hospitalName
        timestamp nextEligibleDate
        createdAt timestamp
    }

    DONOR_RESPONSES {
        uuid id PK
        uuid donorId FK
        uuid requestId FK
        enum action
        timestamp respondedAt
    }

    NOTIFICATIONS {
        uuid id PK
        uuid userId FK
        uuid requestId FK
        enum type
        enum channel
        enum status
        timestamp sentAt
        timestamp readAt
    }

    AUDIT_LOGS {
        uuid id PK
        uuid adminId FK
        string action
        string targetType
        uuid targetId
        jsonb metadata
        timestamp createdAt
    }

    USERS ||--o{ BLOOD_REQUESTS : "creates"
    USERS ||--o{ DONATIONS : "makes"
    USERS ||--o{ DONOR_RESPONSES : "submits"
    USERS ||--o{ NOTIFICATIONS : "receives"
    BLOOD_REQUESTS ||--o{ DONATIONS : "fulfilled by"
    BLOOD_REQUESTS ||--o{ DONOR_RESPONSES : "receives"
    BLOOD_REQUESTS ||--o{ NOTIFICATIONS : "triggers"
```

---

### 6.2 PostGIS Spatial Design

```sql
-- Donor location stored as PostGIS GEOGRAPHY point
ALTER TABLE users ADD COLUMN location_point GEOGRAPHY(POINT, 4326);

-- Spatial index for fast proximity queries
CREATE INDEX idx_users_location ON users USING GIST(location_point);

-- Request location
ALTER TABLE blood_requests ADD COLUMN location_point GEOGRAPHY(POINT, 4326);
CREATE INDEX idx_requests_location ON blood_requests USING GIST(location_point);

-- Geospatial matching query (example: 10km radius)
SELECT u.id, u.name, u.blood_type,
       ST_Distance(u.location_point, r.location_point) AS distance_meters
FROM users u
JOIN blood_requests r ON r.id = $requestId
WHERE u.availability_status = 'ACTIVE'
  AND u.blood_type = ANY($compatibleTypes)
  AND ST_DWithin(u.location_point, r.location_point, $radiusMeters)
ORDER BY distance_meters ASC
LIMIT 50;
```

---

### 6.3 Redis Key Design

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `session:{userId}` | Hash | 30d | Refresh token store |
| `blacklist:{token}` | String | 1h | Revoked access tokens |
| `request:expiry:{requestId}` | String | Dynamic | Request auto-expiry trigger |
| `cooldown:{donorId}` | String | 90d | Donor cooldown flag |
| `ratelimit:{ip}:{route}` | Counter | 1min | Per-IP rate limiting |
| `geo:donor:{donorId}` | String | 1h | Last known donor location cache |
| `notify:match` | Pub/Sub channel | — | Match events |
| `notify:sos` | Pub/Sub channel | — | SOS broadcast events |
| `queue:notifications` | Bull Queue | — | Notification job queue |

---

## 7. Security Architecture

```mermaid
graph TD
    subgraph Perimeter["Perimeter Security"]
        WAF["AWS WAF\n(OWASP Top 10 rules)"]
        DDOS["AWS Shield\n(DDoS Protection)"]
        RL["Rate Limiting\n(100 req/min/IP)"]
    end

    subgraph Transport["Transport Security"]
        TLS["TLS 1.3\n(All endpoints)"]
        HSTS["HSTS Headers"]
        CORS["CORS Policy\n(Whitelist only)"]
    end

    subgraph Auth["Authentication & Authorization"]
        OAUTH["Google OAuth 2.0"]
        JWT["JWT (RS256, 1h TTL)"]
        RBAC["RBAC Middleware\n(Donor / Requester / Admin)"]
        COOKIE["httpOnly Secure Cookies"]
    end

    subgraph Data["Data Security"]
        ENC["AES-256 at Rest\n(RDS Encryption)"]
        PII["PII Masking\n(Exact coords hidden)"]
        AUDIT["Immutable Audit Logs"]
        DPDP["DPDP Act 2023 Compliance"]
    end

    subgraph Secrets["Secret Management"]
        SM["AWS Secrets Manager"]
        ENV["No secrets in code/env files"]
    end

    WAF --> TLS
    DDOS --> RL
    TLS --> OAUTH
    OAUTH --> JWT
    JWT --> RBAC
    RBAC --> COOKIE
    RBAC --> ENC
    ENC --> PII
    PII --> AUDIT
    SM --> ENV
```

### 7.1 Security Controls Summary

| Layer | Control | Implementation |
|-------|---------|---------------|
| **Network** | DDoS protection | AWS Shield Standard |
| **Network** | WAF rules | OWASP Top 10, SQL injection, XSS |
| **Transport** | Encryption | TLS 1.3 enforced, HSTS |
| **Auth** | Token signing | RS256 asymmetric JWT |
| **Auth** | Token storage | httpOnly + Secure + SameSite=Strict cookies |
| **Auth** | Token revocation | Redis blacklist on logout |
| **API** | Rate limiting | 100 req/min/IP; 10 req/min for SOS |
| **API** | Input validation | Zod schema validation on all routes |
| **Data** | At-rest encryption | AES-256 (AWS RDS + S3) |
| **Privacy** | Location masking | Only distance shown; coordinates never exposed |
| **Admin** | Audit trail | All admin actions logged (immutable) |
| **Compliance** | DPDP Act 2023 | Consent capture, data deletion on request |

### 7.2 Privacy Design — Donor Location

```
Donor registers → exact lat/lng stored in PostGIS (server-only)
                      ↓
Request created → matching query runs on server (no coords sent to client)
                      ↓
Donor matched → recipient sees only: "2.4 km away"
                      ↓
Donor accepts → recipient gets hospital address (not donor home location)
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph Internet["Internet"]
        USER["End Users"]
    end

    subgraph AWS["AWS Cloud (ap-south-1 — Mumbai)"]
        subgraph Edge["Edge"]
            R53["Route 53\n(DNS + Health Checks)"]
            CF["CloudFront CDN"]
            WAF["WAF + Shield"]
        end

        subgraph VPC["VPC (Private)"]
            subgraph Public["Public Subnets (2 AZs)"]
                ALB["Application Load Balancer"]
            end

            subgraph Private["Private Subnets (2 AZs)"]
                subgraph ECS["ECS Fargate Cluster"]
                    FE["Next.js Service\n(2–10 tasks)"]
                    API["API Services\n(2–20 tasks)"]
                    NS["Notification Service\n(2–8 tasks)"]
                    WS["WebSocket Service\n(2–8 tasks)"]
                end
            end

            subgraph Data["Data Subnets (2 AZs)"]
                RDS["RDS PostgreSQL\n(Multi-AZ, PostGIS)"]
                REDIS["ElastiCache Redis\n(Cluster Mode)"]
                S3["S3 Bucket\n(Private + Encrypted)"]
            end
        end

        subgraph Ops["Operations"]
            CW["CloudWatch\n(Logs + Metrics + Alarms)"]
            GH["GitHub Actions\n(CI/CD Pipeline)"]
            ECR["ECR\n(Container Registry)"]
            SM["Secrets Manager"]
        end
    end

    USER --> R53
    R53 --> CF
    CF --> WAF
    WAF --> ALB
    ALB --> FE
    ALB --> API
    ALB --> WS
    API --> RDS
    API --> REDIS
    NS --> REDIS
    NS --> RDS
    API --> S3
    GH --> ECR
    ECR --> ECS
    ECS --> CW
    ECS --> SM
```

### 8.1 CI/CD Pipeline

```mermaid
flowchart LR
    A["Developer\npushes code"] --> B["GitHub Actions\ntriggered"]
    B --> C["Run Tests\n(Jest + Supertest)"]
    C --> D{"Tests\nPassed?"}
    D -->|No| E["Fail + Notify developer"]
    D -->|Yes| F["Build Docker images"]
    F --> G["Push to AWS ECR"]
    G --> H["Deploy to Staging\n(ECS update)"]
    H --> I["Run E2E Tests\n(Playwright)"]
    I --> J{"E2E\nPassed?"}
    J -->|No| K["Rollback staging"]
    J -->|Yes| L["Manual approval\n(Production)"]
    L --> M["Blue/Green Deploy\nto Production ECS"]
    M --> N["Health check\n& smoke tests"]
    N --> O{"Healthy?"}
    O -->|No| P["Auto rollback\nto previous task def"]
    O -->|Yes| Q["Deploy complete\nCloudWatch alarm"]
```

---

## 9. Scaling Strategy

### 9.1 Auto-Scaling Configuration

```mermaid
graph TD
    subgraph Triggers["Scale Triggers"]
        CPU["CPU > 70% for 2 min"]
        MEM["Memory > 80% for 2 min"]
        RPS["Requests > 1000/s on ALB"]
        QD["Notification Queue Depth > 500"]
    end

    subgraph Services["Scaling Targets"]
        API_S["API Service\n2 → 20 tasks"]
        FE_S["Frontend Service\n2 → 10 tasks"]
        NS_S["Notification Service\n2 → 8 tasks"]
        WS_S["WebSocket Service\n2 → 8 tasks"]
    end

    subgraph DB["Database Scaling"]
        RR["RDS Read Replicas\n(up to 5)"]
        PG_POOL["PgBouncer\nConnection Pooling"]
        REDIS_C["Redis Cluster\n(Horizontal sharding)"]
    end

    CPU --> API_S
    MEM --> API_S
    RPS --> FE_S
    QD --> NS_S
    RPS --> WS_S
    API_S --> PG_POOL
    PG_POOL --> RR
    NS_S --> REDIS_C
```

---

### 9.2 Load Targets by Phase

| Phase | Users | Req/s (peak) | Strategy |
|-------|-------|-------------|----------|
| **MVP** | 10K concurrent | ~500 | Single region, 2 AZs, ECS Fargate |
| **Growth** | 100K concurrent | ~5,000 | Read replicas, Redis Cluster, CDN expansion |
| **Scale** | 1M concurrent | ~50,000 | Multi-region (Mumbai + Delhi), Global ALB, ElasticSearch for analytics |

---

### 9.3 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|------|------------|-----|-------------|
| Blood compatibility rules | In-memory (app start) | Indefinite | Code deploy |
| Donor geolocation | Redis | 1 hour | On location update |
| Active requests by city | Redis | 30 seconds | On new request / fulfillment |
| User profile | Redis | 15 minutes | On profile update |
| Analytics aggregates | Redis | 5 minutes | Scheduled job |
| JWT blacklist | Redis | Token TTL | On logout |

---

### 9.4 Database Optimization

```sql
-- Critical indexes for performance at scale

-- 1. Spatial index (already defined in §6.2)
CREATE INDEX idx_users_location ON users USING GIST(location_point);

-- 2. Composite index for eligibility filtering
CREATE INDEX idx_users_eligibility
  ON users(availability_status, blood_type)
  WHERE availability_status = 'ACTIVE';

-- 3. Active requests lookup
CREATE INDEX idx_requests_active
  ON blood_requests(status, blood_type, created_at)
  WHERE status = 'OPEN';

-- 4. Donor response lookup
CREATE INDEX idx_donor_responses_request
  ON donor_responses(request_id, action);

-- 5. Notification status tracking
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL;

-- 6. Donations cooldown check
CREATE INDEX idx_donations_donor_date
  ON donations(donor_id, donated_at DESC);
```

---

## Appendix — Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo vs Microservices | Modular Monorepo (MVP) → Microservices (Scale) | Faster iteration at MVP; clean module boundaries enable extraction later |
| WebSockets vs SSE | Socket.io (WebSockets) | Bidirectional needed for donor-response real-time; SSE is unidirectional |
| Bull vs SQS | Bull (Redis-backed) for MVP | Simplicity; migrate to SQS when notification volume exceeds Redis capacity |
| PgBouncer | Connection pooling at scale | PostgreSQL has finite connections; pooler prevents exhaustion under ECS task spikes |
| JWT algorithm | RS256 (asymmetric) | Verification-only nodes don't need signing key; more secure than HS256 |
| Blue/Green deploy | Zero downtime | Blood donation is life-critical; no rolling restarts that could drop active SOS flows |

---

*Document Owner: OneBlood Architecture Team*  
*Last Updated: June 12, 2026*  
*Next Review: July 1, 2026*
