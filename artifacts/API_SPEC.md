# OneBlood — REST API Specification

**Version:** 1.0 | **Base URL:** `https://api.oneblood.in/v1`

---

## Global Conventions

### Authentication
All protected routes require: `Authorization: Bearer <access_token>`

### Pagination
```json
{ "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
```
Query params: `?page=1&limit=20`

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "bloodType", "message": "Required" }]
  }
}
```

### Error Codes
| HTTP | Code | Meaning |
|------|------|---------|
| 400 | VALIDATION_ERROR | Invalid input |
| 401 | UNAUTHORIZED | Missing/invalid token |
| 403 | FORBIDDEN | Insufficient role |
| 404 | NOT_FOUND | Resource missing |
| 409 | CONFLICT | Duplicate/state conflict |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Module 1 — Auth

### POST /auth/google
Exchange Google OAuth code for tokens.

**Request**
```json
{ "code": "string", "redirectUri": "string" }
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "DONOR | REQUESTER | ADMIN",
      "isProfileComplete": false
    }
  }
}
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "string" }
// Response 200
{ "success": true, "data": { "accessToken": "string", "expiresIn": 3600 } }
```

### POST /auth/logout — 🔒
```json
// Response 200
{ "success": true, "message": "Logged out successfully" }
```

---

## Module 2 — Users

### GET /users/me — 🔒
**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "googleId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "DONOR",
    "isActive": true,
    "createdAt": "ISO8601"
  }
}
```

### PATCH /users/me — 🔒
**Request** (all optional)
```json
{ "name": "string", "phone": "+919876543210" }
```
**Validation:** `phone` must match `^\+?[0-9]{10,15}$`

### DELETE /users/me — 🔒
Soft-deletes account. Sets `deleted_at`. Returns `204 No Content`.

---

## Module 3 — Donors

### POST /donors/profile — 🔒
Create donor profile (first-time setup).

