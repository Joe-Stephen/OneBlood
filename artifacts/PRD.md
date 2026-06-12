# OneBlood — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** June 12, 2026  
**Status:** Draft  
**Owner:** Product Team  
**Classification:** Internal

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Goals & Objectives](#2-goals--objectives)
3. [User Personas](#3-user-personas)
4. [User Journeys](#4-user-journeys)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics](#8-success-metrics)
9. [MVP Scope](#9-mvp-scope)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Product Vision

### Mission Statement
> *Save lives by connecting willing blood donors with recipients quickly and reliably.*

### Vision
OneBlood is India's most trusted real-time blood donation network — a platform where no patient waits for blood in a crisis and no donor's willingness goes to waste. By leveraging geolocation, intelligent compatibility matching, and instant notifications, OneBlood eliminates the fragmentation and delay that cost lives in India's existing blood supply chain.

### Problem Statement
India faces a chronic blood shortage of approximately **3 million units per year**. The gap between supply and demand is compounded by:
- **Fragmented discovery**: Donors and recipients rely on word-of-mouth, WhatsApp groups, and manual hospital coordination.
- **Time loss**: In emergencies, finding a compatible, available, nearby donor can take hours.
- **No eligibility tracking**: Donors who donated recently are unknowingly contacted, wasting time.
- **Zero real-time infrastructure**: No centralized platform exists that matches, notifies, and tracks donation in real time.

OneBlood solves all of these by providing a structured, intelligent, and life-saving platform.

---

## 2. Goals & Objectives

### Primary Goals

| # | Goal | Outcome |
|---|------|---------|
| G1 | Reduce time-to-donor for emergency requests | From hours to under 15 minutes |
| G2 | Build a verified, active donor network across India | 1M+ registered donors in Year 1 |
| G3 | Ensure blood compatibility accuracy | Zero mismatch incidents |
| G4 | Support emergency SOS situations | 95% SOS requests matched within 10 minutes |
| G5 | Maintain donor engagement and retention | 60%+ donor repeat donation rate |

### Business Objectives
- Establish OneBlood as the default blood donation platform for hospitals and blood banks in India.
- Partner with 500+ hospitals across metro and Tier-2 cities by end of Year 2.
- Achieve self-sustaining operations through institutional partnerships and CSR funding.

---

## 3. User Personas

### Persona 1 — Rahul Sharma (The Active Donor)

| Attribute | Detail |
|-----------|--------|
| Age | 26 |
| Occupation | Software Engineer, Bangalore |
| Blood Type | O+ |
| Motivation | Wants to help but has no organized way to know when/where to donate |
| Pain Points | Gets spammed with irrelevant messages; unsure if he is eligible after last donation |
| Tech Comfort | High |
| Goal | Register once, get notified when someone nearby needs his blood type, donate easily |

### Persona 2 — Dr. Meena Iyer (The Hospital Coordinator)

| Attribute | Detail |
|-----------|--------|
| Age | 42 |
| Occupation | Blood Bank In-charge, Chennai General Hospital |
| Motivation | Needs a reliable source to find donors quickly for emergency surgeries |
| Pain Points | Manual calls, outdated donor lists, no compatibility filter, donors who are ineligible |
| Tech Comfort | Moderate |
| Goal | Post a blood request and receive qualified donor matches within minutes |

### Persona 3 — Anita Kulkarni (The Concerned Family Member)

| Attribute | Detail |
|-----------|--------|
| Age | 34 |
| Occupation | Homemaker, Pune |
| Motivation | Father needs B− blood urgently; she has no contacts |
| Pain Points | Doesn't know where to start, no platform to trust, panicking in a crisis |
| Tech Comfort | Low–Moderate |
| Goal | Raise an SOS, find a donor fast, coordinate without technical friction |

### Persona 4 — Vikram Nair (The Platform Admin)

| Attribute | Detail |
|-----------|--------|
| Age | 30 |
| Occupation | OneBlood Operations Manager |
| Motivation | Ensure platform quality, prevent abuse, monitor key metrics |
| Pain Points | No visibility into request status, eligibility abuse, fake registrations |
| Tech Comfort | High |
| Goal | Manage donors, requests, flag abuse, view real-time dashboards |

---

## 4. User Journeys

### Journey 1 — Donor Registration & First Donation

```
[User opens OneBlood]
        ↓
[Sign in with Google OAuth]
        ↓
[Complete donor profile: Blood Type, City, Age, Health Conditions]
        ↓
[System verifies eligibility (age 18–65, weight > 50kg)]
        ↓
[Donor marked as "Available" in system]
        ↓
[Donor receives push notification for nearby blood request]
        ↓
[Donor accepts → gets recipient/hospital details]
        ↓
[Donor donates → marks donation complete]
        ↓
[System logs donation, starts 90-day cooldown, updates history]
```

### Journey 2 — Emergency Blood Request (Hospital)

```
[Hospital coordinator logs in]
        ↓
[Creates blood request: Blood Type, Units, Location, Urgency Level]
        ↓
[System runs compatibility matching + geolocation search]
        ↓
[Eligible donors within configurable radius receive push notification]
        ↓
[Donors respond (accept / decline)]
        ↓
[Coordinator sees confirmed donors in dashboard]
        ↓
[Donation fulfilled → request marked complete]
```

### Journey 3 — SOS Emergency Request

```
[Recipient or family member opens SOS flow]
        ↓
[Enters blood type, units needed, location (auto-detected)]
        ↓
[System broadcasts to ALL eligible donors within 50 km]
        ↓
[Push + SMS notifications sent simultaneously]
        ↓
[First responder donors notified with hospital address]
        ↓
[Progress tracked in real time on recipient's screen]
```

### Journey 4 — Admin Moderation

```
[Admin logs into dashboard]
        ↓
[Views real-time map of active requests and available donors]
        ↓
[Reviews flagged accounts (fake, ineligible donors)]
        ↓
[Views donation stats by region, blood type, time period]
        ↓
[Manages hospital/blood bank partnerships]
        ↓
[Exports reports for stakeholders]
```

---

## 5. User Stories

### Donor Stories

| ID | Story | Priority |
|----|-------|----------|
| DS-01 | As a donor, I want to register with Google OAuth so I can join quickly without a new password. | High |
| DS-02 | As a donor, I want to enter my blood type and location so the system can match me with nearby requests. | High |
| DS-03 | As a donor, I want to receive push notifications for compatible blood requests near me. | High |
| DS-04 | As a donor, I want to see my donation history so I can track my contribution. | Medium |
| DS-05 | As a donor, I want to see my eligibility countdown so I know when I can donate again. | High |
| DS-06 | As a donor, I want to pause notifications temporarily when I'm unavailable. | Medium |
| DS-07 | As a donor, I want to accept or decline a blood request with a single tap. | High |
| DS-08 | As a donor, I want to get directions to the hospital after accepting a request. | Medium |

### Recipient / Requester Stories

| ID | Story | Priority |
|----|-------|----------|
| RS-01 | As a hospital coordinator, I want to create a blood request with blood type, urgency, and location so compatible donors are notified. | High |
| RS-02 | As a recipient's family member, I want to raise an SOS request with one tap so I can get help fast. | High |
| RS-03 | As a requester, I want to see a list of donors who accepted my request so I can coordinate. | High |
| RS-04 | As a requester, I want to mark a request as fulfilled so the system can release matched donors. | Medium |
| RS-05 | As a requester, I want to set a request expiry time so stale requests are auto-closed. | Low |

### Admin Stories

| ID | Story | Priority |
|----|-------|----------|
| AS-01 | As an admin, I want a real-time dashboard showing active requests, available donors, and fulfillment rates. | High |
| AS-02 | As an admin, I want to verify and approve hospital accounts. | High |
| AS-03 | As an admin, I want to flag or suspend accounts that violate policies. | Medium |
| AS-04 | As an admin, I want to view analytics by city, blood type, and time range. | Medium |
| AS-05 | As an admin, I want to export donation and request reports as CSV. | Low |

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

| ID | Requirement |
|----|-------------|
| F-AUTH-01 | The system shall support Google OAuth 2.0 as the sole authentication method. |
| F-AUTH-02 | The system shall issue JWT tokens upon successful authentication. |
| F-AUTH-03 | The system shall enforce RBAC for three roles: `Donor`, `Requester`, and `Admin`. |
| F-AUTH-04 | Token refresh shall be handled silently; expired sessions shall redirect to login. |

### 6.2 Donor Registration & Profile

| ID | Requirement |
|----|-------------|
| F-DONOR-01 | Upon first login, users shall complete a profile: Full Name, Blood Type, Date of Birth, Weight, City, and Phone Number. |
| F-DONOR-02 | The system shall validate donor eligibility: age 18–65, weight ≥ 50 kg. |
| F-DONOR-03 | Donors shall be able to update their location (manual or GPS auto-detect). |
| F-DONOR-04 | Donors shall be able to toggle their availability status (Active / Inactive / On Cooldown). |
| F-DONOR-05 | The system shall automatically set a donor's status to "On Cooldown" for 90 days after a logged donation. |
| F-DONOR-06 | Donors shall view their complete donation history with date, location, and recipient/hospital. |

### 6.3 Blood Request Creation

| ID | Requirement |
|----|-------------|
| F-REQ-01 | Authenticated users shall be able to create blood requests. |
| F-REQ-02 | A blood request shall include: Blood Type Required, Units Required, Hospital Name, Location (lat/lng), Contact Number, Urgency Level (`Normal` / `Urgent` / `SOS`), and optional Notes. |
| F-REQ-03 | Requests shall have configurable expiry: 24 hours (Normal), 6 hours (Urgent), 2 hours (SOS). |
| F-REQ-04 | Requesters shall be able to cancel or mark requests as fulfilled manually. |
| F-REQ-05 | The system shall auto-close requests upon expiry. |

### 6.4 Blood Compatibility Matching

| ID | Requirement |
|----|-------------|
| F-MATCH-01 | The system shall implement ABO + Rh compatibility rules. |
| F-MATCH-02 | O− is universal donor; AB+ is universal recipient. |
| F-MATCH-03 | Matching shall filter by: compatible blood type, donor status = `Active`, last donation > 90 days ago. |
| F-MATCH-04 | Matched donors shall be ranked by proximity (nearest first). |

**Blood Compatibility Matrix:**

| Recipient ↓ \ Donor → | O− | O+ | A− | A+ | B− | B+ | AB− | AB+ |
|---|---|---|---|---|---|---|---|---|
| O− | ✅ | | | | | | | |
| O+ | ✅ | ✅ | | | | | | |
| A− | ✅ | | ✅ | | | | | |
| A+ | ✅ | ✅ | ✅ | ✅ | | | | |
| B− | ✅ | | | | ✅ | | | |
| B+ | ✅ | ✅ | | | ✅ | ✅ | | |
| AB− | ✅ | | ✅ | | ✅ | | ✅ | |
| AB+ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.5 Geolocation-Based Donor Search

| ID | Requirement |
|----|-------------|
| F-GEO-01 | The system shall use PostGIS to query donors within a configurable radius (10 km Normal, 25 km Urgent, 50 km SOS). |
| F-GEO-02 | Donor location shall be updated on each app open or manually triggered. |
| F-GEO-03 | Search results shall be ordered by distance ascending. |
| F-GEO-04 | Recipients shall not see exact donor coordinates — only approximate distance for privacy. |

### 6.6 Real-Time Notifications

| ID | Requirement |
|----|-------------|
| F-NOTIF-01 | The system shall send push notifications to matched donors when a request is created. |
| F-NOTIF-02 | Notifications shall include: blood type needed, distance to hospital, urgency level, and a deep-link to the request. |
| F-NOTIF-03 | SOS notifications shall be delivered via Push + SMS simultaneously. |
| F-NOTIF-04 | Donors shall receive confirmation when their response is acknowledged. |
| F-NOTIF-05 | Requesters shall be notified when a donor accepts their request. |
| F-NOTIF-06 | Notification delivery shall use Redis pub/sub for real-time propagation and WebSocket for active clients. |
| F-NOTIF-07 | Donors shall configure notification preferences (push on/off, quiet hours). |

### 6.7 Emergency SOS Requests

| ID | Requirement |
|----|-------------|
| F-SOS-01 | Any authenticated user shall trigger an SOS request via a dedicated, prominent UI button. |
| F-SOS-02 | SOS shall auto-populate location from device GPS. |
| F-SOS-03 | SOS requests shall bypass normal notification rate limits and reach all eligible donors within 50 km instantly. |
| F-SOS-04 | SOS status shall be visible to the requester in real time (donors notified, accepted, ETA). |
| F-SOS-05 | The admin team shall receive an alert for every SOS request created. |

### 6.8 Donation History & Eligibility Tracking

| ID | Requirement |
|----|-------------|
| F-HIST-01 | The system shall record every donation: donor ID, request ID, hospital, date, units donated. |
| F-HIST-02 | Donors shall view a paginated donation history list. |
| F-HIST-03 | The system shall enforce a 90-day whole-blood donation cooldown. |
| F-HIST-04 | A countdown timer shall show donors when they are next eligible ("Eligible in X days"). |
| F-HIST-05 | Platelet and plasma donations shall have separate configurable cooldown periods (default: 14 days). |
| F-HIST-06 | Donors with flagged health conditions shall be blocked from matching. |

### 6.9 Admin Dashboard

| ID | Requirement |
|----|-------------|
| F-ADMIN-01 | Admin shall have a live map view showing active requests and available donors by city. |
| F-ADMIN-02 | Admin shall search, view, and manage all donor and requester accounts. |
| F-ADMIN-03 | Admin shall approve or reject hospital/blood bank registrations. |
| F-ADMIN-04 | Admin shall suspend or ban accounts. |
| F-ADMIN-05 | Admin shall access analytics: total donations, fulfillment rate, avg. response time, by blood type and city. |
| F-ADMIN-06 | Admin shall export reports (CSV) for any date range. |
| F-ADMIN-07 | Admin shall receive alerts for all SOS requests. |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|----|-------------|
| NF-PERF-01 | Blood request creation and donor matching shall complete in < 2 seconds (p95). |
| NF-PERF-02 | Push notifications shall be dispatched within 5 seconds of request creation. |
| NF-PERF-03 | SOS notifications shall be dispatched within 3 seconds. |
| NF-PERF-04 | API response times shall be < 300 ms for read endpoints under normal load (p95). |
| NF-PERF-05 | The system shall support 10,000 concurrent active users at launch, scalable to 500,000. |

### 7.2 Availability & Reliability

| ID | Requirement |
|----|-------------|
| NF-AVAIL-01 | Platform uptime target: **99.9%** (≤ 8.7 hours downtime/year). |
| NF-AVAIL-02 | SOS notification delivery shall have a separate SLA of **99.99%**. |
| NF-AVAIL-03 | The system shall implement retry logic for failed notifications (3 retries, exponential backoff). |
| NF-AVAIL-04 | Database shall have automated daily backups with point-in-time recovery. |

### 7.3 Security

| ID | Requirement |
|----|-------------|
| NF-SEC-01 | All data in transit shall be encrypted using TLS 1.3. |
| NF-SEC-02 | All data at rest shall be encrypted using AES-256. |
| NF-SEC-03 | Donor exact location coordinates shall never be exposed to recipients. |
| NF-SEC-04 | The system shall comply with India's **Digital Personal Data Protection (DPDP) Act, 2023**. |
| NF-SEC-05 | Auth tokens shall expire in 1 hour; refresh tokens in 30 days. |
| NF-SEC-06 | Rate limiting: max 100 req/min per IP on all public endpoints. |
| NF-SEC-07 | All admin actions shall be logged in an immutable audit trail. |

### 7.4 Scalability

| ID | Requirement |
|----|-------------|
| NF-SCALE-01 | The backend shall be horizontally scalable via Docker + Kubernetes. |
| NF-SCALE-02 | Redis shall handle session caching, notification queues, and rate limiting. |
| NF-SCALE-03 | PostGIS geospatial queries shall be optimized with spatial indexes (GIST). |
| NF-SCALE-04 | The notification service shall be a separate microservice to scale independently. |

### 7.5 Accessibility & Usability

| ID | Requirement |
|----|-------------|
| NF-UX-01 | The platform shall be WCAG 2.1 Level AA compliant. |
| NF-UX-02 | SOS flow shall be completable in ≤ 3 taps. |
| NF-UX-03 | The platform shall support English and Hindi at launch. |
| NF-UX-04 | The UI shall be fully responsive across mobile, tablet, and desktop. |

---

## 8. Success Metrics

### North Star Metric
> **Number of lives saved** — measured by fulfilled blood requests within 1 hour of creation.

### Key Performance Indicators (KPIs)

| Category | Metric | Year 1 Target |
|----------|--------|---------------|
| **Growth** | Registered donors | 1,000,000 |
| **Growth** | Active donors (donated in last 6 months) | 200,000 |
| **Growth** | Cities covered | 50 |
| **Engagement** | Notification-to-acceptance rate | ≥ 30% |
| **Engagement** | Repeat donor rate | ≥ 60% |
| **Fulfillment** | Blood requests fulfilled | ≥ 80% |
| **Speed** | Avg. time from request to first donor acceptance | < 15 minutes |
| **Speed** | SOS first donor response time | < 10 minutes |
| **Reliability** | Platform uptime | ≥ 99.9% |
| **Safety** | Compatibility mismatch incidents | 0 |

---

## 9. MVP Scope

The MVP targets 5 metro cities (Bangalore, Mumbai, Delhi, Chennai, Hyderabad) with a **3-month development timeline**.

### ✅ In Scope (MVP)

| Feature | Priority |
|---------|----------|
| Google OAuth login | P0 |
| Donor profile creation (blood type, location, eligibility) | P0 |
| Blood request creation (Normal + Urgent) | P0 |
| ABO + Rh blood compatibility matching | P0 |
| Geolocation-based donor search (PostGIS) | P0 |
| Push notifications to matched donors (FCM) | P0 |
| Donor accept / decline flow | P0 |
| Donation history & 90-day cooldown tracking | P0 |
| SOS emergency requests | P1 |
| Basic admin dashboard (user management + request overview) | P1 |
| Donor availability toggle | P1 |

### ❌ Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| SMS notifications | Cost; deferred to Phase 2 |
| Dedicated hospital / blood bank portal | Separate product track |
| In-app chat between donor and recipient | Complexity |
| Multi-language support beyond English | Phase 2 |
| Platelet / plasma donation tracking | Phase 2 |
| Advanced analytics & CSV export | Phase 2 |
| Native iOS / Android apps | PWA first; Phase 2 |

### MVP Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 + PostGIS |
| Cache / Queue | Redis 7 |
| Auth | Google OAuth 2.0 + JWT |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Maps | Google Maps JavaScript API |
| Hosting | AWS (ECS + RDS + ElastiCache) |
| CI/CD | GitHub Actions |

---

## 10. Future Roadmap

### Phase 2 — Q3 2026

| Feature | Description |
|---------|-------------|
| SMS Notifications | Twilio integration for SOS and low-connectivity areas |
| Hospital Partner Portal | Dedicated dashboard for verified hospitals and blood banks |
| Native Mobile Apps | React Native apps for iOS and Android |
| Multi-language Support | Hindi, Tamil, Telugu, Marathi, Bengali |
| Platelet & Plasma Tracking | Separate eligibility rules per donation type |
| Donor Badges & Gamification | Milestone badges to drive retention |

### Phase 3 — Q1 2027

| Feature | Description |
|---------|-------------|
| Blood Inventory Management | Real-time blood unit tracking for partner blood banks |
| Predictive Demand Alerts | ML model to predict blood demand spikes by region/season |
| Corporate & College Drives | Tools to organize and track group donation campaigns |
| Donor Health Passbook | Digital record of health screenings and donation impact |
| WhatsApp Bot Integration | Request and match via WhatsApp for low-tech users |

### Phase 4 — Q3 2027

| Feature | Description |
|---------|-------------|
| Public API Platform | Open API for hospitals, NGOs, and state health departments |
| National Blood Grid | Integration with National Blood Transfusion Council (NBTC) data |
| AI Matching Engine | Predictive scoring for donor likelihood-to-respond |
| Telemedicine Pre-screening | Online eligibility check with a healthcare provider |
| Blockchain Audit Trail | Immutable donation records for compliance and trust |

---

## Appendix A — Glossary

| Term | Definition |
|------|-----------|
| **SOS Request** | Emergency broadcast to all eligible donors within 50 km simultaneously |
| **Cooldown Period** | Mandatory 90-day wait between two whole-blood donations |
| **Compatibility Matching** | ABO + Rh factor based blood type matching |
| **PostGIS** | PostgreSQL extension enabling geospatial proximity queries |
| **RBAC** | Role-Based Access Control governing permissions by user role |
| **FCM** | Firebase Cloud Messaging — Google's push notification service |
| **DPDP Act** | India's Digital Personal Data Protection Act, 2023 |

---

## Appendix B — High-Level Data Models

```
users
  id, googleId, name, email, phone, role,
  bloodType, weight, dob, locationPoint (PostGIS GEOGRAPHY),
  isEligible, availabilityStatus, createdAt

bloodRequests
  id, requesterId, bloodType, unitsRequired,
  hospitalName, locationPoint (PostGIS GEOGRAPHY),
  urgencyLevel, status, expiresAt, fulfilledAt, createdAt

donations
  id, donorId, requestId, donatedAt,
  units, hospitalName, nextEligibleDate

notifications
  id, userId, requestId, type,
  channel, status, sentAt, readAt
```

---

*Document Owner: OneBlood Product Team*  
*Last Updated: June 12, 2026*  
*Next Review: July 1, 2026*
