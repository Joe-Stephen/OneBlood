# OneBlood — Matching Engine Design

**Version:** 1.0 | **Date:** June 12, 2026 | **Author:** Backend Engineering

---

## Table of Contents

1. [Compatibility Rules](#1-compatibility-rules)
2. [Matching Algorithm](#2-matching-algorithm)
3. [Database Queries](#3-database-queries)
4. [Redis Caching Strategy](#4-redis-caching-strategy)
5. [Edge Cases](#5-edge-cases)
6. [Pseudocode](#6-pseudocode)
7. [Scalability Considerations](#7-scalability-considerations)

---

## 1. Compatibility Rules

### 1.1 ABO + Rh Compatibility Matrix

The compatibility map is keyed by **recipient blood type** → **set of acceptable donor blood types**.

```
RECIPIENT  │  COMPATIBLE DONORS
───────────┼────────────────────────────────────────────────────
O−         │  O−
O+         │  O−, O+
A−         │  O−, A−
A+         │  O−, O+, A−, A+
B−         │  O−, B−
B+         │  O−, O+, B−, B+
AB−        │  O−, A−, B−, AB−
AB+        │  O−, O+, A−, A+, B−, B+, AB−, AB+  (universal recipient)
```

### 1.2 Donor Eligibility Criteria

A donor is **eligible** if ALL of the following are true:

| Check | Condition |
|-------|-----------|
| Blood type | Compatible with request type |
| Status | `availability_status = ACTIVE` |
| Cooldown | `next_eligible_date <= TODAY` OR `next_eligible_date IS NULL` |
| Not responded | Has NOT already accepted/declined this request |
| Not suspended | `is_eligible = TRUE`, `users.is_active = TRUE` |
| Health flag | No disqualifying condition in profile |

### 1.3 Cooldown Periods by Donation Type

| Donation Type | Cooldown |
|--------------|---------|
| Whole Blood | 90 days |
| Platelets | 14 days |
| Plasma | 28 days |
| Double Red Cells | 112 days |

### 1.4 Search Radius by Urgency

| Urgency | Initial Radius | Max Radius (after expansion) |
|---------|---------------|------------------------------|
| NORMAL | 10 km | 25 km |
| URGENT | 25 km | 50 km |
| SOS | 50 km | 150 km |

---

## 2. Matching Algorithm

### 2.1 Priority Score Formula

Each matched donor receives a **priority score** (lower = better). The matching engine returns donors sorted by this score.

```
score = (distance_weight × normalized_distance)
      + (recency_weight × days_since_last_donation_penalty)
      + (response_weight × historical_response_rate_penalty)

Weights:
  distance_weight         = 0.70   -- distance is the primary factor
  recency_weight          = 0.20   -- prefer donors who haven't donated recently (fresher)
  response_weight         = 0.10   -- prefer donors with high past acceptance rates

normalized_distance       = distance_meters / max_radius_meters  (0.0 → 1.0)
days_since_penalty        = 1 - (days_since_last_donation / 365) clamped to [0, 1]
response_rate_penalty     = 1 - (accepted_count / total_notified_count) clamped to [0, 1]
```

> **SOS Mode Override**: In SOS mode, `distance_weight = 0.90`, `recency_weight = 0.10`, `response_weight = 0.0`. Speed takes absolute priority.

### 2.2 Algorithm Flow

```
┌─────────────────────────────────────────────────────┐
│                   MATCH REQUEST                      │
│  Input: requestId, bloodType, location, urgency      │
└──────────────────────────┬──────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  1. Check Redis Cache   │
              │  key: match:{requestId} │
              └────────────┬────────────┘
                    HIT ◄──┴──► MISS
                     │              │
           Return cached      ┌─────▼──────────────────────┐
           donor list         │  2. Resolve compatible      │
                              │     blood types (in-memory) │
                              └─────┬──────────────────────┘
                                    │
                              ┌─────▼──────────────────────┐
                              │  3. PostGIS query           │
                              │     ST_DWithin(radius)      │
                              │     + eligibility filters   │
                              └─────┬──────────────────────┘
                                    │
                              ┌─────▼──────────────────────┐
                              │  4. Score & rank donors     │
                              │     (priority formula)      │
                              └─────┬──────────────────────┘
                                    │
                              ┌─────▼──────────────────────┐
                              │  5. Enough donors found?    │
                              └─────┬──────────────────────┘
                               NO ◄─┴─► YES
                               │              │
                    Expand radius       ┌─────▼──────────────┐
                    (up to max)         │  6. Cache results   │
                    Retry once          │     Redis 60s TTL   │
                               │       └─────┬──────────────┘
                               │             │
                               └──────►──────▼──────────────┐
                                            │  7. Publish    │
                                            │  notify:match  │
                                            │  to Redis      │
                                            └────────────────┘
```

### 2.3 Batch Notification Strategy

To avoid overwhelming donors with duplicate notifications for overlapping requests:

- **Deduplication window**: A donor who has already been notified for a different request in the last **10 minutes** is deprioritized (score += 0.3 penalty).
- **Max notifications per donor per day**: 3 (configurable). SOS bypasses this limit entirely.
- **Batch size**: Notify top **50 donors** at once. If fewer than 3 accept within 5 minutes → notify next batch of 25.

---

## 3. Database Queries

### 3.1 Core Matching Query (PostGIS)

```sql
-- Function: find_matching_donors
-- Called by the matching engine with radius derived from urgency level

SELECT
  dp.id                                              AS donor_profile_id,
  u.id                                               AS user_id,
  u.name,
  u.phone,
  dp.blood_type,
  ST_Distance(dp.location_point, ST_MakePoint($lon, $lat)::GEOGRAPHY) AS distance_meters,
  COALESCE(
    (SELECT donated_at FROM donations
     WHERE donor_id = dp.id
     ORDER BY donated_at DESC LIMIT 1),
    '1970-01-01'
  ) AS last_donated_at,
  COALESCE(
    (SELECT
       COUNT(*) FILTER (WHERE action = 'ACCEPTED')::FLOAT /
       NULLIF(COUNT(*), 0)
     FROM donor_responses
     WHERE donor_id = dp.id
    ), 0.5
  ) AS historical_acceptance_rate
FROM donor_profiles dp
JOIN users u ON u.id = dp.user_id
WHERE
  -- 1. Spatial filter (uses GiST index)
  ST_DWithin(
    dp.location_point,
    ST_MakePoint($lon, $lat)::GEOGRAPHY,
    $radius_meters
  )
  -- 2. Blood type compatibility
  AND dp.blood_type = ANY($compatible_types::blood_type[])
  -- 3. Availability
  AND dp.availability_status = 'ACTIVE'
  AND dp.is_eligible = TRUE
  AND u.is_active = TRUE
  -- 4. Cooldown cleared
  AND (dp.next_eligible_date IS NULL OR dp.next_eligible_date <= CURRENT_DATE)
  -- 5. Not already responded to this request
  AND NOT EXISTS (
    SELECT 1 FROM donor_responses dr
    WHERE dr.donor_id = dp.id
      AND dr.request_id = $request_id
  )
ORDER BY distance_meters ASC
LIMIT 100;
```

### 3.2 Radius Expansion Query

```sql
-- Used when initial radius returns fewer than MIN_DONORS_THRESHOLD
-- Simply re-run with expanded radius — PostGIS handles efficiently via GiST

SELECT COUNT(*) FROM donor_profiles dp
JOIN users u ON u.id = dp.user_id
WHERE
  ST_DWithin(dp.location_point, ST_MakePoint($lon, $lat)::GEOGRAPHY, $new_radius)
  AND dp.blood_type = ANY($compatible_types::blood_type[])
  AND dp.availability_status = 'ACTIVE'
  AND dp.is_eligible = TRUE;
```

### 3.3 Donor Notification History (deduplication check)

```sql
-- Check how many times a donor has been notified in the last N minutes
SELECT COUNT(*) FROM notifications
WHERE
  user_id = $user_id
  AND type = 'BLOOD_REQUEST_MATCH'
  AND sent_at >= NOW() - INTERVAL '10 minutes';
```

### 3.4 Daily Notification Cap Check

```sql
SELECT COUNT(*) FROM notifications
WHERE
  user_id = $user_id
  AND type IN ('BLOOD_REQUEST_MATCH', 'SOS_ALERT')
  AND sent_at >= CURRENT_DATE::TIMESTAMPTZ;
-- Returns count; engine skips if >= DAILY_NOTIFICATION_CAP (3)
-- SOS bypasses: skip this check for urgency_level = 'SOS'
```

---

## 4. Redis Caching Strategy

### 4.1 Donor Eligibility Cache

Avoid repeated DB reads for eligibility on every request creation.

```
Key:     donor:eligible:{donorId}
Type:    Hash
Fields:  blood_type, availability_status, is_eligible,
         next_eligible_date, lat, lon
TTL:     3600s (1 hour)

Invalidate on:
  - Donor profile update (PATCH /donors/profile)
  - Donation recorded (POST /donations)
  - Admin status change
  - Cooldown expiry (scheduled job sets status back to ACTIVE)
```

### 4.2 Match Result Cache

Cache match results to prevent duplicate PostGIS queries for the same request.

```
Key:     match:result:{requestId}
Type:    List (ordered donor IDs)
TTL:     60s (short — donor availability changes frequently)

Populated: After first matching query
Used:      If notification retry is needed within TTL window
Evicted:   On request status change (FULFILLED / CANCELLED)
```

### 4.3 Notification Dedup Cache

Prevent a donor from being notified twice for the same request.

```
Key:     notified:{requestId}:{donorId}
Type:    String ("1")
TTL:     Request expiry TTL (2h / 6h / 24h)

Set:     When notification is dispatched
Check:   Before each dispatch — skip if key exists
```

### 4.4 Daily Notification Counter

```
Key:     notif:daily:{donorId}:{YYYY-MM-DD}
Type:    Counter (INCR)
TTL:     86400s (1 day)

INCR on: Every non-SOS notification sent
Check:   Before dispatch — skip if counter >= 3
```

### 4.5 SOS Broadcast Cache

Track which donors were broadcast to in an active SOS to avoid repeat SMS.

```
Key:     sos:broadcast:{requestId}
Type:    Set (donor IDs)
TTL:     7200s (2 hours — SOS expiry)

SADD:    When SMS + push sent to donor
SISMEMBER: Before sending — skip if already in set
```

### 4.6 Active Donor Geo-Cache (future optimization)

```
Key:     geo:active:donors
Type:    Redis GEOADD sorted set
TTL:     None (rolling updates)

GEOADD:  On donor location update
GEODIST: Fast proximity check before PostGIS (pre-filter)
GEOSEARCH: For ultra-low latency approximate matching

Note:    Used as pre-filter only; PostGIS remains source of truth
```

---

## 5. Edge Cases

### 5.1 No Donors Found in Any Radius

```
Scenario: SOS raised for AB− in a rural area — zero eligible donors within 150km

Handling:
  1. Return empty match result immediately (don't block)
  2. Emit sos:no_match event to admin channel
  3. Admin receives alert with nearest donor info (outside radius)
  4. System suggests nearest blood bank with inventory (Phase 2)
  5. Auto-post to partner hospital network (Phase 2)
```

### 5.2 Donor Location Stale / Missing

```
Scenario: Donor registered 6 months ago and never updated location

Handling:
  1. location_point IS NULL check during query — donor excluded from spatial match
  2. Donor receives "Update your location to receive requests" prompt on app open
  3. Donors with location older than 30 days marked as LOW_PRIORITY in scoring
     (recency_weight penalty applied even if within radius)
```

### 5.3 Race Condition — Donor Accepts Two Requests Simultaneously

```
Scenario: Donor receives two concurrent requests, taps Accept on both before
          server processes first response

Handling:
  1. donor_responses has UNIQUE (donor_id, request_id) — prevents duplicate rows
  2. Transaction-level lock on donor_profiles row during status check
  3. Second acceptance returns 409 Conflict with message:
     "You have already committed to another request"
```

### 5.4 Donor Donates Externally (Walk-in) — System Unaware

```
Scenario: Donor donates at a blood bank directly (not via OneBlood)
          System still shows them as ACTIVE

Handling:
  1. Donor can self-report via "Log a donation" (sets cooldown manually)
  2. Hospital partners can mark donations against donor IDs (Phase 2)
  3. Scheduled job checks for donors who accepted a request but never
     confirmed donation → send reminder after 4 hours
```

### 5.5 Request Expires Mid-Match

```
Scenario: Matching engine finds donors; 3 accept — but request expires before
          all units are fulfilled

Handling:
  1. Redis TTL on request:expiry:{requestId} fires Bull job
  2. Job sets request.status = EXPIRED (only if not FULFILLED)
  3. Any accepted-but-not-donated donors receive cancellation notification
  4. Donor availability is NOT impacted (no donation was recorded)
```

### 5.6 Mass Casualty / Same-Location SOS Storm

```
Scenario: Disaster event — 50 SOS requests raised from same hospital
          simultaneously, flooding donors with notifications

Handling:
  1. Geo-dedup: If two SOS requests are within 500m and same blood type,
     merge notification into single "Multiple urgent requests near you"
  2. Rate limit SOS from same location: max 3 unique SOS broadcasts
     to a single donor per hour (Redis counter)
  3. Admin receives aggregated alert, not 50 individual alerts
```

### 5.7 Compatibility Edge — Rare Blood Types

```
Scenario: Bombay Blood Group (hh) — incompatible with all standard types

Handling:
  1. Blood type enum extended with 'BOMBAY_H' in Phase 2
  2. Special matching flag on donor profile: is_rare_type = TRUE
  3. Rare type requests escalate immediately to national registry
  4. Admin always notified for rare type requests
```

---

## 6. Pseudocode

### 6.1 Main Matching Engine (TypeScript)

```typescript
// matching.engine.ts

const COMPATIBILITY_MAP: Record<BloodType, BloodType[]> = {
  'O_NEG':  ['O_NEG'],
  'O_POS':  ['O_NEG', 'O_POS'],
  'A_NEG':  ['O_NEG', 'A_NEG'],
  'A_POS':  ['O_NEG', 'O_POS', 'A_NEG', 'A_POS'],
  'B_NEG':  ['O_NEG', 'B_NEG'],
  'B_POS':  ['O_NEG', 'O_POS', 'B_NEG', 'B_POS'],
  'AB_NEG': ['O_NEG', 'A_NEG', 'B_NEG', 'AB_NEG'],
  'AB_POS': ['O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
};

const RADIUS_CONFIG = {
  NORMAL: { initial: 10_000, max: 25_000 },
  URGENT: { initial: 25_000, max: 50_000 },
  SOS:    { initial: 50_000, max: 150_000 },
} as const;

const SCORE_WEIGHTS = {
  NORMAL: { distance: 0.70, recency: 0.20, responseRate: 0.10 },
  URGENT: { distance: 0.75, recency: 0.15, responseRate: 0.10 },
  SOS:    { distance: 0.90, recency: 0.10, responseRate: 0.00 },
};

const MIN_DONORS_THRESHOLD  = 5;
const DAILY_NOTIF_CAP       = 3;
const DEDUP_WINDOW_MINUTES  = 10;

async function runMatchingEngine(request: BloodRequest): Promise<MatchResult> {
  const compatibleTypes = COMPATIBILITY_MAP[request.bloodType];
  const radiusCfg       = RADIUS_CONFIG[request.urgencyLevel];
  const weights         = SCORE_WEIGHTS[request.urgencyLevel];
  const isSOS           = request.urgencyLevel === 'SOS';

  // --- Step 1: Cache check ---
  const cacheKey = `match:result:${request.id}`;
  const cached   = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // --- Step 2: Query PostGIS ---
  let donors = await queryEligibleDonors({
    requestId:       request.id,
    lat:             request.location.lat,
    lon:             request.location.lon,
    compatibleTypes,
    radiusMeters:    radiusCfg.initial,
  });

  // --- Step 3: Radius expansion if below threshold ---
  if (donors.length < MIN_DONORS_THRESHOLD) {
    donors = await queryEligibleDonors({
      requestId:    request.id,
      lat:          request.location.lat,
      lon:          request.location.lon,
      compatibleTypes,
      radiusMeters: radiusCfg.max,
    });
  }

  // --- Step 4: Score and rank ---
  const maxRadius  = radiusCfg.max;
  const scoredDonors = donors
    .map(donor => ({
      ...donor,
      score: computePriorityScore(donor, maxRadius, weights),
    }))
    .sort((a, b) => a.score - b.score);

  // --- Step 5: Apply notification filters ---
  const eligibleToNotify: ScoredDonor[] = [];

  for (const donor of scoredDonors) {
    if (eligibleToNotify.length >= 50) break;

    // SOS bypasses all caps
    if (!isSOS) {
      const dailyCount = await getDailyNotificationCount(donor.userId);
      if (dailyCount >= DAILY_NOTIF_CAP) continue;

      const recentCount = await getRecentNotificationCount(
        donor.userId, DEDUP_WINDOW_MINUTES
      );
      if (recentCount > 0) {
        donor.score += 0.3; // deprioritize but don't exclude
      }
    }

    const alreadyNotified = await redis.exists(
      `notified:${request.id}:${donor.donorProfileId}`
    );
    if (alreadyNotified) continue;

    eligibleToNotify.push(donor);
  }

  // --- Step 6: Cache result ---
  const result: MatchResult = {
    requestId:   request.id,
    totalFound:  donors.length,
    toNotify:    eligibleToNotify,
    expandedRadius: donors.length < MIN_DONORS_THRESHOLD,
  };

  await redis.setex(cacheKey, 60, JSON.stringify(result));

  // --- Step 7: Publish for notification dispatch ---
  await redis.publish('notify:match', JSON.stringify({
    requestId:    request.id,
    urgencyLevel: request.urgencyLevel,
    donors:       eligibleToNotify.map(d => ({
      userId:         d.userId,
      donorProfileId: d.donorProfileId,
      distanceMeters: d.distance_meters,
    })),
  }));

  return result;
}

// --- Priority score calculation ---
function computePriorityScore(
  donor: RawDonor,
  maxRadiusMeters: number,
  weights: ScoreWeights,
): number {
  const normalizedDistance = donor.distance_meters / maxRadiusMeters;

  const daysSinceDonation  = donor.last_donated_at
    ? daysBetween(donor.last_donated_at, new Date())
    : 365;
  const recencyPenalty     = Math.max(0, 1 - daysSinceDonation / 365);

  const responsePenalty    = 1 - Math.min(donor.historical_acceptance_rate, 1);

  return (
    weights.distance     * normalizedDistance +
    weights.recency      * recencyPenalty     +
    weights.responseRate * responsePenalty
  );
}
```

### 6.2 SOS Broadcast Handler

```typescript
// sos.handler.ts

async function handleSOSRequest(request: BloodRequest): Promise<void> {
  // SOS runs matching + notification in parallel pipelines
  const matchResult = await runMatchingEngine(request); // urgency=SOS radius

  const pipeline = redis.pipeline();

  for (const donor of matchResult.toNotify) {
    const sosKey = `sos:broadcast:${request.id}`;
    const alreadySent = await redis.sismember(sosKey, donor.donorProfileId);
    if (alreadySent) continue;

    // Dispatch FCM push
    await fcm.sendPush({
      token:   donor.fcmToken,
      title:   '🚨 URGENT Blood Needed',
      body:    `${request.bloodType} needed at ${request.hospitalName} — ${formatDistance(donor.distance_meters)} away`,
      data:    { requestId: request.id, urgency: 'SOS' },
      priority: 'high',
    });

    // Dispatch SMS
    await twilio.sendSMS({
      to:   donor.phone,
      body: `OneBlood SOS: ${request.bloodType} urgently needed at ${request.hospitalName}. Reply YES to confirm. ${APP_DEEP_LINK}/requests/${request.id}`,
    });

    // Track in Redis set
    pipeline.sadd(sosKey, donor.donorProfileId);
    pipeline.expire(sosKey, 7200); // 2h TTL
  }

  await pipeline.exec();

  // Notify admin
  await redis.publish('admin:sos:alert', JSON.stringify({
    requestId:    request.id,
    hospitalName: request.hospitalName,
    bloodType:    request.bloodType,
    donorsReached: matchResult.toNotify.length,
    timestamp:    new Date().toISOString(),
  }));
}
```

### 6.3 Cooldown Reset Job (Scheduled)

```typescript
// jobs/reset-cooldown.job.ts
// Runs daily at 00:05 IST via Bull cron

async function resetEligibleDonors(): Promise<void> {
  // Find donors whose cooldown expired today
  const donors = await db.query<{ id: string; userId: string }>(`
    SELECT id, user_id
    FROM donor_profiles
    WHERE
      availability_status = 'ON_COOLDOWN'
      AND next_eligible_date <= CURRENT_DATE
  `);

  for (const donor of donors.rows) {
    await db.query(`
      UPDATE donor_profiles
      SET availability_status = 'ACTIVE',
          is_eligible         = TRUE,
          updated_at          = NOW()
      WHERE id = $1
    `, [donor.id]);

    // Invalidate eligibility cache
    await redis.del(`donor:eligible:${donor.id}`);

    // Send push notification to donor
    await notificationQueue.add('cooldown-ended', {
      userId:   donor.userId,
      type:     'COOLDOWN_ENDED',
      channel:  'PUSH',
    });
  }

  logger.info(`Reset cooldown for ${donors.rowCount} donors`);
}
```

---

## 7. Scalability Considerations

### 7.1 Throughput Targets

| Scenario | Requests/sec | Donors queried | Target latency |
|----------|-------------|----------------|---------------|
| Normal load | 10 req/s | ~500 per query | < 200ms |
| Peak (festival/disaster) | 200 req/s | ~5,000 per query | < 500ms |
| SOS storm (mass casualty) | 50 SOS/s | ~50,000 per query | < 1s |

### 7.2 Optimizations at Scale

**PostGIS query optimization**
```sql
-- Use ST_DWithin (uses spatial index) — NOT ST_Distance < radius (does not)
-- Always filter status/blood_type BEFORE spatial filter when cardinality is low
-- CLUSTER donor_profiles USING idx_donor_profiles_location;
--   Physically sort table by location for sequential scan cache hits
```

**Matching Engine sharding**
```
At 1M+ active donors:
  Partition donor_profiles by geography (state / region)
  Route match queries to the correct partition shard
  Use CitusDB (PostgreSQL extension) for horizontal sharding
  Each shard handles a region independently
```

**Pre-computed Geo Buckets**
```
Divide India into H3 hexagonal grid (Uber H3 library, resolution 6 = ~36km cells)
On donor location update → compute H3 cell ID → store in donor_profiles.h3_cell

On match request:
  1. Get H3 cells within radius (fast in-memory lookup)
  2. Pre-filter by h3_cell (regular B-tree index — very fast)
  3. Then apply PostGIS ST_DWithin for exact distance
  → Reduces PostGIS candidates by ~80% before spatial index scan
```

**Redis Geo Index as Pre-filter**
```
GEOADD active:donors {lon} {lat} {donorProfileId}   -- on location update
GEOSEARCH active:donors FROMMEMBER {point} BYRADIUS {km} ASC COUNT 200
  → Returns candidate donor IDs (approximate, fast)
  → Then validate eligibility from cache or DB
  → Eliminates full PostGIS scan for small/medium requests
```

### 7.3 Matching Engine as Independent Service

```
At scale, extract matching engine to dedicated service:

  blood-request-service  →  publishes  →  match:queue (Redis Stream)
                                               │
                                         matching-service
                                         (dedicated workers, auto-scaled)
                                               │
                                         publishes notify:match
                                               │
                                         notification-service

Workers scale independently based on match:queue depth.
Each worker is stateless — horizontally scalable via ECS.
```

### 7.4 Circuit Breaker Pattern

```typescript
// If PostGIS query exceeds 2s → activate circuit breaker
// Fallback: use Redis GEOSEARCH (less precise, faster)
// Alert on-call team via PagerDuty

const matchWithCircuitBreaker = circuitBreaker(queryEligibleDonors, {
  timeout:        2000,  // 2s timeout
  errorThreshold: 50,    // trip after 50% failure rate
  resetTimeout:   30000, // retry after 30s
  fallback:       queryEligibleDonorsFromRedisGeo, // Redis fallback
});
```

### 7.5 Observability Metrics

| Metric | Alert Threshold |
|--------|----------------|
| `matching.query.duration_ms` (p99) | > 500ms |
| `matching.donors_found` (avg) | < 2 (no donors crisis) |
| `notifications.dispatch.failed_rate` | > 5% |
| `sos.first_acceptance_seconds` (p95) | > 600s (10 min) |
| `redis.match_cache.hit_rate` | < 20% (cache thrashing) |
| `queue.notifications.depth` | > 10,000 (backlog) |

---

*Document Owner: OneBlood Backend Engineering*  
*Last Updated: June 12, 2026*