**Request**
```json
{
  "bloodType": "O_POS",
  "weightKg": 72,
  "dateOfBirth": "1998-04-15",
  "city": "Bangalore",
  "state": "Karnataka",
  "location": { "lat": 12.9716, "lon": 77.5946 }
}
```
**Validation:**
- `bloodType`: enum `[A_POS,A_NEG,B_POS,B_NEG,AB_POS,AB_NEG,O_POS,O_NEG]`
- `weightKg`: integer, min 45, max 300
- `dateOfBirth`: age must be 18–65
- `location.lat`: −90 to 90, `location.lon`: −180 to 180

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "bloodType": "O_POS",
    "weightKg": 72,
    "dateOfBirth": "1998-04-15",
    "city": "Bangalore",
    "state": "Karnataka",
    "availabilityStatus": "ACTIVE",
    "isEligible": true,
    "nextEligibleDate": null
  }
}
```

### GET /donors/profile — 🔒
Returns current donor's profile. Same shape as POST response.

### PATCH /donors/profile — 🔒
**Request** (all optional)
```json
{
  "weightKg": 75,
  "city": "string",
  "state": "string",
  "location": { "lat": 12.97, "lon": 77.59 },
  "availabilityStatus": "INACTIVE"
}
```

### GET /donors/eligibility — 🔒
```json
{
  "success": true,
  "data": {
    "isEligible": true,
    "availabilityStatus": "ACTIVE",
    "nextEligibleDate": null,
    "cooldownDaysRemaining": 0,
    "lastDonatedAt": "2025-09-01T10:00:00Z"
  }
}
```

### GET /donors/nearby — 🔒 (ADMIN only)
Query params: `lat`, `lon`, `radiusKm` (default 10), `bloodType`, `page`, `limit`

**Response 200**
```json
{
  "success": true,
  "data": {
    "donors": [
      {
        "donorProfileId": "uuid",
        "name": "string",
        "bloodType": "O_POS",
        "distanceKm": 2.4,
        "availabilityStatus": "ACTIVE"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

---

## Module 4 — Blood Requests

### POST /requests — 🔒
**Request**
```json
{
  "bloodType": "A_NEG",
  "unitsRequired": 2,
  "hospitalName": "Apollo Hospital",
  "hospitalId": "uuid (optional)",
  "location": { "lat": 13.0012, "lon": 77.5768 },
  "urgencyLevel": "URGENT",
  "contactName": "Dr. Meena Iyer",
  "contactPhone": "+919876543210",
  "notes": "Post-operative patient, needs within 3 hours"
}
```
**Validation:**
- `bloodType`: required, enum
- `unitsRequired`: integer 1–20
- `urgencyLevel`: enum `[NORMAL, URGENT, SOS]`
- `contactPhone`: required, phone format
- `location`: required, valid lat/lon

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bloodType": "A_NEG",
    "unitsRequired": 2,
    "unitsFulfilled": 0,
    "hospitalName": "Apollo Hospital",
    "urgencyLevel": "URGENT",
    "status": "OPEN",
    "contactName": "Dr. Meena Iyer",
    "contactPhone": "+919876543210",
    "expiresAt": "2026-06-12T20:00:00Z",
    "createdAt": "2026-06-12T14:00:00Z",
    "matchedDonorsCount": 12
  }
}
```

### GET /requests — 🔒
Query params: `status`, `bloodType`, `urgencyLevel`, `city`, `page`, `limit`

**Response 200**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "uuid",
        "bloodType": "A_NEG",
        "unitsRequired": 2,
        "unitsFulfilled": 1,
        "hospitalName": "string",
        "urgencyLevel": "URGENT",
        "status": "PARTIALLY_MATCHED",
        "distanceKm": 3.1,
        "expiresAt": "ISO8601",
        "createdAt": "ISO8601"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

### GET /requests/:id — 🔒
Returns full request detail including accepted donors list.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bloodType": "A_NEG",
    "unitsRequired": 2,
    "unitsFulfilled": 1,
    "hospitalName": "Apollo Hospital",
    "urgencyLevel": "URGENT",
    "status": "PARTIALLY_MATCHED",
    "contactName": "string",
    "contactPhone": "string",
    "notes": "string",
    "expiresAt": "ISO8601",
    "fulfilledAt": null,
    "acceptedDonors": [
      { "donorName": "string", "bloodType": "O_NEG", "distanceKm": 1.2, "respondedAt": "ISO8601" }
    ],
    "createdAt": "ISO8601"
  }
}
```

### PATCH /requests/:id — 🔒 (owner only)
**Request** (all optional)
```json
{ "status": "CANCELLED", "notes": "string" }
```
- `status` can only be set to `CANCELLED` by owner; `FULFILLED` triggers donation record

### POST /requests/:id/respond — 🔒 (DONOR role)
**Request**
```json
{ "action": "ACCEPTED" }
```
- `action`: enum `[ACCEPTED, DECLINED]`

**Response 200 — if ACCEPTED**
```json
{
  "success": true,
  "data": {
    "message": "You have accepted this request. Please proceed to the hospital.",
    "hospital": {
      "name": "Apollo Hospital",
      "address": "string",
      "contactPhone": "string",
      "mapsLink": "https://maps.google.com/?q=..."
    }
  }
}
```

### POST /requests/sos — 🔒
Triggers immediate SOS broadcast. Same schema as POST /requests but `urgencyLevel` is forced to `SOS`.

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "urgencyLevel": "SOS",
    "status": "OPEN",
    "donorsAlerted": 34,
    "expiresAt": "ISO8601"
  }
}
```

---

## Module 5 — Donations

### POST /donations — 🔒 (DONOR role)
Log a completed donation.

**Request**
```json
{
  "requestId": "uuid (optional — walk-in)",
  "hospitalId": "uuid (optional)",
  "donationType": "WHOLE_BLOOD",
  "unitsDonated": 1,
  "donatedAt": "2026-06-12T11:00:00Z",
  "notes": "string (optional)"
}
```
**Validation:**
- `donationType`: enum `[WHOLE_BLOOD, PLATELETS, PLASMA, DOUBLE_RED_CELLS]`
- `unitsDonated`: integer 1–10
- `donatedAt`: must not be in the future

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "donationType": "WHOLE_BLOOD",
    "unitsDonated": 1,
    "donatedAt": "ISO8601",
    "nextEligibleDate": "2026-09-10",
    "cooldownDays": 90
  }
}
```

### GET /donations — 🔒
Returns current donor's donation history.
Query params: `page`, `limit`, `donationType`, `from`, `to`

**Response 200**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "uuid",
        "donationType": "WHOLE_BLOOD",
        "unitsDonated": 1,
        "hospitalName": "string",
        "donatedAt": "ISO8601",
        "nextEligibleDate": "ISO8601"
      }
    ],
    "totalDonations": 5,
    "totalUnitsDonated": 5,
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
}
```

### GET /donations/:id — 🔒
Returns single donation record.

---

## Module 6 — Notifications

### GET /notifications — 🔒
Query params: `status` (`READ | UNREAD`), `type`, `page`, `limit`

**Response 200**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "BLOOD_REQUEST_MATCH",
        "channel": "PUSH",
        "status": "DELIVERED",
        "body": "O+ blood needed 2.4km away at Apollo Hospital",
        "requestId": "uuid",
        "readAt": null,
        "sentAt": "ISO8601"
      }
    ],
    "unreadCount": 3,
    "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
  }
}
```

### PATCH /notifications/:id/read — 🔒
Mark single notification as read. Returns `200 { "success": true }`.

### PATCH /notifications/read-all — 🔒
Mark all notifications as read. Returns `200 { "success": true, "data": { "updatedCount": 5 } }`.

### POST /notifications/register-device — 🔒
Register FCM token for push notifications.

