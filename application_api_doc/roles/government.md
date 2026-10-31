# Government & Transit Authority Portal — API Documentation

> **Role:** `ROLE-GOVERNMENT-OFFICER` / `ROLE-SUPERADMIN`  
> **Base Path:** `https://api.vmovexa.com/api/v1` (Local: `http://localhost:4000/api/v1`)  
> **Total Endpoints:** 21 APIs (All 100% verified against backend route manifests)  
> **Updated:** 2026-10-31  
> **Emergency Authority:** Priority overrides on edge displays for public safety alerts (Disaster, AMBER, Traffic, Weather)

See [app developer guide](../APP_DEVELOPER_GUIDE.md) and [complete request reference](../API_REFERENCE.md). For realtime events see [REALTIME_AND_GPS.md](../REALTIME_AND_GPS.md).

---

## 📋 Complete Endpoints Summary (21 APIs)

### 1. Emergency SOS Broadcast Alerts (9 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/emergency-broadcasts` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | List active and archived emergency broadcasts | [Reference](../API_REFERENCE.md#get-api-v1-emergency-broadcasts) |
| `POST` | `/api/v1/emergency-broadcasts` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Dispatch high-priority SOS emergency broadcast to transit screens | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts) |
| `DELETE` | `/api/v1/emergency-broadcasts/:id` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Delete expired emergency alert | [Reference](../API_REFERENCE.md#delete-api-v1-emergency-broadcasts-id) |
| `GET` | `/api/v1/emergency-broadcasts/:id` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Get single emergency broadcast details & delivery logs | [Reference](../API_REFERENCE.md#get-api-v1-emergency-broadcasts-id) |
| `PATCH` | `/api/v1/emergency-broadcasts/:id` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Update broadcast message, area, or expiry | [Reference](../API_REFERENCE.md#patch-api-v1-emergency-broadcasts-id) |
| `PUT` | `/api/v1/emergency-broadcasts/:id` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Full update of emergency alert record | [Reference](../API_REFERENCE.md#put-api-v1-emergency-broadcasts-id) |
| `POST` | `/api/v1/emergency-broadcasts/:id/approve` | `campaigns.approve`, `platform.broadcast` | SuperAdmin approve public emergency alert | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-approve) |
| `POST` | `/api/v1/emergency-broadcasts/:id/reject` | `campaigns.approve`, `platform.broadcast` | SuperAdmin reject broadcast request | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-reject) |
| `POST` | `/api/v1/emergency-broadcasts/:id/revoke` | `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast` | Emergency revoke / cancel active screen override | [Reference](../API_REFERENCE.md#post-api-v1-emergency-broadcasts-id-revoke) |

### 2. Government Agencies & Transit Jurisdictions (12 APIs)
| Method | Endpoint | Permissions | Description | Reference |
|---|---|---|---|---|
| `GET` | `/api/v1/government` | `government.campaigns.view`, `users.view` | List accredited government bodies | [Reference](../API_REFERENCE.md#get-api-v1-government) |
| `POST` | `/api/v1/government` | `users.create` | Register a new public agency or ministry | [Reference](../API_REFERENCE.md#post-api-v1-government) |
| `DELETE` | `/api/v1/government/:id` | `users.delete` | Revoke agency credentials | [Reference](../API_REFERENCE.md#delete-api-v1-government-id) |
| `GET` | `/api/v1/government/:id` | `government.campaigns.view`, `users.view` | Get government agency profile | [Reference](../API_REFERENCE.md#get-api-v1-government-id) |
| `PATCH` | `/api/v1/government/:id` | `users.update` | Update agency contacts, nodal officer or clearance | [Reference](../API_REFERENCE.md#patch-api-v1-government-id) |
| `PUT` | `/api/v1/government/:id` | `users.update` | Full update of government agency record | [Reference](../API_REFERENCE.md#put-api-v1-government-id) |
| `PATCH` | `/api/v1/government/:id/status` | `users.update` | Update agency accreditation status | [Reference](../API_REFERENCE.md#patch-api-v1-government-id-status) |
| `GET` | `/api/v1/government/analytics` | `campaigns.analytics.view`, `government.analytics.view` | Government PSA broadcast impressions & reach analytics | [Reference](../API_REFERENCE.md#get-api-v1-government-analytics) |
| `GET` | `/api/v1/government/clearance-levels` | None | List authorized government clearance tiers | [Reference](../API_REFERENCE.md#get-api-v1-government-clearance-levels) |
| `GET` | `/api/v1/government/department-categories` | None | List official department categories | [Reference](../API_REFERENCE.md#get-api-v1-government-department-categories) |
| `GET` | `/api/v1/government/jurisdictions` | None | List regional transit authority municipal jurisdictions | [Reference](../API_REFERENCE.md#get-api-v1-government-jurisdictions) |
| `GET` | `/api/v1/government/meta/options` | None | Dropdown options for agency registration | [Reference](../API_REFERENCE.md#get-api-v1-government-meta-options) |

---

## 🚨 Emergency Broadcast Protocol

### 1. Screen Interruption Engine
- When `POST /api/v1/emergency-broadcasts` is activated with `severity: "critical"`, the edge display agent halts commercial playback immediately and displays the full-screen emergency layout with siren sound and ticker text.
- `POST /api/v1/emergency-broadcasts/:id/revoke`: Restores scheduled commercial playlist.