**Request**
```json
{ "fcmToken": "string", "platform": "WEB | ANDROID | IOS" }
```
**Response 200** `{ "success": true }`

---

## Module 7 — Admin

> All admin routes require `role: ADMIN`. Returns `403` otherwise.

### GET /admin/dashboard — 🔒 ADMIN
```json
{
  "success": true,
  "data": {
    "totalDonors": 125000,
    "activeDonors": 42000,
    "openRequests": 34,
    "sosActive": 2,
    "fulfillmentRate": 0.82,
    "avgResponseTimeMinutes": 11.4,
    "donationsByBloodType": {
      "O_POS": 3200, "A_NEG": 540
    }
  }
}
```

### GET /admin/users — 🔒 ADMIN
Query params: `role`, `isActive`, `bloodType`, `city`, `search`, `page`, `limit`

**Response 200**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "role": "DONOR",
        "isActive": true,
        "bloodType": "O_POS",
        "city": "string",
        "createdAt": "ISO8601"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1000, "totalPages": 50 }
  }
}
```

### PATCH /admin/users/:id — 🔒 ADMIN
**Request**
```json
{ "isActive": false, "role": "REQUESTER" }
```

### GET /admin/requests — 🔒 ADMIN
Query params: `status`, `urgencyLevel`, `bloodType`, `city`, `from`, `to`, `page`, `limit`

### GET /admin/hospitals — 🔒 ADMIN
Query params: `verificationStatus`, `city`, `page`, `limit`

### POST /admin/hospitals — 🔒 ADMIN
**Request**
```json
{
  "name": "Apollo Hospital",
  "registrationNumber": "KA-HOSP-2024-001",
  "contactEmail": "blood@apollo.in",
  "contactPhone": "+918022334455",
  "address": "string",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "location": { "lat": 12.9716, "lon": 77.5946 }
}
```

### PATCH /admin/hospitals/:id/verify — 🔒 ADMIN
**Request** `{ "status": "VERIFIED" }` — enum `[VERIFIED, REJECTED]`

### GET /admin/audit-logs — 🔒 ADMIN
Query params: `actorId`, `action`, `targetType`, `from`, `to`, `page`, `limit`

**Response 200**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "actorId": "uuid",
        "actorRole": "ADMIN",
        "action": "USER_SUSPENDED",
        "targetType": "users",
        "targetId": "uuid",
        "ipAddress": "203.x.x.x",
        "createdAt": "ISO8601"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
  }
}
```

### GET /admin/analytics — 🔒 ADMIN
Query params: `from`, `to`, `city`, `bloodType`, `groupBy` (`day|week|month`)

**Response 200**
```json
{
  "success": true,
  "data": {
    "period": { "from": "ISO8601", "to": "ISO8601" },
    "totalRequests": 1240,
    "fulfilledRequests": 1017,
    "fulfillmentRate": 0.82,
    "avgResponseMinutes": 11.4,
    "sosRequests": 48,
    "sosFulfillmentRate": 0.94,
    "timeline": [
      { "date": "2026-06-01", "requests": 42, "fulfilled": 36, "donations": 51 }
    ],
    "byBloodType": [
      { "bloodType": "O_POS", "requests": 380, "fulfilled": 320 }
    ],
    "byCity": [
      { "city": "Bangalore", "requests": 210, "fulfilled": 180 }
    ]
  }
}
```

### POST /admin/analytics/export — 🔒 ADMIN
**Request** `{ "from": "ISO8601", "to": "ISO8601", "format": "CSV" }`

**Response 200** — Returns signed S3 download URL.
```json
{ "success": true, "data": { "downloadUrl": "https://s3.../report.csv", "expiresAt": "ISO8601" } }
```

---

## Appendix — Enums Reference

| Enum | Values |
|------|--------|
| `BloodType` | `A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG` |
| `UrgencyLevel` | `NORMAL, URGENT, SOS` |
| `RequestStatus` | `OPEN, PARTIALLY_MATCHED, FULFILLED, EXPIRED, CANCELLED` |
| `AvailabilityStatus` | `ACTIVE, INACTIVE, ON_COOLDOWN, SUSPENDED` |
| `DonationType` | `WHOLE_BLOOD, PLATELETS, PLASMA, DOUBLE_RED_CELLS` |
| `DonorAction` | `ACCEPTED, DECLINED` |
| `NotificationType` | `BLOOD_REQUEST_MATCH, SOS_ALERT, DONOR_ACCEPTED, REQUEST_FULFILLED, COOLDOWN_ENDED, SYSTEM` |
| `NotificationChannel` | `PUSH, SMS, WEBSOCKET, EMAIL` |
| `VerificationStatus` | `PENDING, VERIFIED, REJECTED` |
| `UserRole` | `DONOR, REQUESTER, ADMIN` |

---

*Document Owner: OneBlood API Architecture Team | Last Updated: June 12, 2026*
