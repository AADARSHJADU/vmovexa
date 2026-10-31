# VMOVEXA API reference

Updated: 2026-10-31. 431 method/path combinations derived from current route wiring, including aliases, webhooks and health routes. Default prefix: /api/v1 (deployment API_PREFIX may override it).

Read [APP_DEVELOPER_GUIDE.md](APP_DEVELOPER_GUIDE.md) first for response envelopes, auth, GPS semantics, upload/download exceptions and limits. This is a request-validation and access-guard reference, not a claim that all responses have a machine-verified schema.

<a id="get-"></a>
### GET `/`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/app.js`. Implementation: `backend/src/app.js`.

<a id="get-api-v1"></a>
### GET `/api/v1`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/routes/index.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1).

<a id="get-api-v1-activity-logs"></a>
### GET `/api/v1/activity-logs`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.audit`, `activity.view`.

Controller response helpers: `paginated`; see global envelope rules.

**Validated query** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `page` | number | optional | integer; min {"limit":1} |
| `limit` | number | optional | integer; min {"limit":1}; max {"limit":200} |
| `pageSize` | number | optional | integer; min {"limit":1}; max {"limit":200} |
| `search` | string | optional | also allows ["",null] |
| `severity` | string | optional | one of ["INFO","WARNING","CRITICAL","",null] |
| `category` | string | optional | also allows ["",null] |
| `event` | string | optional | also allows ["",null] |
| `organizationId` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |
| `startDate` | string | optional | also allows ["",null] |
| `endDate` | string | optional | also allows ["",null] |
| `sortBy` | string | optional | one of ["created_at","severity","log_name","event","id","",null] |
| `sortOrder` | string | optional | one of ["ASC","DESC","asc","desc","",null] |

Route source: `backend/src/modules/activity/activity.routes.js`. Implementation: `backend/src/modules/activity/activity.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-activity-logs).

<a id="get-api-v1-activity-logs-id"></a>
### GET `/api/v1/activity-logs/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.audit`, `activity.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/activity/activity.routes.js`. Implementation: `backend/src/modules/activity/activity.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-activity-logs-id).

<a id="get-api-v1-activity-logs-categories"></a>
### GET `/api/v1/activity-logs/categories`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.audit`, `activity.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/activity/activity.routes.js`. Implementation: `backend/src/modules/activity/activity.controller.js.categories`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-activity-logs-categories).

<a id="get-api-v1-activity-logs-filters"></a>
### GET `/api/v1/activity-logs/filters`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.audit`, `activity.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/activity/activity.routes.js`. Implementation: `backend/src/modules/activity/activity.controller.js.filters`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-activity-logs-filters).

<a id="post-api-v1-admin-impersonate-userid"></a>
### POST `/api/v1/admin/impersonate/:userId`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.impersonate`.

Path parameters: `userId` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `userId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/admin/admin.routes.js`. Implementation: `backend/src/modules/admin/impersonation.controller.js.impersonate`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-admin-impersonate-userid).

<a id="post-api-v1-admin-impersonate-advertiser-advertiserid"></a>
### POST `/api/v1/admin/impersonate/advertiser/:advertiserId`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.impersonate`.

Path parameters: `advertiserId` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `advertiserId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/admin/admin.routes.js`. Implementation: `backend/src/modules/admin/impersonation.controller.js.impersonateAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-admin-impersonate-advertiser-advertiserid).

<a id="post-api-v1-admin-impersonate-stop"></a>
### POST `/api/v1/admin/impersonate/stop`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/admin/admin.routes.js`. Implementation: `backend/src/modules/admin/impersonation.controller.js.stop`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-admin-impersonate-stop).

<a id="post-api-v1-admin-impersonate-tenant-organizationid"></a>
### POST `/api/v1/admin/impersonate/tenant/:organizationId`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.impersonate`.

Path parameters: `organizationId` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/admin/admin.routes.js`. Implementation: `backend/src/modules/admin/impersonation.controller.js.impersonateTenant`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-admin-impersonate-tenant-organizationid).

<a id="get-api-v1-advertisers"></a>
### GET `/api/v1/advertisers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `users.view`.

Observed controller query fields: `search`, `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listAdvertisers`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-advertisers).

<a id="post-api-v1-advertisers"></a>
### POST `/api/v1/advertisers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.create`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | required | trim {"enabled":true} |
| `company_name` | string | optional | trim {"enabled":true}; min {"limit":1}; also allows [null] |
| `companyName` | string | optional | trim {"enabled":true}; min {"limit":1}; conditional: [{"ref":{"path":["company_name"]},"is":{"type":"any","flags":{"presence":"required"}},"then":{"type":"any","flags":{"presence":"optional"}},"otherwise":{"type":"any","flags":{"presence":"required"}}}] |
| `email` | string | required | email; trim {"enabled":true} |
| `phone` | string | required | trim {"enabled":true}; pattern {"regex":"/^[+]?[0-9\\s\\-()]{7,20}$/"} |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `businessType` | string | optional | also allows ["",null] |
| `initialWallet` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `documents` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true},"keys":{"url":{"type":"string","flags":{"presence":"required"}},"key":{"type":"string","allow":["",null]},"name":{"type":"string","allow":["",null]},"fileType":{"type":"string","allow":["",null]},"mime":{"type":"string","allow":["",null]},"fileSize":{"type":"number","allow":[null]},"size":{"type":"number","allow":[null]},"purpose":{"type":"string","allow":["",null]}}}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-advertisers).

<a id="delete-api-v1-advertisers-id"></a>
### DELETE `/api/v1/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-advertisers-id).

<a id="get-api-v1-advertisers-id"></a>
### GET `/api/v1/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `users.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-advertisers-id).

<a id="patch-api-v1-advertisers-id"></a>
### PATCH `/api/v1/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `companyName` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `company_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `contact_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `email` | string | optional | email; trim {"enabled":true}; also allows ["",null] |
| `phone` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `newDocuments` | array | optional | also allows [null] |
| `documents` | array | optional | also allows [null] |
| `removedDocumentIds` | array | optional | also allows [null]; items: [{"type":"alternatives","matches":[{"schema":{"type":"number"}},{"schema":{"type":"string"}}]}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |
| `account_status` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-advertisers-id).

<a id="put-api-v1-advertisers-id"></a>
### PUT `/api/v1/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `companyName` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `company_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `contact_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `email` | string | optional | email; trim {"enabled":true}; also allows ["",null] |
| `phone` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `newDocuments` | array | optional | also allows [null] |
| `documents` | array | optional | also allows [null] |
| `removedDocumentIds` | array | optional | also allows [null]; items: [{"type":"alternatives","matches":[{"schema":{"type":"number"}},{"schema":{"type":"string"}}]}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |
| `account_status` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-advertisers-id).

<a id="patch-api-v1-advertisers-id-status"></a>
### PATCH `/api/v1/advertisers/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.setAdvertiserStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-advertisers-id-status).

<a id="get-api-v1-approvals"></a>
### GET `/api/v1/approvals`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.view`, `orgs.approve`, `fleet.fleets.view`.

Observed controller query fields: `entityType`, `limit`, `page`, `state`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/approvals/approval.routes.js`. Implementation: `backend/src/modules/approvals/approval.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-approvals).

<a id="get-api-v1-approvals-id"></a>
### GET `/api/v1/approvals/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.view`, `orgs.approve`, `fleet.fleets.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/approvals/approval.routes.js`. Implementation: `backend/src/modules/approvals/approval.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-approvals-id).

<a id="post-api-v1-approvals-id-approve"></a>
### POST `/api/v1/approvals/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.approve`, `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/approvals/approval.routes.js`. Implementation: `backend/src/modules/approvals/approval.controller.js.approve`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-approvals-id-approve).

<a id="post-api-v1-approvals-id-reject"></a>
### POST `/api/v1/approvals/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.approve`, `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/approvals/approval.routes.js`. Implementation: `backend/src/modules/approvals/approval.controller.js.reject`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-approvals-id-reject).

<a id="post-api-v1-auth-accept-invite"></a>
### POST `/api/v1/auth/accept-invite`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `password`, `token`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `token` | string | required | — |
| `password` | string | required | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}} |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.acceptInvite`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-accept-invite).

<a id="post-api-v1-auth-change-password"></a>
### POST `/api/v1/auth/change-password`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `currentPassword`, `newPassword`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `currentPassword` | string | required | — |
| `newPassword` | string | required | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}} |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.changePassword`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-change-password).

<a id="post-api-v1-auth-complete-organization-profile"></a>
### POST `/api/v1/auth/complete-organization-profile`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `address`, `cin`, `city`, `gstin`, `lat`, `latitude`, `lng`, `longitude`, `office_address`, `organizationName`, `phone`, `pincode`, `state`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.completeOrganizationProfile`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-complete-organization-profile).

<a id="post-api-v1-auth-forgot-password"></a>
### POST `/api/v1/auth/forgot-password`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `email`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `email` | string | required | trim {"enabled":true}; email |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.forgotPassword`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-forgot-password).

<a id="post-api-v1-auth-login-email"></a>
### POST `/api/v1/auth/login-email`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `email`, `password`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `email` | string | required | trim {"enabled":true}; email |
| `password` | string | required | — |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.loginEmail`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-login-email).

<a id="post-api-v1-auth-login-phone"></a>
### POST `/api/v1/auth/login-phone`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `password`, `phone`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `phone` | string | required | pattern {"regex":"/^(\\+91[-\\s]?)?[6-9]\\d{9}$/"} |
| `password` | string | required | — |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.loginPhone`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-login-phone).

<a id="post-api-v1-auth-logout"></a>
### POST `/api/v1/auth/logout`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `refreshToken`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `refreshToken` | string | optional | — |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.logout`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-logout).

<a id="get-api-v1-auth-me"></a>
### GET `/api/v1/auth/me`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.me`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-me).

<a id="patch-api-v1-auth-me"></a>
### PATCH `/api/v1/auth/me`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.updateMe`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-auth-me).

<a id="put-api-v1-auth-me"></a>
### PUT `/api/v1/auth/me`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.updateMe`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-auth-me).

<a id="post-api-v1-auth-refresh"></a>
### POST `/api/v1/auth/refresh`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `refreshToken`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `refreshToken` | string | required | — |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.refresh`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-refresh).

<a id="post-api-v1-auth-register"></a>
### POST `/api/v1/auth/register`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `organizationName` | string | required | min {"limit":2} |
| `name` | string | required | min {"limit":2} |
| `email` | string | required | email |
| `phone` | string | optional | also allows ["",null] |
| `password` | string | required | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}} |
| `state` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `cin` | string | optional | also allows ["",null] |
| `gstin` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"string","rules":[{"name":"trim","args":{"enabled":true}},{"name":"case","args":{"direction":"upper"}},{"name":"pattern","message":{"template":"Invalid GSTIN format (e.g. 27AAACM1234F1Z8)."},"args":{"regex":"/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/"}}]}},{"schema":{"type":"string","flags":{"only":true},"rules":[{"name":"trim","args":{"enabled":true}}],"allow":["","NA","N/A","NONE","0"]}}] |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.register`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-register).

<a id="post-api-v1-auth-request-signup-otp"></a>
### POST `/api/v1/auth/request-signup-otp`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `email`, `name`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.requestRegistrationOtp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-request-signup-otp).

<a id="post-api-v1-auth-reset-password"></a>
### POST `/api/v1/auth/reset-password`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `code`, `email`, `newPassword`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `email` | string | required | trim {"enabled":true}; email |
| `code` | string | required | trim {"enabled":true}; length {"limit":6} |
| `newPassword` | string | required | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}} |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.resetPassword`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-reset-password).

<a id="post-api-v1-auth-resubmit-registration"></a>
### POST `/api/v1/auth/resubmit-registration`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `email` | string | required | email |
| `organizationName` | string | optional | min {"limit":2}; also allows ["",null] |
| `name` | string | optional | min {"limit":2}; also allows ["",null] |
| `phone` | string | optional | also allows ["",null] |
| `password` | string | optional | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}}; also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `cin` | string | optional | also allows ["",null] |
| `gstin` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"string","rules":[{"name":"trim","args":{"enabled":true}},{"name":"case","args":{"direction":"upper"}},{"name":"pattern","message":{"template":"Invalid GSTIN format (e.g. 27AAACM1234F1Z8)."},"args":{"regex":"/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/"}}]}},{"schema":{"type":"string","flags":{"only":true},"rules":[{"name":"trim","args":{"enabled":true}}],"allow":["","NA","N/A","NONE","0"]}}] |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.resubmitRegistration`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-resubmit-registration).

<a id="get-api-v1-auth-social"></a>
### GET `/api/v1/auth/social`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-social).

<a id="delete-api-v1-auth-social-provider-unlink"></a>
### DELETE `/api/v1/auth/social/:provider/unlink`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `provider` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-auth-social-provider-unlink).

<a id="post-api-v1-auth-social-apple"></a>
### POST `/api/v1/auth/social/apple`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-apple).

<a id="get-api-v1-auth-social-apple-callback"></a>
### GET `/api/v1/auth/social/apple/callback`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-apple-callback).

<a id="post-api-v1-auth-social-apple-callback"></a>
### POST `/api/v1/auth/social/apple/callback`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-apple-callback).

<a id="get-api-v1-auth-social-apple-url"></a>
### GET `/api/v1/auth/social/apple/url`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-apple-url).

<a id="post-api-v1-auth-social-firebase-apple"></a>
### POST `/api/v1/auth/social/firebase/apple`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-apple).

<a id="post-api-v1-auth-social-firebase-apple-register"></a>
### POST `/api/v1/auth/social/firebase/apple/register`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-apple-register).

<a id="post-api-v1-auth-social-firebase-google"></a>
### POST `/api/v1/auth/social/firebase/google`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-google).

<a id="post-api-v1-auth-social-firebase-google-register"></a>
### POST `/api/v1/auth/social/firebase/google/register`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-firebase-google-register).

<a id="post-api-v1-auth-social-zoho"></a>
### POST `/api/v1/auth/social/zoho`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-social-zoho).

<a id="get-api-v1-auth-social-zoho-callback"></a>
### GET `/api/v1/auth/social/zoho/callback`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-zoho-callback).

<a id="get-api-v1-auth-social-zoho-url"></a>
### GET `/api/v1/auth/social/zoho/url`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/social/social.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-social-zoho-url).

<a id="get-api-v1-auth-test-send-sms"></a>
### GET `/api/v1/auth/test-send-sms`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-auth-test-send-sms).

<a id="post-api-v1-auth-verify-otp"></a>
### POST `/api/v1/auth/verify-otp`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `code`, `identifier`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `identifier` | string | required | — |
| `code` | string | required | length {"limit":6} |

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.verifyOtp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-verify-otp).

<a id="post-api-v1-auth-verify-signup-otp"></a>
### POST `/api/v1/auth/verify-signup-otp`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `code`, `email`, `name`, `otp`, `password`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/auth.routes.js`. Implementation: `backend/src/modules/auth/auth.controller.js.verifyRegistrationOtp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-auth-verify-signup-otp).

<a id="post-api-v1-billing-cron-check-expiries"></a>
### POST `/api/v1/billing/cron/check-expiries`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.manage`, `finance.subscriptions.manage`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.runExpiryScan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-cron-check-expiries).

<a id="get-api-v1-billing-gateways"></a>
### GET `/api/v1/billing/gateways`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listGateways`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-gateways).

<a id="put-api-v1-billing-gateways-id"></a>
### PUT `/api/v1/billing/gateways/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller body fields: `is_active`, `is_default`, `live_publishable_key`, `live_secret_key`, `live_webhook_secret`, `merchant_id`, `mode`, `name`, `test_publishable_key`, `test_secret_key`, `test_webhook_secret`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.updateGateway`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-billing-gateways-id).

<a id="post-api-v1-billing-gateways-id-simulate-order"></a>
### POST `/api/v1/billing/gateways/:id/simulate-order`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller body fields: `amount`, `live_publishable_key`, `live_secret_key`, `mode`, `test_publishable_key`, `test_secret_key`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.simulateTestOrder`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-gateways-id-simulate-order).

<a id="post-api-v1-billing-gateways-id-test"></a>
### POST `/api/v1/billing/gateways/:id/test`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller body fields: `live_publishable_key`, `live_secret_key`, `mode`, `test_publishable_key`, `test_secret_key`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.testGatewayConnection`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-gateways-id-test).

<a id="post-api-v1-billing-gateways-id-test-connection"></a>
### POST `/api/v1/billing/gateways/:id/test-connection`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller body fields: `live_publishable_key`, `live_secret_key`, `mode`, `test_publishable_key`, `test_secret_key`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.testGatewayConnection`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-gateways-id-test-connection).

<a id="get-api-v1-billing-invoices"></a>
### GET `/api/v1/billing/invoices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listInvoices`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-invoices).

<a id="get-api-v1-billing-invoices-id"></a>
### GET `/api/v1/billing/invoices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.getInvoice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-invoices-id).

<a id="get-api-v1-billing-invoices-id-html"></a>
### GET `/api/v1/billing/invoices/:id/html`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Path parameters: `id` (required).

Observed controller query fields: `print`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.getInvoiceHtml`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-invoices-id-html).

<a id="post-api-v1-billing-invoices-id-pay"></a>
### POST `/api/v1/billing/invoices/:id/pay`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.payInvoice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-invoices-id-pay).

<a id="get-api-v1-billing-plans"></a>
### GET `/api/v1/billing/plans`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller query fields: `all`, `includeInactive`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listPlans`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-plans).

<a id="post-api-v1-billing-plans"></a>
### POST `/api/v1/billing/plans`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.createPlan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-plans).

<a id="delete-api-v1-billing-plans-id"></a>
### DELETE `/api/v1/billing/plans/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.deletePlan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-billing-plans-id).

<a id="put-api-v1-billing-plans-id"></a>
### PUT `/api/v1/billing/plans/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.plans.manage`, `billing.plans.view`, `platform.settings`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.updatePlan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-billing-plans-id).

<a id="get-api-v1-billing-revenue-settlements"></a>
### GET `/api/v1/billing/revenue/settlements`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.revenue.view`, `finance.settlements.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listSettlements`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-revenue-settlements).

<a id="get-api-v1-billing-revenue-shares"></a>
### GET `/api/v1/billing/revenue/shares`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.revenue.view`, `finance.settlements.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listRevenueShares`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-revenue-shares).

<a id="get-api-v1-billing-revenue-summary"></a>
### GET `/api/v1/billing/revenue/summary`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.revenue.view`, `finance.settlements.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.revenueSummary`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-revenue-summary).

<a id="get-api-v1-billing-revenue-top-tenants"></a>
### GET `/api/v1/billing/revenue/top-tenants`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.revenue.view`, `finance.settlements.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.topTenants`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-revenue-top-tenants).

<a id="get-api-v1-billing-subscription"></a>
### GET `/api/v1/billing/subscription`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Observed controller query fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.getSubscription`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-subscription).

<a id="get-api-v1-billing-subscription-check-status"></a>
### GET `/api/v1/billing/subscription/check-status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller query fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.checkPaymentStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-subscription-check-status).

<a id="post-api-v1-billing-subscription-check-status"></a>
### POST `/api/v1/billing/subscription/check-status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller query fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.checkPaymentStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-subscription-check-status).

<a id="post-api-v1-billing-subscription-confirm"></a>
### POST `/api/v1/billing/subscription/confirm`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `orderId`, `organizationId`, `paymentCode`, `planId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `orderId` | string | optional | — |
| `razorpayOrderId` | string | optional | — |
| `razorpayPaymentId` | string | required | — |
| `razorpaySignature` | string | required | — |
| `paymentCode` | string | optional | — |
| `planId` | number | optional | integer |
| `organizationId` | number | optional | integer |

Root constraints: `{"dependencies":[{"rel":"or","peers":["orderId","razorpayOrderId"]}]}`.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.confirmSubscriptionPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-subscription-confirm).

<a id="post-api-v1-billing-subscription-order"></a>
### POST `/api/v1/billing/subscription/order`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `billingCycle`, `buyerState`, `cancelUrl`, `customerName`, `gateway`, `gstin`, `organizationId`, `planId`, `successUrl`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `planId` | number | required | integer |
| `organizationId` | number | optional | integer |
| `gateway` | string | optional | one of ["stripe","razorpay","cashfree"] |
| `gstin` | string | optional | also allows ["",null] |
| `customerName` | string | optional | also allows ["",null] |
| `buyerState` | string | optional | also allows ["",null] |
| `billingCycle` | string | optional | one of ["monthly","annually","yearly","annual"] |

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.createSubscriptionOrder`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-subscription-order).

<a id="post-api-v1-billing-subscription-verify-session"></a>
### POST `/api/v1/billing/subscription/verify-session`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller body fields: `orderId`, `organizationId`, `sessionId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller query fields: `sessionId`, `stripe_session`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `sessionId` | string | required | — |
| `organizationId` | number | optional | integer |

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.verifySession`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-subscription-verify-session).

<a id="get-api-v1-billing-transactions"></a>
### GET `/api/v1/billing/transactions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.view`, `billing.invoices.view`, `finance.invoices.view`, `billing.transactions.view`, `billing.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.listTransactions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-transactions).

<a id="post-api-v1-billing-transactions-manual-offline"></a>
### POST `/api/v1/billing/transactions/manual-offline`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `billing.subscriptions.manage`, `finance.subscriptions.manage`.

Observed controller body fields: `amount`, `bankName`, `bankRef`, `bank_name`, `bank_ref`, `notes`, `organizationId`, `organization_id`, `paymentDate`, `payment_date`, `planId`, `plan_id`, `reference_number`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.recordOfflinePayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-billing-transactions-manual-offline).

<a id="get-api-v1-billing-wallet"></a>
### GET `/api/v1/billing/wallet`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/billing.routes.js`. Implementation: `backend/src/modules/payments/billing.controller.js.getWalletBalance`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-billing-wallet).

<a id="get-api-v1-campaigns"></a>
### GET `/api/v1/campaigns`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listCampaigns`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns).

<a id="post-api-v1-campaigns"></a>
### POST `/api/v1/campaigns`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.create`, `government.campaigns.create`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `name` | string | optional | also allows ["",null] |
| `brandName` | string | optional | also allows ["",null] |
| `brand_name` | string | optional | also allows ["",null] |
| `clientName` | string | optional | also allows ["",null] |
| `client_name` | string | optional | also allows ["",null] |
| `clientCompany` | string | optional | also allows ["",null] |
| `client_company` | string | optional | also allows ["",null] |
| `clientEmail` | string | optional | email; also allows ["",null] |
| `client_email` | string | optional | email; also allows ["",null] |
| `clientPhone` | string | optional | also allows ["",null] |
| `client_phone` | string | optional | also allows ["",null] |
| `clientCity` | string | optional | also allows ["",null] |
| `client_city` | string | optional | also allows ["",null] |
| `clientState` | string | optional | also allows ["",null] |
| `client_state` | string | optional | also allows ["",null] |
| `clientPincode` | string | optional | also allows ["",null] |
| `client_pincode` | string | optional | also allows ["",null] |
| `clientLatitude` | number | optional | also allows [null] |
| `client_latitude` | number | optional | also allows [null] |
| `clientLongitude` | number | optional | also allows [null] |
| `client_longitude` | number | optional | also allows [null] |
| `clientAddress` | string | optional | also allows ["",null] |
| `client_address` | string | optional | also allows ["",null] |
| `description` | string | optional | max {"limit":2000}; also allows ["",null] |
| `targetAudience` | string | optional | also allows ["",null] |
| `target_audience` | string | optional | also allows ["",null] |
| `ownerType` | string | optional | one of ["advertiser","government"]; default "advertiser" |
| `owner_type` | string | optional | one of ["advertiser","government"] |
| `advertiserId` | number | optional | integer; also allows [null] |
| `advertiser_id` | number | optional | integer; also allows [null] |
| `governmentAgencyId` | number | optional | integer; also allows [null] |
| `government_agency_id` | number | optional | integer; also allows [null] |
| `type` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `slotType` | string | optional | also allows ["",null] |
| `slot_type` | string | optional | also allows ["",null] |
| `durationPerPlaySec` | number | optional | integer |
| `duration_per_play_sec` | number | optional | integer |
| `durationDays` | number | optional | integer; also allows [null] |
| `duration_days` | number | optional | integer; also allows [null] |
| `budget` | number | optional | — |
| `dailyBudget` | number | optional | — |
| `daily_budget` | number | optional | — |
| `totalPlaysRequested` | number | optional | integer |
| `total_plays_requested` | number | optional | integer |
| `startDate` | date | optional | also allows [null] |
| `start_date` | date | optional | also allows [null] |
| `endDate` | date | optional | also allows [null] |
| `end_date` | date | optional | also allows [null] |
| `priority` | string | optional | also allows ["",null]; default "normal" |
| `status` | string | optional | one of ["draft","pending_approval","approved","live","paused","completed","rejected","",null] |
| `isDraft` | boolean | optional | also allows [null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `media_url` | string | optional | also allows ["",null] |
| `videoUrl` | string | optional | also allows ["",null] |
| `video_url` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media_type` | string | optional | also allows ["",null] |
| `contentType` | string | optional | also allows ["",null] |
| `media` | array | optional | max {"limit":50}; also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]},"sequenceOrder":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"sequence_order":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"displayDurationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"display_duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"isEnabled":{"type":"boolean","allow":[null]},"is_enabled":{"type":"boolean","allow":[null]}}}] |
| `media_assets` | array | optional | max {"limit":50}; also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]},"sequenceOrder":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"sequence_order":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"displayDurationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"display_duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"isEnabled":{"type":"boolean","allow":[null]},"is_enabled":{"type":"boolean","allow":[null]}}}] |
| `slot` | object | optional | also allows [null] |
| `slot.routeId` | number | optional | integer; also allows [null] |
| `slot.route_id` | number | optional | integer; also allows [null] |
| `slot.startDate` | date | optional | also allows [null] |
| `slot.start_date` | date | optional | also allows [null] |
| `slot.endDate` | date | optional | also allows [null] |
| `slot.end_date` | date | optional | also allows [null] |
| `slot.startTime` | string | optional | also allows ["",null] |
| `slot.start_time` | string | optional | also allows ["",null] |
| `slot.endTime` | string | optional | also allows ["",null] |
| `slot.end_time` | string | optional | also allows ["",null] |
| `slot.vehicleId` | number | optional | integer; also allows [null] |
| `slot.vehicle_id` | number | optional | integer; also allows [null] |
| `slot.screenId` | number | optional | integer; also allows [null] |
| `slot.screen_id` | number | optional | integer; also allows [null] |
| `slot.activeDays` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `slot.active_days` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `slots` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `activeDays` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `active_days` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `broadcastStartTime` | string | optional | also allows ["",null] |
| `broadcast_start_time` | string | optional | also allows ["",null] |
| `broadcastEndTime` | string | optional | also allows ["",null] |
| `broadcast_end_time` | string | optional | also allows ["",null] |
| `checksum` | string | optional | also allows ["",null] |
| `objective` | string | optional | also allows ["",null] |
| `frequency` | string | optional | also allows ["",null] |
| `qrRedirectUrl` | string | optional | max {"limit":2048}; also allows ["",null] |
| `qr_redirect_url` | string | optional | max {"limit":2048}; also allows ["",null] |
| `campaignType` | string | optional | also allows ["",null] |
| `campaign_type` | string | optional | also allows ["",null] |
| `targetingMode` | string | optional | also allows ["",null] |
| `targeting_mode` | string | optional | also allows ["",null] |
| `placement` | string | optional | also allows ["",null] |
| `qrPlacement` | string | optional | also allows ["",null] |
| `qr_placement` | string | optional | also allows ["",null] |
| `timezone` | string | optional | also allows ["",null] |
| `promoCode` | string | optional | also allows ["",null] |
| `promo_code` | string | optional | also allows ["",null] |
| `budgetType` | string | optional | also allows ["",null] |
| `budget_type` | string | optional | also allows ["",null] |
| `paymentBreakdown` | object | optional | also allows [null]; additional keys allowed |
| `payment_breakdown` | object | optional | also allows [null]; additional keys allowed |
| `resolution` | string | optional | also allows ["",null] |
| `fileSize` | string | optional | also allows ["",null] |
| `file_size` | string | optional | also allows ["",null] |
| `fileName` | string | optional | also allows ["",null] |
| `file_name` | string | optional | also allows ["",null] |
| `targets` | array | optional | max {"limit":100}; items: [{"type":"object","keys":{"organizationId":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"organization_id":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fleetName":{"type":"string","allow":["",null]},"fleet_name":{"type":"string","allow":["",null]},"fleetId":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fleet_id":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"city":{"type":"string","allow":["",null]},"displayType":{"type":"string","allow":["",null]},"display_type":{"type":"string","allow":["",null]},"screensCount":{"type":"number","rules":[{"name":"integer"}]},"screens_count":{"type":"number","rules":[{"name":"integer"}]},"vehiclesCount":{"type":"number","rules":[{"name":"integer"}]},"vehicles_count":{"type":"number","rules":[{"name":"integer"}]},"routeId":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"route_id":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"vehicleIds":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"vehicle_ids":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"screenIds":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"screen_ids":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"screensPerVehicle":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"screens_per_vehicle":{"type":"number","rules":[{"name":"integer"}],"allow":[null]}}}] |

Root constraints: `{"dependencies":[{"rel":"or","peers":["title","name"]}]}`.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns).

<a id="delete-api-v1-campaigns-id"></a>
### DELETE `/api/v1/campaigns/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.delete`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-campaigns-id).

<a id="get-api-v1-campaigns-id"></a>
### GET `/api/v1/campaigns/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-id).

<a id="patch-api-v1-campaigns-id"></a>
### PATCH `/api/v1/campaigns/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `brandName` | string | optional | also allows ["",null] |
| `brand_name` | string | optional | also allows ["",null] |
| `clientName` | string | optional | also allows ["",null] |
| `client_name` | string | optional | also allows ["",null] |
| `clientCompany` | string | optional | also allows ["",null] |
| `client_company` | string | optional | also allows ["",null] |
| `clientEmail` | string | optional | email; also allows ["",null] |
| `client_email` | string | optional | email; also allows ["",null] |
| `clientPhone` | string | optional | also allows ["",null] |
| `client_phone` | string | optional | also allows ["",null] |
| `clientCity` | string | optional | also allows ["",null] |
| `client_city` | string | optional | also allows ["",null] |
| `clientState` | string | optional | also allows ["",null] |
| `client_state` | string | optional | also allows ["",null] |
| `clientPincode` | string | optional | also allows ["",null] |
| `client_pincode` | string | optional | also allows ["",null] |
| `clientLatitude` | number | optional | also allows [null] |
| `client_latitude` | number | optional | also allows [null] |
| `clientLongitude` | number | optional | also allows [null] |
| `client_longitude` | number | optional | also allows [null] |
| `clientAddress` | string | optional | also allows ["",null] |
| `client_address` | string | optional | also allows ["",null] |
| `description` | string | optional | also allows ["",null] |
| `targetAudience` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `slotType` | string | optional | also allows ["",null] |
| `slot_type` | string | optional | also allows ["",null] |
| `durationPerPlaySec` | number | optional | integer |
| `duration_per_play_sec` | number | optional | integer |
| `durationDays` | number | optional | integer; also allows [null] |
| `duration_days` | number | optional | integer; also allows [null] |
| `frequency` | string | optional | also allows ["",null] |
| `totalPlaysRequested` | number | optional | integer |
| `total_plays_requested` | number | optional | integer |
| `budget` | number | optional | — |
| `dailyBudget` | number | optional | — |
| `daily_budget` | number | optional | — |
| `budgetType` | string | optional | also allows ["",null] |
| `budget_type` | string | optional | also allows ["",null] |
| `startDate` | date | optional | also allows [null] |
| `start_date` | date | optional | also allows [null] |
| `endDate` | date | optional | also allows [null] |
| `end_date` | date | optional | also allows [null] |
| `activeDays` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `active_days` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `broadcastStartTime` | string | optional | also allows ["",null] |
| `broadcast_start_time` | string | optional | also allows ["",null] |
| `broadcastEndTime` | string | optional | also allows ["",null] |
| `broadcast_end_time` | string | optional | also allows ["",null] |
| `objective` | string | optional | also allows ["",null] |
| `priority` | string | optional | one of ["normal","high"] |
| `status` | string | optional | one of ["draft","pending_approval","approved","live","paused","completed","rejected","",null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media` | array | optional | also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]}}}] |
| `media_assets` | array | optional | also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]}}}] |
| `qrRedirectUrl` | string | optional | also allows ["",null] |
| `qr_redirect_url` | string | optional | also allows ["",null] |
| `campaignType` | string | optional | also allows ["",null] |
| `campaign_type` | string | optional | also allows ["",null] |
| `targetingMode` | string | optional | also allows ["",null] |
| `targeting_mode` | string | optional | also allows ["",null] |
| `placement` | string | optional | also allows ["",null] |
| `timezone` | string | optional | also allows ["",null] |
| `promoCode` | string | optional | also allows ["",null] |
| `promo_code` | string | optional | also allows ["",null] |
| `paymentBreakdown` | object | optional | also allows [null]; additional keys allowed |
| `payment_breakdown` | object | optional | also allows [null]; additional keys allowed |
| `resolution` | string | optional | also allows ["",null] |
| `fileSize` | string | optional | also allows ["",null] |
| `targets` | array | optional | — |
| `slot` | object | optional | also allows [null]; additional keys allowed |
| `slots` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-campaigns-id).

<a id="put-api-v1-campaigns-id"></a>
### PUT `/api/v1/campaigns/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `brandName` | string | optional | also allows ["",null] |
| `brand_name` | string | optional | also allows ["",null] |
| `clientName` | string | optional | also allows ["",null] |
| `client_name` | string | optional | also allows ["",null] |
| `clientCompany` | string | optional | also allows ["",null] |
| `client_company` | string | optional | also allows ["",null] |
| `clientEmail` | string | optional | email; also allows ["",null] |
| `client_email` | string | optional | email; also allows ["",null] |
| `clientPhone` | string | optional | also allows ["",null] |
| `client_phone` | string | optional | also allows ["",null] |
| `clientCity` | string | optional | also allows ["",null] |
| `client_city` | string | optional | also allows ["",null] |
| `clientState` | string | optional | also allows ["",null] |
| `client_state` | string | optional | also allows ["",null] |
| `clientPincode` | string | optional | also allows ["",null] |
| `client_pincode` | string | optional | also allows ["",null] |
| `clientLatitude` | number | optional | also allows [null] |
| `client_latitude` | number | optional | also allows [null] |
| `clientLongitude` | number | optional | also allows [null] |
| `client_longitude` | number | optional | also allows [null] |
| `clientAddress` | string | optional | also allows ["",null] |
| `client_address` | string | optional | also allows ["",null] |
| `description` | string | optional | also allows ["",null] |
| `targetAudience` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `slotType` | string | optional | also allows ["",null] |
| `slot_type` | string | optional | also allows ["",null] |
| `durationPerPlaySec` | number | optional | integer |
| `duration_per_play_sec` | number | optional | integer |
| `durationDays` | number | optional | integer; also allows [null] |
| `duration_days` | number | optional | integer; also allows [null] |
| `frequency` | string | optional | also allows ["",null] |
| `totalPlaysRequested` | number | optional | integer |
| `total_plays_requested` | number | optional | integer |
| `budget` | number | optional | — |
| `dailyBudget` | number | optional | — |
| `daily_budget` | number | optional | — |
| `budgetType` | string | optional | also allows ["",null] |
| `budget_type` | string | optional | also allows ["",null] |
| `startDate` | date | optional | also allows [null] |
| `start_date` | date | optional | also allows [null] |
| `endDate` | date | optional | also allows [null] |
| `end_date` | date | optional | also allows [null] |
| `activeDays` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `active_days` | array | optional | also allows [null]; items: [{"type":"string"}] |
| `broadcastStartTime` | string | optional | also allows ["",null] |
| `broadcast_start_time` | string | optional | also allows ["",null] |
| `broadcastEndTime` | string | optional | also allows ["",null] |
| `broadcast_end_time` | string | optional | also allows ["",null] |
| `objective` | string | optional | also allows ["",null] |
| `priority` | string | optional | one of ["normal","high"] |
| `status` | string | optional | one of ["draft","pending_approval","approved","live","paused","completed","rejected","",null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media` | array | optional | also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]}}}] |
| `media_assets` | array | optional | also allows [null]; items: [{"type":"object","keys":{"fileUrl":{"type":"string","allow":["",null]},"file_url":{"type":"string","allow":["",null]},"url":{"type":"string","allow":["",null]},"mediaType":{"type":"string","allow":["",null]},"media_type":{"type":"string","allow":["",null]},"resolution":{"type":"string","allow":["",null]},"durationSec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"duration_sec":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"fileSize":{"type":"string","allow":["",null]},"file_size":{"type":"string","allow":["",null]},"checksum":{"type":"string","allow":["",null]}}}] |
| `qrRedirectUrl` | string | optional | also allows ["",null] |
| `qr_redirect_url` | string | optional | also allows ["",null] |
| `campaignType` | string | optional | also allows ["",null] |
| `campaign_type` | string | optional | also allows ["",null] |
| `targetingMode` | string | optional | also allows ["",null] |
| `targeting_mode` | string | optional | also allows ["",null] |
| `placement` | string | optional | also allows ["",null] |
| `timezone` | string | optional | also allows ["",null] |
| `promoCode` | string | optional | also allows ["",null] |
| `promo_code` | string | optional | also allows ["",null] |
| `paymentBreakdown` | object | optional | also allows [null]; additional keys allowed |
| `payment_breakdown` | object | optional | also allows [null]; additional keys allowed |
| `resolution` | string | optional | also allows ["",null] |
| `fileSize` | string | optional | also allows ["",null] |
| `targets` | array | optional | — |
| `slot` | object | optional | also allows [null]; additional keys allowed |
| `slots` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-campaigns-id).

<a id="get-api-v1-campaigns-id-analytics"></a>
### GET `/api/v1/campaigns/:id/analytics`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.analytics.view`, `government.analytics.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.campaignAnalytics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-id-analytics).

<a id="post-api-v1-campaigns-id-approve"></a>
### POST `/api/v1/campaigns/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.approveCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-approve).

<a id="post-api-v1-campaigns-id-complete"></a>
### POST `/api/v1/campaigns/:id/complete`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.endCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-complete).

<a id="post-api-v1-campaigns-id-confirm-payment"></a>
### POST `/api/v1/campaigns/:id/confirm-payment`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.pay`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `razorpayPaymentId` | string | optional | also allows ["",null] |
| `razorpay_payment_id` | string | optional | also allows ["",null] |
| `razorpayOrderId` | string | optional | also allows ["",null] |
| `razorpay_order_id` | string | optional | also allows ["",null] |
| `razorpaySignature` | string | optional | also allows ["",null] |
| `razorpay_signature` | string | optional | also allows ["",null] |
| `paymentMethod` | string | optional | also allows ["",null] |
| `payment_method` | string | optional | also allows ["",null] |
| `gateway` | string | optional | also allows ["",null] |
| `amount` | number | optional | also allows [null] |
| `transactionId` | string | optional | also allows ["",null] |
| `transaction_id` | string | optional | also allows ["",null] |
| `redirectUrl` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.confirmPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-confirm-payment).

<a id="post-api-v1-campaigns-id-end"></a>
### POST `/api/v1/campaigns/:id/end`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.endCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-end).

<a id="post-api-v1-campaigns-id-pause"></a>
### POST `/api/v1/campaigns/:id/pause`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.stopCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-pause).

<a id="post-api-v1-campaigns-id-pay"></a>
### POST `/api/v1/campaigns/:id/pay`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.pay`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.initiatePayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-pay).

<a id="post-api-v1-campaigns-id-pay-confirm"></a>
### POST `/api/v1/campaigns/:id/pay/confirm`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.pay`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `razorpayPaymentId` | string | optional | also allows ["",null] |
| `razorpay_payment_id` | string | optional | also allows ["",null] |
| `razorpayOrderId` | string | optional | also allows ["",null] |
| `razorpay_order_id` | string | optional | also allows ["",null] |
| `razorpaySignature` | string | optional | also allows ["",null] |
| `razorpay_signature` | string | optional | also allows ["",null] |
| `paymentMethod` | string | optional | also allows ["",null] |
| `payment_method` | string | optional | also allows ["",null] |
| `gateway` | string | optional | also allows ["",null] |
| `amount` | number | optional | also allows [null] |
| `transactionId` | string | optional | also allows ["",null] |
| `transaction_id` | string | optional | also allows ["",null] |
| `redirectUrl` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.confirmPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-pay-confirm).

<a id="get-api-v1-campaigns-id-public-checkout"></a>
### GET `/api/v1/campaigns/:id/public-checkout`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller query fields: `token`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getPublicCheckoutInfo`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-id-public-checkout).

<a id="get-api-v1-campaigns-id-public-invoice"></a>
### GET `/api/v1/campaigns/:id/public-invoice`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller query fields: `print`, `token`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getPublicInvoiceHtml`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-id-public-invoice).

<a id="post-api-v1-campaigns-id-public-order"></a>
### POST `/api/v1/campaigns/:id/public-order`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createPublicPaymentOrder`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-public-order).

<a id="post-api-v1-campaigns-id-public-pay"></a>
### POST `/api/v1/campaigns/:id/public-pay`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.processPublicPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-public-pay).

<a id="post-api-v1-campaigns-id-record-offline-payment"></a>
### POST `/api/v1/campaigns/:id/record-offline-payment`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.pay`, `campaigns.update`, `government.campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated params** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `id` | alternatives | required | alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `amount` | number | required | sign {"sign":"positive"} |
| `offlineMethod` | string | optional | one of ["cash","cheque","demand_draft","neft","rtgs","imps","upi_manual","bank_transfer","other","",null] |
| `offline_method` | string | optional | one of ["cash","cheque","demand_draft","neft","rtgs","imps","upi_manual","bank_transfer","other","",null] |
| `referenceNumber` | string | optional | max {"limit":191}; also allows ["",null] |
| `reference_number` | string | optional | max {"limit":191}; also allows ["",null] |
| `bankName` | string | optional | max {"limit":191}; also allows ["",null] |
| `bank_name` | string | optional | max {"limit":191}; also allows ["",null] |
| `branchName` | string | optional | max {"limit":100}; also allows ["",null] |
| `branch_name` | string | optional | max {"limit":100}; also allows ["",null] |
| `accountHolder` | string | optional | max {"limit":200}; also allows ["",null] |
| `account_holder` | string | optional | max {"limit":200}; also allows ["",null] |
| `chequeNumber` | string | optional | max {"limit":80}; also allows ["",null] |
| `cheque_number` | string | optional | max {"limit":80}; also allows ["",null] |
| `chequeDate` | alternatives | optional | alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string","allow":["",null]}}] |
| `cheque_date` | alternatives | optional | alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string","allow":["",null]}}] |
| `utrNumber` | string | optional | max {"limit":100}; also allows ["",null] |
| `utr_number` | string | optional | max {"limit":100}; also allows ["",null] |
| `transactionId` | string | optional | max {"limit":191}; also allows ["",null] |
| `transaction_id` | string | optional | max {"limit":191}; also allows ["",null] |
| `remarks` | string | optional | max {"limit":1000}; also allows ["",null] |
| `proofUrl` | string | optional | max {"limit":512}; also allows ["",null] |
| `proof_url` | string | optional | max {"limit":512}; also allows ["",null] |
| `collectedAt` | alternatives | optional | alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string","allow":["",null]}}] |
| `collected_at` | alternatives | optional | alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string","allow":["",null]}}] |
| `verifiedByName` | string | optional | max {"limit":200}; also allows ["",null] |
| `verified_by_name` | string | optional | max {"limit":200}; also allows ["",null] |
| `currency` | string | optional | max {"limit":8}; also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.recordOfflinePayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-record-offline-payment).

<a id="post-api-v1-campaigns-id-reject"></a>
### POST `/api/v1/campaigns/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.approve`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.rejectCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-reject).

<a id="get-api-v1-campaigns-id-reviews"></a>
### GET `/api/v1/campaigns/:id/reviews`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listCampaignReviews`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-id-reviews).

<a id="post-api-v1-campaigns-id-share-payment-link"></a>
### POST `/api/v1/campaigns/:id/share-payment-link`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.sharePaymentLink`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-share-payment-link).

<a id="post-api-v1-campaigns-id-start"></a>
### POST `/api/v1/campaigns/:id/start`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.startCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-start).

<a id="post-api-v1-campaigns-id-stop"></a>
### POST `/api/v1/campaigns/:id/stop`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.stopCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-stop).

<a id="post-api-v1-campaigns-id-submit"></a>
### POST `/api/v1/campaigns/:id/submit`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.submit`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.submitCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-submit).

<a id="post-api-v1-campaigns-id-verify"></a>
### POST `/api/v1/campaigns/:id/verify`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `campaigns.verify`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.verifyCampaign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-id-verify).

<a id="get-api-v1-campaigns-advertisers"></a>
### GET `/api/v1/campaigns/advertisers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `users.view`.

Observed controller query fields: `search`, `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listAdvertisers`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-advertisers).

<a id="post-api-v1-campaigns-advertisers"></a>
### POST `/api/v1/campaigns/advertisers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.create`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | required | trim {"enabled":true} |
| `company_name` | string | optional | trim {"enabled":true}; min {"limit":1}; also allows [null] |
| `companyName` | string | optional | trim {"enabled":true}; min {"limit":1}; conditional: [{"ref":{"path":["company_name"]},"is":{"type":"any","flags":{"presence":"required"}},"then":{"type":"any","flags":{"presence":"optional"}},"otherwise":{"type":"any","flags":{"presence":"required"}}}] |
| `email` | string | required | email; trim {"enabled":true} |
| `phone` | string | required | trim {"enabled":true}; pattern {"regex":"/^[+]?[0-9\\s\\-()]{7,20}$/"} |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `businessType` | string | optional | also allows ["",null] |
| `initialWallet` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `documents` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true},"keys":{"url":{"type":"string","flags":{"presence":"required"}},"key":{"type":"string","allow":["",null]},"name":{"type":"string","allow":["",null]},"fileType":{"type":"string","allow":["",null]},"mime":{"type":"string","allow":["",null]},"fileSize":{"type":"number","allow":[null]},"size":{"type":"number","allow":[null]},"purpose":{"type":"string","allow":["",null]}}}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-advertisers).

<a id="delete-api-v1-campaigns-advertisers-id"></a>
### DELETE `/api/v1/campaigns/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-campaigns-advertisers-id).

<a id="get-api-v1-campaigns-advertisers-id"></a>
### GET `/api/v1/campaigns/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `users.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-advertisers-id).

<a id="patch-api-v1-campaigns-advertisers-id"></a>
### PATCH `/api/v1/campaigns/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `companyName` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `company_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `contact_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `email` | string | optional | email; trim {"enabled":true}; also allows ["",null] |
| `phone` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `newDocuments` | array | optional | also allows [null] |
| `documents` | array | optional | also allows [null] |
| `removedDocumentIds` | array | optional | also allows [null]; items: [{"type":"alternatives","matches":[{"schema":{"type":"number"}},{"schema":{"type":"string"}}]}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |
| `account_status` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-campaigns-advertisers-id).

<a id="put-api-v1-campaigns-advertisers-id"></a>
### PUT `/api/v1/campaigns/advertisers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `companyName` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `company_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `contact_name` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `designation` | string | optional | trim {"enabled":true}; max {"limit":100}; also allows ["",null] |
| `email` | string | optional | email; trim {"enabled":true}; also allows ["",null] |
| `phone` | string | optional | trim {"enabled":true}; also allows ["",null] |
| `password` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `brand_vertical` | string | optional | also allows ["",null] |
| `business_type` | string | optional | also allows ["",null] |
| `walletBalance` | number | optional | min {"limit":0}; also allows [null] |
| `wallet_balance` | number | optional | min {"limit":0}; also allows [null] |
| `gstin` | string | optional | also allows ["",null] |
| `gst_number` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `pan_number` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `country` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `placeId` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null] |
| `longitude` | number | optional | also allows [null] |
| `billing_address` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | email; also allows ["",null] |
| `billing_email` | string | optional | email; also allows ["",null] |
| `paymentTerms` | string | optional | also allows ["",null] |
| `payment_terms` | string | optional | also allows ["",null] |
| `avatar_url` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `avatarUrl` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `newDocuments` | array | optional | also allows [null] |
| `documents` | array | optional | also allows [null] |
| `removedDocumentIds` | array | optional | also allows [null]; items: [{"type":"alternatives","matches":[{"schema":{"type":"number"}},{"schema":{"type":"string"}}]}] |
| `status` | string | optional | one of ["pending_approval","approved","active","rejected","suspended","",null] |
| `account_status` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateAdvertiser`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-campaigns-advertisers-id).

<a id="patch-api-v1-campaigns-advertisers-id-status"></a>
### PATCH `/api/v1/campaigns/advertisers/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.setAdvertiserStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-campaigns-advertisers-id-status).

<a id="get-api-v1-campaigns-analytics"></a>
### GET `/api/v1/campaigns/analytics`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.analytics.view`, `government.analytics.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.campaignOverviewAnalytics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-analytics).

<a id="get-api-v1-campaigns-analytics-overview"></a>
### GET `/api/v1/campaigns/analytics/overview`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.analytics.view`, `government.analytics.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.campaignOverviewAnalytics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-analytics-overview).

<a id="get-api-v1-campaigns-fleet-options"></a>
### GET `/api/v1/campaigns/fleet-options`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getAvailableFleets`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-fleet-options).

<a id="get-api-v1-campaigns-government"></a>
### GET `/api/v1/campaigns/government`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `government.campaigns.view`, `users.view`.

Observed controller query fields: `search`, `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government).

<a id="post-api-v1-campaigns-government"></a>
### POST `/api/v1/campaigns/government`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.create`.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-campaigns-government).

<a id="delete-api-v1-campaigns-government-id"></a>
### DELETE `/api/v1/campaigns/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.delete`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-campaigns-government-id).

<a id="get-api-v1-campaigns-government-id"></a>
### GET `/api/v1/campaigns/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `government.campaigns.view`, `users.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-id).

<a id="patch-api-v1-campaigns-government-id"></a>
### PATCH `/api/v1/campaigns/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-campaigns-government-id).

<a id="put-api-v1-campaigns-government-id"></a>
### PUT `/api/v1/campaigns/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-campaigns-government-id).

<a id="patch-api-v1-campaigns-government-id-status"></a>
### PATCH `/api/v1/campaigns/government/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.setGovernmentStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-campaigns-government-id-status).

<a id="get-api-v1-campaigns-government-analytics"></a>
### GET `/api/v1/campaigns/government/analytics`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.analytics.view`, `government.analytics.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.govAgencyAnalytics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-analytics).

<a id="get-api-v1-campaigns-government-clearance-levels"></a>
### GET `/api/v1/campaigns/government/clearance-levels`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovClearanceLevels`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-clearance-levels).

<a id="get-api-v1-campaigns-government-department-categories"></a>
### GET `/api/v1/campaigns/government/department-categories`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovDepartmentCategories`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-department-categories).

<a id="get-api-v1-campaigns-government-jurisdictions"></a>
### GET `/api/v1/campaigns/government/jurisdictions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovJurisdictions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-jurisdictions).

<a id="get-api-v1-campaigns-government-meta-options"></a>
### GET `/api/v1/campaigns/government/meta/options`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getGovernmentMetaOptions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-government-meta-options).

<a id="get-api-v1-campaigns-mqtt-status"></a>
### GET `/api/v1/campaigns/mqtt-status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getMqttStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-mqtt-status).

<a id="get-api-v1-campaigns-slots-availability"></a>
### GET `/api/v1/campaigns/slots/availability`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.view`, `government.campaigns.view`.

Observed controller query fields: `activeDays`, `active_days`, `campaignId`, `campaign_id`, `endDate`, `endTime`, `end_date`, `end_time`, `excludeCampaignId`, `exclude_campaign_id`, `routeId`, `route_id`, `screenIds`, `screen_ids`, `startDate`, `startTime`, `start_date`, `start_time`, `vehicleIds`, `vehicle_ids`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getSlotAvailability`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-slots-availability).

<a id="get-api-v1-campaigns-tracking-live"></a>
### GET `/api/v1/campaigns/tracking/live`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `fleet.tracking.view`, `government.tracking.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getLiveTracking`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-tracking-live).

<a id="get-api-v1-campaigns-tracking-routes"></a>
### GET `/api/v1/campaigns/tracking/routes`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `fleet.tracking.view`, `government.tracking.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getTrackingRoutes`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-campaigns-tracking-routes).

<a id="get-api-v1-content"></a>
### GET `/api/v1/content`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.listContent`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-content).

<a id="post-api-v1-content"></a>
### POST `/api/v1/content`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.createContentPage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-content).

<a id="delete-api-v1-content-id"></a>
### DELETE `/api/v1/content/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.deleteContentPage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-content-id).

<a id="patch-api-v1-content-id"></a>
### PATCH `/api/v1/content/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.updateContentPage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-content-id).

<a id="post-api-v1-content-id-publish"></a>
### POST `/api/v1/content/:id/publish`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.publishContentPage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-content-id-publish).

<a id="get-api-v1-content-type"></a>
### GET `/api/v1/content/:type`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `type` (required).

Observed controller query fields: `role`, `role_code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `type`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.resolveContent`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-content-type).

<a id="get-api-v1-content-faqs"></a>
### GET `/api/v1/content/faqs`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller query fields: `role`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.listFaqs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-content-faqs).

<a id="post-api-v1-content-faqs"></a>
### POST `/api/v1/content/faqs`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.createFaq`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-content-faqs).

<a id="delete-api-v1-content-faqs-id"></a>
### DELETE `/api/v1/content/faqs/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.deleteFaq`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-content-faqs-id).

<a id="patch-api-v1-content-faqs-id"></a>
### PATCH `/api/v1/content/faqs/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.updateFaq`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-content-faqs-id).

<a id="get-api-v1-dashboard-admin-kpis"></a>
### GET `/api/v1/dashboard/admin/kpis`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view`.

Observed controller query fields: `organizationId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/dashboard/dashboard.routes.js`. Implementation: `backend/src/modules/dashboard/dashboard.controller.js.adminKpis`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-dashboard-admin-kpis).

<a id="get-api-v1-dashboard-live-summary"></a>
### GET `/api/v1/dashboard/live-summary`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/dashboard/dashboard.routes.js`. Implementation: `backend/src/modules/dashboard/dashboard.controller.js.liveSummary`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-dashboard-live-summary).

<a id="get-api-v1-dashboard-superadmin-kpis"></a>
### GET `/api/v1/dashboard/superadmin/kpis`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `dashboard.view`, `fleet.dashboard.view`, `orgs.view`, `billing.revenue.view`, `advertiser.dashboard.view`, `drivers.dashboard.view`, `technician.dashboard.view`, `government.dashboard.view`, `finance.dashboard.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/dashboard/dashboard.routes.js`. Implementation: `backend/src/modules/dashboard/dashboard.controller.js.superAdminKpis`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-dashboard-superadmin-kpis).

<a id="get-api-v1-depots"></a>
### GET `/api/v1/depots`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.depots.view`, `technician.devices.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="post-api-v1-depots"></a>
### POST `/api/v1/depots`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.depots.create`.

Plan quota resource: `depots`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="delete-api-v1-depots-id"></a>
### DELETE `/api/v1/depots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.depots.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="get-api-v1-depots-id"></a>
### GET `/api/v1/depots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.depots.view`, `technician.devices.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="patch-api-v1-depots-id"></a>
### PATCH `/api/v1/depots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.depots.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="put-api-v1-depots-id"></a>
### PUT `/api/v1/depots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.depots.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.depots)`.

<a id="get-api-v1-displays"></a>
### GET `/api/v1/displays`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.listDisplays`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-displays).

<a id="post-api-v1-displays"></a>
### POST `/api/v1/displays`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.register`, `fleet.devices.create`.

Plan quota resource: `displays`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `code` | string | optional | also allows ["",null] |
| `edgeDeviceId` | number | optional | integer; also allows [null] |
| `vehicleId` | number | optional | integer; also allows [null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `type` | string | optional | — |
| `size` | string | optional | also allows ["",null] |
| `resolution` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.registerDisplay`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-displays).

<a id="get-api-v1-displays-id-config"></a>
### GET `/api/v1/displays/:id/config`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.getDisplayConfig`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-displays-id-config).

<a id="patch-api-v1-displays-id-config"></a>
### PATCH `/api/v1/displays/:id/config`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.displays.manage`, `fleet.devices.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.updateDisplayConfig`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-displays-id-config).

<a id="get-api-v1-drivers"></a>
### GET `/api/v1/drivers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="post-api-v1-drivers"></a>
### POST `/api/v1/drivers`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.create`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="delete-api-v1-drivers-id"></a>
### DELETE `/api/v1/drivers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="get-api-v1-drivers-id"></a>
### GET `/api/v1/drivers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="patch-api-v1-drivers-id"></a>
### PATCH `/api/v1/drivers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="put-api-v1-drivers-id"></a>
### PUT `/api/v1/drivers/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.drivers)`.

<a id="patch-api-v1-drivers-id-approve"></a>
### PATCH `/api/v1/drivers/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveDriver`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-drivers-id-approve).

<a id="patch-api-v1-drivers-id-assign-bus"></a>
### PATCH `/api/v1/drivers/:id/assign-bus`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.assign`.

Path parameters: `id` (required).

Observed controller body fields: `vehicleId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `vehicleId` | number | required | integer |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.assignBus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-drivers-id-assign-bus).

<a id="get-api-v1-drivers-id-documents"></a>
### GET `/api/v1/drivers/:id/documents`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.driverDocuments`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-drivers-id-documents).

<a id="patch-api-v1-drivers-id-reject"></a>
### PATCH `/api/v1/drivers/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.approve`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectDriver`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-drivers-id-reject).

<a id="patch-api-v1-drivers-id-status"></a>
### PATCH `/api/v1/drivers/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.update`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | — |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.setDriverStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-drivers-id-status).

<a id="patch-api-v1-drivers-id-verify-documents"></a>
### PATCH `/api/v1/drivers/:id/verify-documents`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.drivers.approve`.

Path parameters: `id` (required).

Observed controller body fields: `verified`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.verifyDriverDocuments`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-drivers-id-verify-documents).

<a id="get-api-v1-edge-devices"></a>
### GET `/api/v1/edge-devices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.listEdgeDevices`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices).

<a id="post-api-v1-edge-devices"></a>
### POST `/api/v1/edge-devices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.register`, `fleet.devices.create`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `boxId` | string | required | — |
| `mac` | string | optional | also allows ["",null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `vehicleId` | number | optional | integer; also allows [null] |
| `depotId` | number | optional | integer; also allows [null] |
| `agentVersion` | string | optional | also allows ["",null] |
| `simNetwork` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.registerEdgeDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices).

<a id="delete-api-v1-edge-devices-id"></a>
### DELETE `/api/v1/edge-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.deleteEdgeDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-edge-devices-id).

<a id="get-api-v1-edge-devices-id"></a>
### GET `/api/v1/edge-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.getEdgeDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-id).

<a id="patch-api-v1-edge-devices-id"></a>
### PATCH `/api/v1/edge-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.updateEdgeDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-edge-devices-id).

<a id="post-api-v1-edge-devices-id-assign"></a>
### POST `/api/v1/edge-devices/:id/assign`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage`.

Path parameters: `id` (required).

Observed controller body fields: `vehicleId`, `vehicle_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.assignEdgeDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices-id-assign).

<a id="get-api-v1-edge-devices-id-config"></a>
### GET `/api/v1/edge-devices/:id/config`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.getEdgeConfig`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-id-config).

<a id="post-api-v1-edge-devices-id-config"></a>
### POST `/api/v1/edge-devices/:id/config`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage`.

Path parameters: `id` (required).

Observed controller body fields: `config`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `config` | object | required | — |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.pushConfig`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices-id-config).

<a id="get-api-v1-edge-devices-id-connectivity-tests"></a>
### GET `/api/v1/edge-devices/:id/connectivity-tests`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.listConnectivityTests`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-id-connectivity-tests).

<a id="post-api-v1-edge-devices-id-connectivity-tests"></a>
### POST `/api/v1/edge-devices/:id/connectivity-tests`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `latency` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `packetLoss` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `rssi` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `status` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.recordConnectivityTest`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices-id-connectivity-tests).

<a id="post-api-v1-edge-devices-id-factory-reset"></a>
### POST `/api/v1/edge-devices/:id/factory-reset`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.factoryReset`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices-id-factory-reset).

<a id="post-api-v1-edge-devices-id-reboot"></a>
### POST `/api/v1/edge-devices/:id/reboot`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.diagnose`, `devices.configure`, `fleet.devices.update`, `technician.diagnostics.manage`, `technician.connectivity.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.reboot`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-edge-devices-id-reboot).

<a id="get-api-v1-edge-devices-id-telemetry"></a>
### GET `/api/v1/edge-devices/:id/telemetry`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.edgeTelemetry`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-id-telemetry).

<a id="patch-api-v1-edge-devices-id-toggle"></a>
### PATCH `/api/v1/edge-devices/:id/toggle`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.configure`, `fleet.devices.update`, `fleet.devices.assign`, `technician.hardware-config.manage`.

Path parameters: `id` (required).

Observed controller body fields: `isActive`, `is_active`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.toggleActiveStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-edge-devices-id-toggle).

<a id="get-api-v1-edge-devices-handshake-boxid"></a>
### GET `/api/v1/edge-devices/handshake/:boxId`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `boxId` (required).

Observed controller params fields: `boxId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.verifyLiveHandshake`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-handshake-boxid).

<a id="get-api-v1-edge-devices-package-download"></a>
### GET `/api/v1/edge-devices/package/download`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.downloadCorePackage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-package-download).

<a id="get-api-v1-edge-devices-setup-script"></a>
### GET `/api/v1/edge-devices/setup-script`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.getSetupScript`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-edge-devices-setup-script).

<a id="get-api-v1-emergency-broadcasts"></a>
### GET `/api/v1/emergency-broadcasts`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-emergency-broadcasts).

<a id="post-api-v1-emergency-broadcasts"></a>
### POST `/api/v1/emergency-broadcasts`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `headline` | string | optional | also allows ["",null] |
| `message` | string | optional | also allows ["",null] |
| `bodyText` | string | optional | also allows ["",null] |
| `body_text` | string | optional | also allows ["",null] |
| `authority` | string | optional | also allows ["",null] |
| `issued_by` | string | optional | also allows ["",null] |
| `issuedBy` | string | optional | also allows ["",null] |
| `governmentAgencyId` | number | optional | integer; also allows [null] |
| `government_agency_id` | number | optional | integer; also allows [null] |
| `severity` | string | optional | also allows ["",null] |
| `targetScope` | string | optional | also allows ["",null] |
| `target_scope` | string | optional | also allows ["",null] |
| `targetArea` | string | optional | also allows ["",null] |
| `target_area` | string | optional | also allows ["",null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `tickerText` | string | optional | also allows ["",null] |
| `ticker_text` | string | optional | also allows ["",null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `media_url` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media_type` | string | optional | also allows ["",null] |
| `sirenSound` | boolean | optional | — |
| `siren_sound` | boolean | optional | — |
| `audioChime` | boolean | optional | — |
| `audio_chime` | boolean | optional | — |
| `audio_chime_enabled` | boolean | optional | — |
| `pushNotification` | boolean | optional | — |
| `push_notification` | boolean | optional | — |
| `allVehicles` | boolean | optional | — |
| `allDisplays` | boolean | optional | — |
| `autoExpireMinutes` | number | optional | integer |
| `auto_expire` | string | optional | also allows ["",null] |
| `targets` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true},"keys":{"routeId":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"route_id":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"organizationId":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"organization_id":{"type":"number","rules":[{"name":"integer"}],"allow":[null]},"vehicleIds":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"vehicle_ids":{"type":"array","allow":[null],"items":[{"type":"number","rules":[{"name":"integer"}]}]},"routeName":{"type":"string","allow":["",null]},"city":{"type":"string","allow":["",null]}}}] |
| `target_routes` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Root constraints: `{"dependencies":[{"rel":"or","peers":["message","bodyText","body_text","headline","title"]}]}`.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-emergency-broadcasts).

<a id="delete-api-v1-emergency-broadcasts-id"></a>
### DELETE `/api/v1/emergency-broadcasts/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-emergency-broadcasts-id).

<a id="get-api-v1-emergency-broadcasts-id"></a>
### GET `/api/v1/emergency-broadcasts/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-emergency-broadcasts-id).

<a id="patch-api-v1-emergency-broadcasts-id"></a>
### PATCH `/api/v1/emergency-broadcasts/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `headline` | string | optional | also allows ["",null] |
| `message` | string | optional | also allows ["",null] |
| `bodyText` | string | optional | also allows ["",null] |
| `body_text` | string | optional | also allows ["",null] |
| `authority` | string | optional | also allows ["",null] |
| `severity` | string | optional | also allows ["",null] |
| `targetScope` | string | optional | also allows ["",null] |
| `target_scope` | string | optional | also allows ["",null] |
| `targetArea` | string | optional | also allows ["",null] |
| `target_area` | string | optional | also allows ["",null] |
| `tickerText` | string | optional | also allows ["",null] |
| `ticker_text` | string | optional | also allows ["",null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `media_url` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media_type` | string | optional | also allows ["",null] |
| `sirenSound` | boolean | optional | — |
| `siren_sound` | boolean | optional | — |
| `audioChime` | boolean | optional | — |
| `pushNotification` | boolean | optional | — |
| `push_notification` | boolean | optional | — |
| `autoExpireMinutes` | number | optional | integer |
| `auto_expire` | string | optional | also allows ["",null] |
| `targets` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `target_routes` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-emergency-broadcasts-id).

<a id="put-api-v1-emergency-broadcasts-id"></a>
### PUT `/api/v1/emergency-broadcasts/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `title` | string | optional | also allows ["",null] |
| `headline` | string | optional | also allows ["",null] |
| `message` | string | optional | also allows ["",null] |
| `bodyText` | string | optional | also allows ["",null] |
| `body_text` | string | optional | also allows ["",null] |
| `authority` | string | optional | also allows ["",null] |
| `severity` | string | optional | also allows ["",null] |
| `targetScope` | string | optional | also allows ["",null] |
| `target_scope` | string | optional | also allows ["",null] |
| `targetArea` | string | optional | also allows ["",null] |
| `target_area` | string | optional | also allows ["",null] |
| `tickerText` | string | optional | also allows ["",null] |
| `ticker_text` | string | optional | also allows ["",null] |
| `mediaUrl` | string | optional | also allows ["",null] |
| `media_url` | string | optional | also allows ["",null] |
| `mediaType` | string | optional | also allows ["",null] |
| `media_type` | string | optional | also allows ["",null] |
| `sirenSound` | boolean | optional | — |
| `siren_sound` | boolean | optional | — |
| `audioChime` | boolean | optional | — |
| `pushNotification` | boolean | optional | — |
| `push_notification` | boolean | optional | — |
| `autoExpireMinutes` | number | optional | integer |
| `auto_expire` | string | optional | also allows ["",null] |
| `targets` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `target_routes` | array | optional | max {"limit":100}; also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-emergency-broadcasts-id).

<a id="post-api-v1-emergency-broadcasts-id-approve"></a>
### POST `/api/v1/emergency-broadcasts/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.approve`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.approveEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-emergency-broadcasts-id-approve).

<a id="post-api-v1-emergency-broadcasts-id-reject"></a>
### POST `/api/v1/emergency-broadcasts/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.approve`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.rejectEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-emergency-broadcasts-id-reject).

<a id="post-api-v1-emergency-broadcasts-id-revoke"></a>
### POST `/api/v1/emergency-broadcasts/:id/revoke`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.emergency`, `government.emergency.manage`, `platform.broadcast`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.revokeEmergency`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-emergency-broadcasts-id-revoke).

<a id="get-api-v1-exports"></a>
### GET `/api/v1/exports`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.export`, `reports.generate`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/exports/export.routes.js`. Implementation: `backend/src/modules/exports/export.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-exports).

<a id="post-api-v1-exports"></a>
### POST `/api/v1/exports`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.export`, `reports.generate`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `subjectUserId` | number | optional | integer; also allows [null] |
| `format` | string | optional | one of ["json","csv","zip"] |

Route source: `backend/src/modules/exports/export.routes.js`. Implementation: `backend/src/modules/exports/export.controller.js.request`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-exports).

<a id="get-api-v1-finance-campaign-payments"></a>
### GET `/api/v1/finance/campaign-payments`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.listCampaignPayments`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-campaign-payments).

<a id="post-api-v1-finance-campaign-payments-id-manual-pay"></a>
### POST `/api/v1/finance/campaign-payments/:id/manual-pay`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.manage`, `finance.payments.create`, `finance.payments.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `method` | string | optional | also allows ["",null] |
| `paymentMethod` | string | optional | also allows ["",null] |
| `utrRef` | string | optional | also allows ["",null] |
| `transactionRef` | string | optional | also allows ["",null] |
| `reference` | string | optional | also allows ["",null] |
| `referenceNo` | string | optional | also allows ["",null] |
| `amount` | number | optional | — |
| `bank` | string | optional | also allows ["",null] |
| `bankName` | string | optional | also allows ["",null] |
| `currency` | string | optional | also allows ["",null] |
| `notes` | string | optional | also allows ["",null] |
| `paidAt` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string"}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.recordManualCampaignPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-campaign-payments-id-manual-pay).

<a id="post-api-v1-finance-campaign-payments-id-share-link"></a>
### POST `/api/v1/finance/campaign-payments/:id/share-link`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.manage`, `finance.payments.create`, `finance.payments.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `channels` | array | optional | items: [{"type":"string","flags":{"only":true},"allow":["email","sms","whatsapp","EMAIL","SMS","WHATSAPP"]}] |
| `channel` | string | optional | one of ["email","sms","whatsapp","all","EMAIL","SMS","WHATSAPP","ALL","",null] |
| `recipientEmail` | string | optional | also allows ["",null] |
| `email` | string | optional | also allows ["",null] |
| `recipientPhone` | string | optional | also allows ["",null] |
| `phone` | string | optional | also allows ["",null] |
| `recipientName` | string | optional | also allows ["",null] |
| `name` | string | optional | also allows ["",null] |
| `notes` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.shareCampaignPaymentLink`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-campaign-payments-id-share-link).

<a id="get-api-v1-finance-gst-gstr1-json"></a>
### GET `/api/v1/finance/gst/gstr1-json`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.getGstr1Json`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-gst-gstr1-json).

<a id="get-api-v1-finance-gst-summary"></a>
### GET `/api/v1/finance/gst/summary`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.gst.view`, `finance.gst.manage`, `finance.gst.create`, `finance.gst.update`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.gstSummary`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-gst-summary).

<a id="get-api-v1-finance-invoices"></a>
### GET `/api/v1/finance/invoices`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.listInvoices`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-invoices).

<a id="post-api-v1-finance-invoices"></a>
### POST `/api/v1/finance/invoices`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.create`, `finance.invoices.manage`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `customerName` | string | required | — |
| `gstin` | string | optional | also allows ["",null] |
| `billingAddress` | string | optional | also allows ["",null] |
| `poReference` | string | optional | also allows ["",null] |
| `placeOfSupply` | string | optional | also allows ["",null] |
| `deliveryTerms` | string | optional | also allows ["",null] |
| `dueDate` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string"}}] |
| `payerType` | string | optional | one of ["tenant","advertiser","government"]; default "advertiser" |
| `payerId` | number | optional | integer; also allows [null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `advertiserId` | number | optional | integer; also allows [null] |
| `type` | string | optional | one of ["saas_subscription","ad_spend","psa_spend","payout"]; default "ad_spend" |
| `currency` | string | optional | also allows ["",null]; default "INR" |
| `notes` | string | optional | also allows ["",null] |
| `items` | array | required | min {"limit":1}; items: [{"type":"object","flags":{"unknown":true},"keys":{"id":{"type":"any","flags":{"presence":"optional"}},"desc":{"type":"string","allow":["",null]},"description":{"type":"string","allow":["",null]},"qty":{"type":"number","flags":{"default":1},"rules":[{"name":"min","args":{"limit":1}}]},"rate":{"type":"number","flags":{"default":0},"rules":[{"name":"min","args":{"limit":0}}]},"amount":{"type":"number","flags":{"presence":"optional"}},"hsn":{"type":"string","flags":{"presence":"optional"},"allow":["",null]}}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.generateInvoice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-invoices).

<a id="get-api-v1-finance-invoices-id"></a>
### GET `/api/v1/finance/invoices/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.getInvoice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-invoices-id).

<a id="post-api-v1-finance-invoices-id-mark-paid"></a>
### POST `/api/v1/finance/invoices/:id/mark-paid`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.update`, `finance.invoices.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `method` | string | optional | also allows ["",null] |
| `paymentMethod` | string | optional | also allows ["",null] |
| `utrRef` | string | optional | also allows ["",null] |
| `transactionRef` | string | optional | also allows ["",null] |
| `reference` | string | optional | also allows ["",null] |
| `referenceNo` | string | optional | also allows ["",null] |
| `amount` | number | optional | — |
| `paidAt` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string"}}] |
| `notes` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.markInvoicePaid`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-invoices-id-mark-paid).

<a id="get-api-v1-finance-kpis"></a>
### GET `/api/v1/finance/kpis`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.dashboard.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.kpis`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-kpis).

<a id="get-api-v1-finance-payments"></a>
### GET `/api/v1/finance/payments`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.listPayments`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-payments).

<a id="get-api-v1-finance-payments-id"></a>
### GET `/api/v1/finance/payments/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.getPayment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-payments-id).

<a id="post-api-v1-finance-payments-id-send-reminder"></a>
### POST `/api/v1/finance/payments/:id/send-reminder`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.payments.manage`, `finance.payments.create`, `finance.payments.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `channels` | array | optional | items: [{"type":"string","flags":{"only":true},"allow":["email","sms","whatsapp","EMAIL","SMS","WHATSAPP"]}] |
| `channel` | string | optional | one of ["email","sms","whatsapp","all","EMAIL","SMS","WHATSAPP","ALL","",null] |
| `urgent` | boolean | optional | — |
| `email` | string | optional | also allows ["",null] |
| `recipientEmail` | string | optional | also allows ["",null] |
| `phone` | string | optional | also allows ["",null] |
| `recipientPhone` | string | optional | also allows ["",null] |
| `name` | string | optional | also allows ["",null] |
| `recipientName` | string | optional | also allows ["",null] |
| `notes` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.sendPaymentReminder`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-payments-id-send-reminder).

<a id="post-api-v1-finance-reconciliation-auto-match"></a>
### POST `/api/v1/finance/reconciliation/auto-match`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.autoMatchReconciliation`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-reconciliation-auto-match).

<a id="post-api-v1-finance-reconciliation-finalize"></a>
### POST `/api/v1/finance/reconciliation/finalize`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.reconciliation.manage`, `finance.reconciliation.create`, `finance.reconciliation.update`, `finance.settlements.create`, `finance.settlements.update`, `finance.settlements.manage`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `accountId` | string | optional | also allows ["",null] |
| `accountName` | string | optional | also allows ["",null] |
| `period` | string | optional | also allows ["",null] |
| `statementDate` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string"}}] |
| `balance` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `notes` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.finalizeReconciliation`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-finance-reconciliation-finalize).

<a id="get-api-v1-finance-reconciliation-summary"></a>
### GET `/api/v1/finance/reconciliation/summary`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.reconciliationSummary`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-reconciliation-summary).

<a id="get-api-v1-finance-reconciliation-transactions"></a>
### GET `/api/v1/finance/reconciliation/transactions`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.reconciliation.view`, `finance.reconciliation.manage`, `finance.settlements.view`, `finance.settlements.manage`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.reconciliationTransactions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-reconciliation-transactions).

<a id="get-api-v1-finance-report-summary"></a>
### GET `/api/v1/finance/report-summary`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.reports.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.reportSummary`.

<a id="get-api-v1-finance-settings"></a>
### GET `/api/v1/finance/settings`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.view`, `finance.invoices.manage`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.getFinanceSettings`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-settings).

<a id="put-api-v1-finance-settings"></a>
### PUT `/api/v1/finance/settings`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.invoices.manage`, `finance.invoices.update`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `companyName` | string | optional | also allows ["",null] |
| `company_name` | string | optional | also allows ["",null] |
| `tradeName` | string | optional | also allows ["",null] |
| `trade_name` | string | optional | also allows ["",null] |
| `gstin` | string | optional | also allows ["",null] |
| `pan` | string | optional | also allows ["",null] |
| `email` | string | optional | also allows ["",null] |
| `billingEmail` | string | optional | also allows ["",null] |
| `billing_email` | string | optional | also allows ["",null] |
| `phone` | string | optional | also allows ["",null] |
| `billingPhone` | string | optional | also allows ["",null] |
| `billing_phone` | string | optional | also allows ["",null] |
| `website` | string | optional | also allows ["",null] |
| `address` | string | optional | also allows ["",null] |
| `bankName` | string | optional | also allows ["",null] |
| `bank_name` | string | optional | also allows ["",null] |
| `accountName` | string | optional | also allows ["",null] |
| `account_name` | string | optional | also allows ["",null] |
| `accountNumber` | string | optional | also allows ["",null] |
| `account_number` | string | optional | also allows ["",null] |
| `ifscCode` | string | optional | also allows ["",null] |
| `ifsc_code` | string | optional | also allows ["",null] |
| `branch` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `logo_url` | string | optional | also allows ["",null] |
| `termsAndConditions` | string | optional | also allows ["",null] |
| `terms_and_conditions` | string | optional | also allows ["",null] |
| `signatoryName` | string | optional | also allows ["",null] |
| `signatory_name` | string | optional | also allows ["",null] |
| `signatoryDesignation` | string | optional | also allows ["",null] |
| `signatory_designation` | string | optional | also allows ["",null] |
| `signatoryEmail` | string | optional | also allows ["",null] |
| `signatory_email` | string | optional | also allows ["",null] |
| `signatoryPhone` | string | optional | also allows ["",null] |
| `signatory_phone` | string | optional | also allows ["",null] |
| `signatoryEmpId` | string | optional | also allows ["",null] |
| `signatory_emp_id` | string | optional | also allows ["",null] |
| `invoiceDesign` | object | optional | also allows [null]; additional keys allowed |
| `invoice_design` | object | optional | also allows [null]; additional keys allowed |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.updateFinanceSettings`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-finance-settings).

<a id="get-api-v1-finance-subscriptions"></a>
### GET `/api/v1/finance/subscriptions`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.subscriptions.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.listSubscriptions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-subscriptions).

<a id="get-api-v1-finance-subscriptions-id"></a>
### GET `/api/v1/finance/subscriptions/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `finance.subscriptions.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/finance/finance.routes.js`. Implementation: `backend/src/modules/finance/finance.controller.js.getSubscription`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-finance-subscriptions-id).

<a id="get-api-v1-fleets"></a>
### GET `/api/v1/fleets`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.fleets.view`, `technician.devices.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="post-api-v1-fleets"></a>
### POST `/api/v1/fleets`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.create`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="delete-api-v1-fleets-id"></a>
### DELETE `/api/v1/fleets/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="get-api-v1-fleets-id"></a>
### GET `/api/v1/fleets/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.fleets.view`, `technician.devices.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="patch-api-v1-fleets-id"></a>
### PATCH `/api/v1/fleets/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="put-api-v1-fleets-id"></a>
### PUT `/api/v1/fleets/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.fleets)`.

<a id="patch-api-v1-fleets-id-approve"></a>
### PATCH `/api/v1/fleets/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveFleet`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-fleets-id-approve).

<a id="post-api-v1-fleets-id-assign-vehicle"></a>
### POST `/api/v1/fleets/:id/assign-vehicle`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `vehicleId`, `vehicle_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`, `vehicleId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `vehicleId` | alternatives | required | alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |
| `vehicle_id` | alternatives | optional | alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.assignVehicleToFleet`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-fleets-id-assign-vehicle).

<a id="patch-api-v1-fleets-id-reject"></a>
### PATCH `/api/v1/fleets/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectFleet`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-fleets-id-reject).

<a id="post-api-v1-fleets-id-unassign-vehicle"></a>
### POST `/api/v1/fleets/:id/unassign-vehicle`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `vehicleId`, `vehicle_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`, `vehicleId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `vehicleId` | alternatives | optional | alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |
| `vehicle_id` | alternatives | optional | alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.unassignVehicleFromFleet`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-fleets-id-unassign-vehicle).

<a id="get-api-v1-fleets-quotas"></a>
### GET `/api/v1/fleets/quotas`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.fleets.view`, `technician.devices.view`.

Observed controller query fields: `excludeFleetId`, `excludeId`, `excludeUserId`, `organizationId`, `organization_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.getFleetQuotas`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-fleets-quotas).

<a id="get-api-v1-google-apis"></a>
### GET `/api/v1/google-apis`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.getSettings`.

<a id="put-api-v1-google-apis"></a>
### PUT `/api/v1/google-apis`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.updateSettings`.

<a id="post-api-v1-google-apis-demo-geocode"></a>
### POST `/api/v1/google-apis/demo/geocode`

Authentication: Optional Bearer token. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.demoGeocode`.

<a id="post-api-v1-google-apis-demo-places"></a>
### POST `/api/v1/google-apis/demo/places`

Authentication: Optional Bearer token. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.demoPlaces`.

<a id="post-api-v1-google-apis-demo-roads"></a>
### POST `/api/v1/google-apis/demo/roads`

Authentication: Optional Bearer token. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.demoRoads`.

<a id="post-api-v1-google-apis-demo-routes"></a>
### POST `/api/v1/google-apis/demo/routes`

Authentication: Optional Bearer token. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.demoRoutes`.

<a id="get-api-v1-google-apis-demo-static-map"></a>
### GET `/api/v1/google-apis/demo/static-map`

Authentication: Optional Bearer token. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.demoStaticMap`.

<a id="post-api-v1-google-apis-test"></a>
### POST `/api/v1/google-apis/test`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/google-apis/googleApis.routes.js`. Implementation: `backend/src/modules/google-apis/googleApis.controller.js.testApis`.

<a id="get-api-v1-government"></a>
### GET `/api/v1/government`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `government.campaigns.view`, `users.view`.

Observed controller query fields: `search`, `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government).

<a id="post-api-v1-government"></a>
### POST `/api/v1/government`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.create`.

Controller response helpers: `created`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.createGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-government).

<a id="delete-api-v1-government-id"></a>
### DELETE `/api/v1/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.delete`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.deleteGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-government-id).

<a id="get-api-v1-government-id"></a>
### GET `/api/v1/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `government.campaigns.view`, `users.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-id).

<a id="patch-api-v1-government-id"></a>
### PATCH `/api/v1/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-government-id).

<a id="put-api-v1-government-id"></a>
### PUT `/api/v1/government/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.updateGovernment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-government-id).

<a id="patch-api-v1-government-id-status"></a>
### PATCH `/api/v1/government/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `users.update`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.setGovernmentStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-government-id-status).

<a id="get-api-v1-government-analytics"></a>
### GET `/api/v1/government/analytics`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `campaigns.analytics.view`, `government.analytics.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.govAgencyAnalytics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-analytics).

<a id="get-api-v1-government-clearance-levels"></a>
### GET `/api/v1/government/clearance-levels`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovClearanceLevels`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-clearance-levels).

<a id="get-api-v1-government-department-categories"></a>
### GET `/api/v1/government/department-categories`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovDepartmentCategories`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-department-categories).

<a id="get-api-v1-government-jurisdictions"></a>
### GET `/api/v1/government/jurisdictions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.listGovJurisdictions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-jurisdictions).

<a id="get-api-v1-government-meta-options"></a>
### GET `/api/v1/government/meta/options`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getGovernmentMetaOptions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-government-meta-options).

<a id="get-api-v1-gps-devices"></a>
### GET `/api/v1/gps-devices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.listGpsDevices`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-gps-devices).

<a id="post-api-v1-gps-devices"></a>
### POST `/api/v1/gps-devices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `code` | string | optional | also allows ["",null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `organization_id` | number | optional | integer; also allows [null] |
| `vehicleId` | number | optional | integer; also allows [null] |
| `vehicle_id` | number | optional | integer; also allows [null] |
| `type` | string | optional | also allows ["",null] |
| `vendor` | string | optional | also allows ["",null] |
| `model` | string | optional | also allows ["",null] |
| `imei` | string | optional | also allows ["",null] |
| `sim` | string | optional | also allows ["",null] |
| `sim_number` | string | optional | also allows ["",null] |
| `simNumber` | string | optional | also allows ["",null] |
| `network` | string | optional | also allows ["",null] |
| `network_type` | string | optional | also allows ["",null] |
| `networkType` | string | optional | also allows ["",null] |
| `battery_capacity` | string | optional | also allows ["",null] |
| `batteryCapacity` | string | optional | also allows ["",null] |
| `firmware` | string | optional | also allows ["",null] |
| `alias_name` | string | optional | also allows ["",null] |
| `aliasName` | string | optional | also allows ["",null] |
| `serial_number` | string | optional | also allows ["",null] |
| `serialNumber` | string | optional | also allows ["",null] |
| `mounting_position` | string | optional | also allows ["",null] |
| `mountingPosition` | string | optional | also allows ["",null] |
| `power_wire` | string | optional | also allows ["",null] |
| `powerWire` | string | optional | also allows ["",null] |
| `sim_provider` | string | optional | also allows ["",null] |
| `simProvider` | string | optional | also allows ["",null] |
| `notes` | string | optional | also allows ["",null] |
| `image_url` | string | optional | also allows ["",null] |
| `imageUrl` | string | optional | also allows ["",null] |
| `status` | string | optional | also allows ["",null] |
| `installation_date` | string | optional | also allows ["",null] |
| `installationDate` | string | optional | also allows ["",null] |
| `installed_at` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.registerGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-gps-devices).

<a id="delete-api-v1-gps-devices-id"></a>
### DELETE `/api/v1/gps-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.deleteGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-gps-devices-id).

<a id="get-api-v1-gps-devices-id"></a>
### GET `/api/v1/gps-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `devices.view`, `fleet.devices.read`, `devices.gps.manage`, `technician.devices.view`, `technician.hardware-status.view`, `devices.displays.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.getGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-gps-devices-id).

<a id="patch-api-v1-gps-devices-id"></a>
### PATCH `/api/v1/gps-devices/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `code` | string | optional | also allows ["",null] |
| `organizationId` | number | optional | integer; also allows [null] |
| `organization_id` | number | optional | integer; also allows [null] |
| `vehicleId` | number | optional | integer; also allows [null] |
| `vehicle_id` | number | optional | integer; also allows [null] |
| `type` | string | optional | also allows ["",null] |
| `vendor` | string | optional | also allows ["",null] |
| `model` | string | optional | also allows ["",null] |
| `imei` | string | optional | also allows ["",null] |
| `sim` | string | optional | also allows ["",null] |
| `sim_number` | string | optional | also allows ["",null] |
| `simNumber` | string | optional | also allows ["",null] |
| `network` | string | optional | also allows ["",null] |
| `network_type` | string | optional | also allows ["",null] |
| `networkType` | string | optional | also allows ["",null] |
| `battery_capacity` | string | optional | also allows ["",null] |
| `batteryCapacity` | string | optional | also allows ["",null] |
| `firmware` | string | optional | also allows ["",null] |
| `alias_name` | string | optional | also allows ["",null] |
| `aliasName` | string | optional | also allows ["",null] |
| `serial_number` | string | optional | also allows ["",null] |
| `serialNumber` | string | optional | also allows ["",null] |
| `mounting_position` | string | optional | also allows ["",null] |
| `mountingPosition` | string | optional | also allows ["",null] |
| `power_wire` | string | optional | also allows ["",null] |
| `powerWire` | string | optional | also allows ["",null] |
| `sim_provider` | string | optional | also allows ["",null] |
| `simProvider` | string | optional | also allows ["",null] |
| `notes` | string | optional | also allows ["",null] |
| `image_url` | string | optional | also allows ["",null] |
| `imageUrl` | string | optional | also allows ["",null] |
| `status` | string | optional | also allows ["",null] |
| `installation_date` | string | optional | also allows ["",null] |
| `installationDate` | string | optional | also allows ["",null] |
| `installed_at` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.updateGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-gps-devices-id).

<a id="post-api-v1-gps-devices-id-approve"></a>
### POST `/api/v1/gps-devices/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.approveGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-gps-devices-id-approve).

<a id="post-api-v1-gps-devices-id-assign"></a>
### POST `/api/v1/gps-devices/:id/assign`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Path parameters: `id` (required).

Observed controller body fields: `vehicleId`, `vehicle_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `vehicleId` | number | optional | integer; also allows [null] |
| `vehicle_id` | number | optional | integer; also allows [null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.assignGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-gps-devices-id-assign).

<a id="post-api-v1-gps-devices-id-reject"></a>
### POST `/api/v1/gps-devices/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.devices.read`, `fleet.devices.create`, `fleet.devices.update`, `fleet.devices.delete`, `fleet.devices.assign`, `devices.register`, `devices.configure`, `devices.gps.manage`, `fleet.gps.manage`, `devices.view`, `technician.gps.manage`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/devices/device.routes.js`. Implementation: `backend/src/modules/devices/device.controller.js.rejectGpsDevice`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-gps-devices-id-reject).

<a id="post-api-v1-i18n"></a>
### POST `/api/v1/i18n`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `key` | string | required | — |
| `namespace` | string | optional | also allows ["",null] |
| `langCode` | string | required | — |
| `value` | string | required | also allows ["",null] |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.upsertTranslation`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n).

<a id="get-api-v1-i18n-lang"></a>
### GET `/api/v1/i18n/:lang`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `lang` (required).

Observed controller params fields: `lang`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.i18nBundle`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-i18n-lang).

<a id="post-api-v1-i18n-auto-translate"></a>
### POST `/api/v1/i18n/auto-translate`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `targetLangCode` | string | required | — |
| `sourceLangCode` | string | optional | default "en" |
| `overwriteExisting` | boolean | optional | default false |
| `namespace` | string | optional | also allows ["",null] |
| `batchSize` | number | optional | integer; min {"limit":1}; max {"limit":200} |
| `offset` | number | optional | integer; min {"limit":0} |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.autoTranslateLanguage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n-auto-translate).

<a id="post-api-v1-i18n-bulk"></a>
### POST `/api/v1/i18n/bulk`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `langCode` | string | required | — |
| `translations` | array | required | min {"limit":1}; items: [{"type":"object","keys":{"key":{"type":"string","flags":{"presence":"required"}},"namespace":{"type":"string","allow":["",null]},"value":{"type":"string","allow":["",null]}}}] |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.bulkUpsertTranslations`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n-bulk).

<a id="get-api-v1-i18n-keys"></a>
### GET `/api/v1/i18n/keys`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller query fields: `limit`, `namespace`, `page`, `search`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.listTranslationKeys`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-i18n-keys).

<a id="post-api-v1-i18n-keys"></a>
### POST `/api/v1/i18n/keys`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `key` | string | required | min {"limit":2}; max {"limit":200} |
| `namespace` | string | optional | max {"limit":80}; default "common" |
| `description` | string | optional | also allows ["",null] |
| `translations` | object | optional | — |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.createTranslationKey`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n-keys).

<a id="delete-api-v1-i18n-keys-id"></a>
### DELETE `/api/v1/i18n/keys/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.deleteTranslationKey`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-i18n-keys-id).

<a id="put-api-v1-i18n-keys-id"></a>
### PUT `/api/v1/i18n/keys/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated params** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `id` | number | required | integer; sign {"sign":"positive"} |

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `namespace` | string | optional | max {"limit":80} |
| `description` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.updateTranslationKey`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-i18n-keys-id).

<a id="get-api-v1-i18n-languages"></a>
### GET `/api/v1/i18n/languages`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.listLanguages`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-i18n-languages).

<a id="post-api-v1-i18n-languages"></a>
### POST `/api/v1/i18n/languages`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `code` | string | required | min {"limit":2}; max {"limit":16} |
| `name` | string | required | min {"limit":1}; max {"limit":120} |
| `native_name` | string | optional | max {"limit":120}; also allows ["",null] |
| `direction` | string | optional | one of ["ltr","rtl"]; default "ltr" |
| `is_active` | boolean | optional | default true |
| `is_default` | boolean | optional | default false |
| `sort_order` | number | optional | integer; min {"limit":0}; default 0 |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.createLanguage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n-languages).

<a id="delete-api-v1-i18n-languages-id"></a>
### DELETE `/api/v1/i18n/languages/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.deleteLanguage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-i18n-languages-id).

<a id="put-api-v1-i18n-languages-id"></a>
### PUT `/api/v1/i18n/languages/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated params** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `id` | number | required | integer; sign {"sign":"positive"} |

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | min {"limit":1}; max {"limit":120} |
| `native_name` | string | optional | max {"limit":120}; also allows ["",null] |
| `direction` | string | optional | one of ["ltr","rtl"] |
| `is_active` | boolean | optional | — |
| `is_default` | boolean | optional | — |
| `sort_order` | number | optional | integer; min {"limit":0} |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.updateLanguage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-i18n-languages-id).

<a id="post-api-v1-i18n-translate-single"></a>
### POST `/api/v1/i18n/translate-single`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `platform.content`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `text` | string | required | — |
| `targetLangCode` | string | required | — |
| `sourceLangCode` | string | optional | default "en" |
| `keyId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |

Route source: `backend/src/modules/content/content.routes.js`. Implementation: `backend/src/modules/content/content.controller.js.translateSingleKey`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-i18n-translate-single).

<a id="get-api-v1-incidents"></a>
### GET `/api/v1/incidents`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="post-api-v1-incidents"></a>
### POST `/api/v1/incidents`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.create`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="delete-api-v1-incidents-id"></a>
### DELETE `/api/v1/incidents/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="get-api-v1-incidents-id"></a>
### GET `/api/v1/incidents/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="patch-api-v1-incidents-id"></a>
### PATCH `/api/v1/incidents/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="put-api-v1-incidents-id"></a>
### PUT `/api/v1/incidents/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.incidents)`.

<a id="patch-api-v1-incidents-id-resolution"></a>
### PATCH `/api/v1/incidents/:id/resolution`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | optional | also allows ["",null] |
| `contactedDriver` | boolean | optional | also allows [null] |
| `contactNotes` | string | optional | also allows ["",null] |
| `recovered` | boolean | optional | also allows [null] |
| `resolutionNotes` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.updateIncidentResolution`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-incidents-id-resolution).

<a id="patch-api-v1-incidents-id-status"></a>
### PATCH `/api/v1/incidents/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.incidents.update`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | — |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.setIncidentStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-incidents-id-status).

<a id="get-api-v1-invitations"></a>
### GET `/api/v1/invitations`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `invitations.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/invitation.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-invitations).

<a id="post-api-v1-invitations"></a>
### POST `/api/v1/invitations`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `invitations.manage`.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | also allows ["",null] |
| `email` | string | optional | email; also allows [null,""] |
| `phone` | string | optional | also allows [null,""] |
| `roleId` | number | required | integer |
| `organizationId` | number | optional | integer; also allows [null] |

Root constraints: `{"dependencies":[{"rel":"or","peers":["email","phone"]}]}`.

Route source: `backend/src/modules/auth/invitation.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-invitations).

<a id="delete-api-v1-invitations-id"></a>
### DELETE `/api/v1/invitations/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `invitations.manage`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/invitation.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-invitations-id).

<a id="post-api-v1-invitations-id-resend"></a>
### POST `/api/v1/invitations/:id/resend`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `invitations.manage`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/auth/invitation.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-invitations-id-resend).

<a id="get-api-v1-me-driver-active-route"></a>
### GET `/api/v1/me/driver/active-route`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.activeRoute`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-active-route).

<a id="get-api-v1-me-driver-documents"></a>
### GET `/api/v1/me/driver/documents`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.documents`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-documents).

<a id="post-api-v1-me-driver-documents"></a>
### POST `/api/v1/me/driver/documents`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.documents.manage`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `id` | number | optional | integer |
| `docName` | string | required | — |
| `docType` | string | optional | one of ["dl","aadhaar","medical","insurance","training","other"] |
| `documentNumber` | string | optional | also allows ["",null] |
| `issuingAuthority` | string | optional | also allows ["",null] |
| `expiryDate` | string | optional | also allows ["",null] |
| `fileUrl` | string | optional | also allows ["",null] |
| `fileName` | string | optional | also allows ["",null] |
| `fileSize` | string | optional | also allows ["",null] |
| `fileType` | string | optional | also allows ["",null] |
| `previewUrl` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.upsertDocument`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-documents).

<a id="delete-api-v1-me-driver-documents-id"></a>
### DELETE `/api/v1/me/driver/documents/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.documents.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.deleteDocument`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-me-driver-documents-id).

<a id="patch-api-v1-me-driver-duty-status"></a>
### PATCH `/api/v1/me/driver/duty-status`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.duty.manage`.

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | one of ["on_duty","off_duty","available"] |

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.setDutyStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-me-driver-duty-status).

<a id="get-api-v1-me-driver-incidents"></a>
### GET `/api/v1/me/driver/incidents`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.incidents`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-incidents).

<a id="post-api-v1-me-driver-incidents"></a>
### POST `/api/v1/me/driver/incidents`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.incidents.report`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `incidentType` | string | required | — |
| `description` | string | optional | also allows ["",null] |
| `location` | string | optional | also allows ["",null] |
| `landmark` | string | optional | also allows ["",null] |
| `severity` | string | optional | one of ["Low","Medium","High","Critical","low","medium","high","critical"] |
| `affectedParties` | array | optional | items: [{"type":"string"}] |
| `immediateAction` | string | optional | also allows ["",null] |
| `contactPreference` | string | optional | also allows ["",null] |
| `contactNumber` | string | optional | also allows ["",null] |
| `photos` | array | optional | items: [{"type":"string"}] |
| `photosCount` | number | optional | integer |
| `videos` | array | optional | items: [{"type":"string"}] |
| `videosCount` | number | optional | integer |
| `latitude` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `longitude` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `deadCasualty` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `injuredCount` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string"}}] |
| `hospitalName` | string | optional | also allows ["",null] |
| `ambulanceAssigned` | boolean | optional | also allows [null] |
| `ambulanceTiming` | string | optional | also allows ["",null] |
| `policeNotified` | boolean | optional | also allows [null] |
| `policeStationName` | string | optional | also allows ["",null] |
| `towingRequested` | boolean | optional | also allows [null] |
| `weatherConditions` | string | optional | also allows ["",null] |
| `roadType` | string | optional | also allows ["",null] |
| `trafficDisruptionLevel` | string | optional | also allows ["",null] |
| `audioNotes` | array | optional | also allows [null]; items: [{"type":"string"}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.reportIncident`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-incidents).

<a id="get-api-v1-me-driver-incidents-id"></a>
### GET `/api/v1/me/driver/incidents/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.getIncidentById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-incidents-id).

<a id="get-api-v1-me-driver-profile"></a>
### GET `/api/v1/me/driver/profile`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.profile`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-profile).

<a id="get-api-v1-me-driver-schedule"></a>
### GET `/api/v1/me/driver/schedule`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.schedule`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-schedule).

<a id="post-api-v1-me-driver-trip-end"></a>
### POST `/api/v1/me/driver/trip/end`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.duty.manage`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `tripId` | number | optional | integer; sign {"sign":"positive"} |
| `slotId` | number | optional | integer; sign {"sign":"positive"} |
| `covered_km` | number | optional | min {"limit":0} |

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.endTrip`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-trip-end).

<a id="post-api-v1-me-driver-trip-start"></a>
### POST `/api/v1/me/driver/trip/start`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.duty.manage`.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `slotId` | number | optional | integer; sign {"sign":"positive"} |
| `forceNew` | boolean | optional | — |

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.startTrip`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-me-driver-trip-start).

<a id="get-api-v1-me-driver-trips"></a>
### GET `/api/v1/me/driver/trips`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `drivers.portal.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/driver-portal/driverPortal.routes.js`. Implementation: `backend/src/modules/driver-portal/driverPortal.controller.js.trips`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-driver-trips).

<a id="get-api-v1-me-support-tickets"></a>
### GET `/api/v1/me/support/tickets`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.mine`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-support-tickets).

<a id="get-api-v1-me-technician-stats"></a>
### GET `/api/v1/me/technician/stats`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `work_orders.view`, `technician.devices.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/technicianPortal.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.stats`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-technician-stats).

<a id="get-api-v1-me-technician-work-orders"></a>
### GET `/api/v1/me/technician/work-orders`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `work_orders.view`, `technician.devices.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/technicianPortal.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.mine`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-technician-work-orders).

<a id="get-api-v1-me-technician-work-orders-id"></a>
### GET `/api/v1/me/technician/work-orders/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `work_orders.view`, `technician.devices.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/technicianPortal.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-me-technician-work-orders-id).

<a id="patch-api-v1-me-technician-work-orders-id-status"></a>
### PATCH `/api/v1/me/technician/work-orders/:id/status`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `work_orders.update`, `technician.devices.view`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | one of ["submitted","approved","dispatched","on_site","resolved","closed","rejected","Submitted","Approved","Dispatched","On_Site","Resolved","Closed","Rejected"] |
| `resolutionNotes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |
| `resolution_notes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |
| `notes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |

Route source: `backend/src/modules/work-orders/technicianPortal.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.setStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-me-technician-work-orders-id-status).

<a id="delete-api-v1-notifications"></a>
### DELETE `/api/v1/notifications`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.clearAll`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-notifications).

<a id="get-api-v1-notifications"></a>
### GET `/api/v1/notifications`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller query fields: `read`, `search`, `severity`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications).

<a id="delete-api-v1-notifications-id"></a>
### DELETE `/api/v1/notifications/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.remove`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-notifications-id).

<a id="post-api-v1-notifications-id-read"></a>
### POST `/api/v1/notifications/:id/read`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.markRead`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-id-read).

<a id="get-api-v1-notifications-delivery-logs"></a>
### GET `/api/v1/notifications/delivery-logs`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.audit`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getDeliveryLogs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-delivery-logs).

<a id="post-api-v1-notifications-delivery-logs-id-retry"></a>
### POST `/api/v1/notifications/delivery-logs/:id/retry`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.audit`, `platform.settings`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.retryDeliveryLog`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-delivery-logs-id-retry).

<a id="get-api-v1-notifications-delivery-logs-stats"></a>
### GET `/api/v1/notifications/delivery-logs/stats`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.audit`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getDeliveryLogStats`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-delivery-logs-stats).

<a id="post-api-v1-notifications-read-all"></a>
### POST `/api/v1/notifications/read-all`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.markAllRead`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-read-all).

<a id="get-api-v1-notifications-settings"></a>
### GET `/api/v1/notifications/settings`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getSettings`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-settings).

<a id="patch-api-v1-notifications-settings"></a>
### PATCH `/api/v1/notifications/settings`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `master_push` | boolean | optional | — |
| `channel_push` | boolean | optional | — |
| `channel_email` | boolean | optional | — |
| `channel_sms` | boolean | optional | — |
| `channel_whatsapp` | boolean | optional | — |
| `channel_in_app` | boolean | optional | — |
| `quiet_hours_start` | string | optional | also allows [null,""] |
| `quiet_hours_end` | string | optional | also allows [null,""] |

Root constraints: `{"rules":[{"name":"min","args":{"limit":1}}]}`.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.updateSettings`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-notifications-settings).

<a id="patch-api-v1-notifications-settings-preferences-eventtypeid"></a>
### PATCH `/api/v1/notifications/settings/preferences/:eventTypeId`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `eventTypeId` (required).

Observed controller body fields: `enabled`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `eventTypeId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `enabled` | boolean | required | — |

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.togglePreference`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-notifications-settings-preferences-eventtypeid).

<a id="get-api-v1-notifications-sms"></a>
### GET `/api/v1/notifications/sms`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getSms`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-sms).

<a id="put-api-v1-notifications-sms"></a>
### PUT `/api/v1/notifications/sms`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Observed controller body fields: `critical_only`, `dlt_entity_id`, `live_sms_enabled`, `sender_id`, `twilio_account_sid`, `twilio_auth_token`, `twilio_from_number`, `whatsapp_fallback`. These names are read by the handler; requiredness/types may be enforced further in the service.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.updateSms`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-notifications-sms).

<a id="get-api-v1-notifications-smtp"></a>
### GET `/api/v1/notifications/smtp`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getSmtp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-smtp).

<a id="put-api-v1-notifications-smtp"></a>
### PUT `/api/v1/notifications/smtp`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.updateSmtp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-notifications-smtp).

<a id="post-api-v1-notifications-test-email"></a>
### POST `/api/v1/notifications/test-email`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Observed controller body fields: `host`, `pass`, `port`, `secure`, `to`, `user`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.testEmail`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-test-email).

<a id="post-api-v1-notifications-test-push"></a>
### POST `/api/v1/notifications/test-push`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.testPush`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-test-push).

<a id="post-api-v1-notifications-test-sms"></a>
### POST `/api/v1/notifications/test-sms`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Observed controller body fields: `message`, `recipient`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `error`, `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.testSms`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-test-sms).

<a id="post-api-v1-notifications-test-whatsapp"></a>
### POST `/api/v1/notifications/test-whatsapp`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Observed controller body fields: `message`, `recipient`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `error`, `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.testWhatsapp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-notifications-test-whatsapp).

<a id="get-api-v1-notifications-whatsapp"></a>
### GET `/api/v1/notifications/whatsapp`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.getWhatsapp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-notifications-whatsapp).

<a id="put-api-v1-notifications-whatsapp"></a>
### PUT `/api/v1/notifications/whatsapp`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (any one): `platform.keys`, `platform.settings`.

Observed controller body fields: `critical_only`, `default_language`, `enabled`, `provider`, `whatsapp_api_token`, `whatsapp_business_id`, `whatsapp_fallback_sms`, `whatsapp_from_number`, `whatsapp_phone_number_id`, `whatsapp_webhook_secret`. These names are read by the handler; requiredness/types may be enforced further in the service.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.updateWhatsapp`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-notifications-whatsapp).

<a id="get-api-v1-organizations"></a>
### GET `/api/v1/organizations`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.view`, `technician.devices.view`, `finance.subscriptions.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-organizations).

<a id="post-api-v1-organizations"></a>
### POST `/api/v1/organizations`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.create`, `finance.subscriptions.create`, `finance.subscriptions.manage`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | required | min {"limit":2} |
| `logo_url` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null,""] |
| `longitude` | number | optional | also allows [null,""] |
| `placeId` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `cin` | string | optional | also allows ["",null] |
| `gstin` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"string","rules":[{"name":"trim","args":{"enabled":true}},{"name":"case","args":{"direction":"upper"}},{"name":"pattern","message":{"template":"Invalid GSTIN format (e.g. 27AAACM1234F1Z8)."},"args":{"regex":"/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/"}}]}},{"schema":{"type":"string","flags":{"only":true},"rules":[{"name":"trim","args":{"enabled":true}}],"allow":["","NA","N/A","NONE","0"]}}] |
| `officeAddress` | string | optional | also allows ["",null] |
| `office_address` | string | optional | also allows ["",null] |
| `planId` | number | optional | integer; also allows [null,""] |
| `paymentMode` | string | optional | one of ["offline","online"]; default "offline" |
| `bankRef` | string | optional | also allows ["",null] |
| `bankName` | string | optional | also allows ["",null] |
| `amount` | number | optional | also allows [null,""] |
| `paymentDate` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"date","flags":{"format":"iso"}}},{"schema":{"type":"string"}}] |
| `notes` | string | optional | also allows ["",null] |
| `busesQuota` | number | optional | integer; also allows [null,""] |
| `busesCount` | number | optional | integer; also allows [null,""] |
| `depotsQuota` | number | optional | integer; also allows [null,""] |
| `depotsCount` | number | optional | integer; also allows [null,""] |
| `adminName` | string | optional | also allows ["",null] |
| `adminEmail` | string | optional | email; also allows ["",null] |
| `adminPhone` | string | optional | also allows ["",null] |
| `adminPassword` | string | optional | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}}; also allows ["",null] |
| `status` | string | optional | one of ["pending_approval","approved","active"] |
| `adminStatus` | string | optional | one of ["pending_approval","awaiting_subscription","active"] |
| `features` | array | optional | items: [{"type":"string"}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.onboard`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-organizations).

<a id="get-api-v1-organizations-id"></a>
### GET `/api/v1/organizations/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.view`, `technician.devices.view`, `finance.subscriptions.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-organizations-id).

<a id="patch-api-v1-organizations-id"></a>
### PATCH `/api/v1/organizations/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | min {"limit":1} |
| `logo_url` | string | optional | also allows ["",null] |
| `logoUrl` | string | optional | also allows ["",null] |
| `state` | string | optional | also allows ["",null] |
| `city` | string | optional | also allows ["",null] |
| `pincode` | string | optional | also allows ["",null] |
| `latitude` | number | optional | also allows [null,""] |
| `longitude` | number | optional | also allows [null,""] |
| `placeId` | string | optional | also allows ["",null] |
| `place_id` | string | optional | also allows ["",null] |
| `cin` | string | optional | also allows ["",null] |
| `gstin` | alternatives | optional | also allows ["",null]; alternatives: [{"schema":{"type":"string","rules":[{"name":"trim","args":{"enabled":true}},{"name":"case","args":{"direction":"upper"}},{"name":"pattern","message":{"template":"Invalid GSTIN format (e.g. 27AAACM1234F1Z8)."},"args":{"regex":"/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/"}}]}},{"schema":{"type":"string","flags":{"only":true},"rules":[{"name":"trim","args":{"enabled":true}}],"allow":["","NA","N/A","NONE","0"]}}] |
| `office_address` | string | optional | also allows ["",null] |
| `officeAddress` | string | optional | also allows ["",null] |
| `plan_id` | number | optional | integer; also allows [null,""] |
| `planId` | number | optional | integer; also allows [null,""] |
| `support_sla_hours` | number | optional | integer; also allows [null] |
| `buses_quota` | number | optional | integer; also allows [null,""] |
| `busesQuota` | number | optional | integer; also allows [null,""] |
| `busesCount` | number | optional | integer; also allows [null,""] |
| `depots_count` | number | optional | integer; also allows [null,""] |
| `depotsCount` | number | optional | integer; also allows [null,""] |
| `mrr` | number | optional | also allows [null,""] |
| `status` | string | optional | one of ["pending_approval","approved","active","suspended","rejected","expired"] |
| `adminId` | number | optional | integer; also allows [null,""] |
| `admin_id` | number | optional | integer; also allows [null,""] |
| `adminName` | string | optional | also allows ["",null] |
| `admin_name` | string | optional | also allows ["",null] |
| `adminEmail` | string | optional | email; also allows ["",null] |
| `admin_email` | string | optional | email; also allows ["",null] |
| `adminPhone` | string | optional | also allows ["",null] |
| `admin_phone` | string | optional | also allows ["",null] |
| `adminPassword` | string | optional | also allows ["",null] |
| `admin_password` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Root constraints: `{"rules":[{"name":"min","args":{"limit":1}}]}`.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.update`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-organizations-id).

<a id="post-api-v1-organizations-id-approve"></a>
### POST `/api/v1/organizations/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `orgs.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.approve`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-organizations-id-approve).

<a id="get-api-v1-organizations-id-features"></a>
### GET `/api/v1/organizations/:id/features`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.view`, `technician.devices.view`, `finance.subscriptions.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.getFeatures`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-organizations-id-features).

<a id="patch-api-v1-organizations-id-features"></a>
### PATCH `/api/v1/organizations/:id/features`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage`.

Path parameters: `id` (required).

Observed controller body fields: `features`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `features` | array | required | items: [{"type":"object","keys":{"feature_key":{"type":"string","flags":{"presence":"required"}},"enabled":{"type":"boolean","flags":{"presence":"required"}}}}] |

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.setFeatures`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-organizations-id-features).

<a id="post-api-v1-organizations-id-reject"></a>
### POST `/api/v1/organizations/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `orgs.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.reject`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-organizations-id-reject).

<a id="post-api-v1-organizations-id-reset-admin-password"></a>
### POST `/api/v1/organizations/:id/reset-admin-password`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.update`, `finance.subscriptions.update`, `finance.subscriptions.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `password` | string | optional | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}}; also allows ["",null] |
| `notifyEmail` | boolean | optional | default true |

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.resetAdminPassword`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-organizations-id-reset-admin-password).

<a id="patch-api-v1-organizations-id-status"></a>
### PATCH `/api/v1/organizations/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `orgs.suspend`, `orgs.delete`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | — |

Route source: `backend/src/modules/organizations/organization.routes.js`. Implementation: `backend/src/modules/organizations/organization.controller.js.setStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-organizations-id-status).

<a id="get-api-v1-permissions"></a>
### GET `/api/v1/permissions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.listPermissions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-permissions).

<a id="get-api-v1-permissions-modules"></a>
### GET `/api/v1/permissions/modules`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.permissionModules`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-permissions-modules).

<a id="post-api-v1-push-register"></a>
### POST `/api/v1/push/register`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `token` | string | required | — |
| `platform` | string | optional | one of ["web","android","ios"] |
| `deviceInfo` | string | optional | also allows ["",null] |

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.registerToken`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-push-register).

<a id="post-api-v1-push-test"></a>
### POST `/api/v1/push/test`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/notifications/notification.routes.js`. Implementation: `backend/src/modules/notifications/notification.controller.js.testPush`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-push-test).

<a id="get-api-v1-qr-code"></a>
### GET `/api/v1/qr/:code`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `code` (required).

Observed controller query fields: `code`, `json`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.trackQrScan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-qr-code).

<a id="post-api-v1-qr-code-review"></a>
### POST `/api/v1/qr/:code/review`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `code` (required).

Observed controller params fields: `code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `driverRating` | number | required | integer; min {"limit":1}; max {"limit":5} |
| `busRating` | number | required | integer; min {"limit":1}; max {"limit":5} |
| `serviceRating` | number | required | integer; min {"limit":1}; max {"limit":5} |
| `comment` | string | optional | max {"limit":1000}; also allows ["",null] |
| `qrScanId` | number | optional | integer; also allows [null] |
| `vehicleId` | number | optional | integer; also allows [null] |

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.submitQrReview`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-qr-code-review).

<a id="get-api-v1-qr-scan-code"></a>
### GET `/api/v1/qr/scan/:code`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `code` (required).

Observed controller query fields: `code`, `json`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.trackQrScan`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-qr-scan-code).

<a id="get-api-v1-qr-scan-code-landing"></a>
### GET `/api/v1/qr/scan/:code/landing`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `code` (required).

Observed controller query fields: `code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `code`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/campaigns/campaign.routes.js`. Implementation: `backend/src/modules/campaigns/campaign.controller.js.getQrScanLanding`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-qr-scan-code-landing).

<a id="get-api-v1-reports"></a>
### GET `/api/v1/reports`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.view`, `fleet.reports.view`, `government.reports.view`, `finance.reports.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/reports/report.routes.js`. Implementation: `backend/src/modules/reports/report.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-reports).

<a id="delete-api-v1-reports-id"></a>
### DELETE `/api/v1/reports/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.generate`, `reports.export`, `finance.reports.create`, `finance.reports.export`, `finance.reports.manage`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/reports/report.routes.js`. Implementation: `backend/src/modules/reports/report.controller.js.remove`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-reports-id).

<a id="get-api-v1-reports-id"></a>
### GET `/api/v1/reports/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.view`, `fleet.reports.view`, `government.reports.view`, `finance.reports.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/reports/report.routes.js`. Implementation: `backend/src/modules/reports/report.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-reports-id).

<a id="post-api-v1-reports-generate"></a>
### POST `/api/v1/reports/generate`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `reports.generate`, `reports.export`, `finance.reports.create`, `finance.reports.export`, `finance.reports.manage`.

Observed controller body fields: `format`, `params`, `reportType`, `type`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reportType` | string | optional | — |
| `type` | string | optional | — |
| `format` | string | optional | one of ["pdf","xlsx","csv","json"]; default "csv" |
| `params` | object | optional | default {} |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/reports/report.routes.js`. Implementation: `backend/src/modules/reports/report.controller.js.generate`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-reports-generate).

<a id="get-api-v1-roles"></a>
### GET `/api/v1/roles`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.listRoles`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-roles).

<a id="post-api-v1-roles"></a>
### POST `/api/v1/roles`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.create`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | required | — |
| `code` | string | optional | — |
| `category` | string | optional | — |
| `description` | string | optional | also allows [""] |
| `organizationId` | number | optional | integer; also allows [null] |
| `permissionIds` | array | optional | items: [{"type":"number","rules":[{"name":"integer"}]}] |

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.createRole`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-roles).

<a id="delete-api-v1-roles-id"></a>
### DELETE `/api/v1/roles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.delete`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.deleteRole`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-roles-id).

<a id="get-api-v1-roles-id"></a>
### GET `/api/v1/roles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.getRole`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-roles-id).

<a id="patch-api-v1-roles-id"></a>
### PATCH `/api/v1/roles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | — |
| `category` | string | optional | — |
| `description` | string | optional | also allows [""] |

Root constraints: `{"rules":[{"name":"min","args":{"limit":1}}]}`.

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.updateRole`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-roles-id).

<a id="patch-api-v1-roles-id-permissions"></a>
### PATCH `/api/v1/roles/:id/permissions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `rbac.roles.update`.

Path parameters: `id` (required).

Observed controller body fields: `permissionIds`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `permissionIds` | array | required | items: [{"type":"number","rules":[{"name":"integer"}]}] |

Route source: `backend/src/modules/rbac/rbac.routes.js`. Implementation: `backend/src/modules/rbac/rbac.controller.js.setRolePermissions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-roles-id-permissions).

<a id="get-api-v1-routes"></a>
### GET `/api/v1/routes`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="post-api-v1-routes"></a>
### POST `/api/v1/routes`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.create`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="delete-api-v1-routes-id"></a>
### DELETE `/api/v1/routes/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="get-api-v1-routes-id"></a>
### GET `/api/v1/routes/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="patch-api-v1-routes-id"></a>
### PATCH `/api/v1/routes/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="put-api-v1-routes-id"></a>
### PUT `/api/v1/routes/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.routes)`.

<a id="post-api-v1-routes-id-approve"></a>
### POST `/api/v1/routes/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveRoute`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-routes-id-approve).

<a id="post-api-v1-routes-id-assign-vehicle"></a>
### POST `/api/v1/routes/:id/assign-vehicle`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.assign`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.assignVehicleToRoute`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-routes-id-assign-vehicle).

<a id="post-api-v1-routes-id-reject"></a>
### POST `/api/v1/routes/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.approve`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectRoute`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-routes-id-reject).

<a id="get-api-v1-routes-id-vehicles"></a>
### GET `/api/v1/routes/:id/vehicles`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.getRouteVehicles`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-routes-id-vehicles).

<a id="delete-api-v1-routes-assignments-id"></a>
### DELETE `/api/v1/routes/assignments/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.assign`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.unassignVehicleFromRoute`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-routes-assignments-id).

<a id="post-api-v1-routes-assignments-id-approve"></a>
### POST `/api/v1/routes/assignments/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.approve`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveVehicleAssignment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-routes-assignments-id-approve).

<a id="post-api-v1-routes-assignments-id-reject"></a>
### POST `/api/v1/routes/assignments/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.routes.approve`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectVehicleAssignment`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-routes-assignments-id-reject).

<a id="get-api-v1-support-tickets"></a>
### GET `/api/v1/support/tickets`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `support.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.listAll`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-support-tickets).

<a id="post-api-v1-support-tickets"></a>
### POST `/api/v1/support/tickets`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `subject` | string | required | min {"limit":3}; max {"limit":200} |
| `description` | string | optional | also allows ["",null] |
| `category` | string | optional | also allows ["",null] |
| `priority` | string | optional | one of ["low","medium","high","urgent"] |
| `attachments` | array | optional | items: [{"type":"object","keys":{"url":{"type":"string","flags":{"presence":"required"}},"fileName":{"type":"string","allow":["",null]},"fileType":{"type":"string","allow":["",null]},"fileSize":{"type":"number","allow":[null]}}}] |

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.create`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-support-tickets).

<a id="get-api-v1-support-tickets-id"></a>
### GET `/api/v1/support/tickets/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.getOne`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-support-tickets-id).

<a id="post-api-v1-support-tickets-id-messages"></a>
### POST `/api/v1/support/tickets/:id/messages`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `body` | string | optional | also allows ["",null] |
| `attachments` | array | optional | items: [{"type":"object","keys":{"url":{"type":"string","flags":{"presence":"required"}},"fileName":{"type":"string","allow":["",null]},"fileType":{"type":"string","allow":["",null]},"fileSize":{"type":"number","allow":[null]}}}] |

Root constraints: `{"dependencies":[{"rel":"or","peers":["body","attachments"]}]}`.

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.addMessage`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-support-tickets-id-messages).

<a id="patch-api-v1-support-tickets-id-status"></a>
### PATCH `/api/v1/support/tickets/:id/status`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `support.manage`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | one of ["open","in_progress","resolved","closed"] |

Route source: `backend/src/modules/support/support.routes.js`. Implementation: `backend/src/modules/support/support.controller.js.setStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-support-tickets-id-status).

<a id="post-api-v1-system-cron-trigger"></a>
### POST `/api/v1/system/cron/trigger`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Observed controller body fields: `jobKey`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.triggerCron`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-system-cron-trigger).

<a id="get-api-v1-system-devices"></a>
### GET `/api/v1/system/devices`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.devices`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-devices).

<a id="delete-api-v1-system-disk-logs"></a>
### DELETE `/api/v1/system/disk-logs`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Observed controller body fields: `channel`, `filename`, `filenames`, `folderAll`, `purgeAll`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.deleteDiskLogs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-system-disk-logs).

<a id="get-api-v1-system-disk-logs"></a>
### GET `/api/v1/system/disk-logs`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.getDiskLogs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-disk-logs).

<a id="get-api-v1-system-disk-logs-read"></a>
### GET `/api/v1/system/disk-logs/read`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Observed controller query fields: `channel`, `filename`, `lines`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.readDiskLog`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-disk-logs-read).

<a id="get-api-v1-system-health"></a>
### GET `/api/v1/system/health`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.health`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-health).

<a id="delete-api-v1-system-live-logs"></a>
### DELETE `/api/v1/system/live-logs`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Observed controller body fields: `all`, `ids`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.deleteLiveLogs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-system-live-logs).

<a id="get-api-v1-system-live-logs"></a>
### GET `/api/v1/system/live-logs`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.liveLogs`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-live-logs).

<a id="get-api-v1-system-server-status"></a>
### GET `/api/v1/system/server-status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `platform.mqtt`, `platform.audit`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/system/system.routes.js`. Implementation: `backend/src/modules/system/system.controller.js.serverMetrics`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-system-server-status).

<a id="get-api-v1-trips"></a>
### GET `/api/v1/trips`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="post-api-v1-trips"></a>
### POST `/api/v1/trips`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.create`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="delete-api-v1-trips-id"></a>
### DELETE `/api/v1/trips/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="get-api-v1-trips-id"></a>
### GET `/api/v1/trips/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="patch-api-v1-trips-id"></a>
### PATCH `/api/v1/trips/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="put-api-v1-trips-id"></a>
### PUT `/api/v1/trips/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.trips)`.

<a id="patch-api-v1-trips-id-end"></a>
### PATCH `/api/v1/trips/:id/end`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.trips.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.endTrip`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-trips-id-end).

<a id="post-api-v1-uploads"></a>
### POST `/api/v1/uploads`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Multipart upload field: `file`; maximum file size: 52428800 bytes. See upload guide for other fields.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/uploads/upload.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-uploads).

<a id="post-api-v1-uploads-document"></a>
### POST `/api/v1/uploads/document`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Multipart upload field: `file`; maximum file size: 52428800 bytes. See upload guide for other fields.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/uploads/upload.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-uploads-document).

<a id="delete-api-v1-uploads-document-id"></a>
### DELETE `/api/v1/uploads/document/:id`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

Permission (all): `uploads.manage`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/uploads/upload.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-uploads-document-id).

<a id="post-api-v1-uploads-video"></a>
### POST `/api/v1/uploads/video`

Authentication: Bearer access token required. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Multipart upload field: `video`; maximum file size: 524288000 bytes. See upload guide for other fields.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/uploads/upload.routes.js`. Implementation: `Inline handler in route source`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-uploads-video).

<a id="get-api-v1-users"></a>
### GET `/api/v1/users`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.view`, `fleet.fleets.view`.

Controller response helpers: `paginated`; see global envelope rules.

**Validated query** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `page` | number | optional | integer; min {"limit":1} |
| `limit` | number | optional | integer; min {"limit":1}; max {"limit":100} |
| `status` | string | optional | also allows ["",null] |
| `role_id` | number | optional | integer; also allows [null] |
| `roleCode` | string | optional | also allows ["",null] |
| `enrollment_no` | string | optional | also allows ["",null] |
| `search` | string | optional | also allows [""] |
| `organizationId` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |
| `organization_id` | alternatives | optional | also allows [null,""]; alternatives: [{"schema":{"type":"number","rules":[{"name":"integer"}]}},{"schema":{"type":"string"}}] |
| `city` | string | optional | also allows ["",null] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users).

<a id="post-api-v1-users"></a>
### POST `/api/v1/users`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.create`, `fleet.fleets.create`.

Plan quota resource: `users`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | required | min {"limit":2} |
| `email` | string | optional | email; also allows [null,""] |
| `phone` | string | optional | pattern {"regex":"/^(\\+91[-\\s]?)?[6-9]\\d{9}$/"}; also allows [null,""] |
| `password` | string | optional | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}}; also allows [null,""] |
| `roleId` | number | optional | integer; also allows [null] |
| `roleCode` | string | optional | also allows [null,""] |
| `organizationId` | number | optional | integer; also allows [null] |
| `languageId` | number | optional | integer; also allows [null] |
| `status` | string | optional | one of ["active","pending_approval","awaiting_subscription","invited","suspended","rejected"] |
| `mfaEnabled` | boolean | optional | — |
| `timezone` | string | optional | also allows [null,""] |
| `time_zone` | string | optional | also allows [null,""] |
| `timeZone` | string | optional | also allows [null,""] |
| `depotId` | number | optional | integer; also allows [null] |
| `depot_id` | number | optional | integer; also allows [null] |
| `depot` | any | optional | also allows [null,""] |
| `assignedBuses` | number | optional | integer; also allows [null] |
| `assigned_buses` | number | optional | integer; also allows [null] |
| `activeDriversCount` | number | optional | integer; also allows [null] |
| `active_drivers_count` | number | optional | integer; also allows [null] |
| `description` | string | optional | also allows [null,""] |
| `fleet_type` | string | optional | also allows [null,""] |
| `fleetType` | string | optional | also allows [null,""] |
| `contact_person` | string | optional | also allows [null,""] |
| `contactPerson` | string | optional | also allows [null,""] |
| `location` | string | optional | also allows [null,""] |
| `working_hours` | string | optional | also allows [null,""] |
| `workingHours` | string | optional | also allows [null,""] |
| `city` | string | optional | also allows [null,""] |
| `baseCity` | string | optional | also allows [null,""] |
| `certLevel` | string | optional | also allows [null,""] |
| `skills` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"array","items":[{"type":"string"}]}},{"schema":{"type":"string"}}] |
| `avatar_url` | string | optional | also allows [null,""] |
| `avatarUrl` | string | optional | also allows [null,""] |
| `documents` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `companyName` | string | optional | also allows [null,""] |
| `agencyName` | string | optional | also allows [null,""] |
| `department` | string | optional | also allows [null,""] |
| `clearance` | string | optional | also allows [null,""] |
| `designation` | string | optional | also allows [null,""] |
| `address` | string | optional | also allows [null,""] |
| `state` | string | optional | also allows [null,""] |
| `pincode` | string | optional | also allows [null,""] |
| `country` | string | optional | also allows [null,""] |
| `placeId` | string | optional | also allows [null,""] |
| `place_id` | string | optional | also allows [null,""] |
| `latitude` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string","allow":["",null]}}] |
| `longitude` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string","allow":["",null]}}] |
| `dlNumber` | string | optional | also allows [null,""] |
| `dlExpiry` | string | optional | also allows [null,""] |
| `badgeId` | string | optional | also allows [null,""] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Root constraints: `{"dependencies":[{"rel":"or","peers":["roleId","roleCode"]}]}`.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.create`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-users).

<a id="delete-api-v1-users-id"></a>
### DELETE `/api/v1/users/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.delete`, `fleet.fleets.delete`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.remove`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#delete-api-v1-users-id).

<a id="get-api-v1-users-id"></a>
### GET `/api/v1/users/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.view`, `fleet.fleets.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users-id).

<a id="patch-api-v1-users-id"></a>
### PATCH `/api/v1/users/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.update`, `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `name` | string | optional | min {"limit":2} |
| `email` | string | optional | email; also allows [null,""] |
| `phone` | string | optional | pattern {"regex":"/^(\\+91[-\\s]?)?[6-9]\\d{9}$/"}; also allows [null,""] |
| `password` | string | optional | min {"limit":8}; pattern {"regex":"/[A-Z]/","options":{"name":"uppercase"}}; pattern {"regex":"/[0-9]/","options":{"name":"number"}}; pattern {"regex":"/[^A-Za-z0-9]/","options":{"name":"special"}}; also allows [null,""] |
| `avatar_url` | string | optional | also allows [null,""] |
| `avatarUrl` | string | optional | also allows [null,""] |
| `roleId` | number | optional | integer; also allows [null] |
| `roleCode` | string | optional | also allows [null,""] |
| `languageId` | number | optional | integer; also allows [null] |
| `mfaEnabled` | boolean | optional | — |
| `timezone` | string | optional | also allows [null,""] |
| `time_zone` | string | optional | also allows [null,""] |
| `timeZone` | string | optional | also allows [null,""] |
| `clearance` | string | optional | also allows [null,""] |
| `designation` | string | optional | also allows [null,""] |
| `department` | string | optional | also allows [null,""] |
| `status` | string | optional | one of ["active","pending_approval","awaiting_subscription","invited","suspended","rejected"] |
| `depotId` | number | optional | integer; also allows [null] |
| `depot_id` | number | optional | integer; also allows [null] |
| `depot` | any | optional | also allows [null,""] |
| `assignedBuses` | number | optional | integer; also allows [null] |
| `assigned_buses` | number | optional | integer; also allows [null] |
| `activeDriversCount` | number | optional | integer; also allows [null] |
| `active_drivers_count` | number | optional | integer; also allows [null] |
| `description` | string | optional | also allows [null,""] |
| `fleet_type` | string | optional | also allows [null,""] |
| `fleetType` | string | optional | also allows [null,""] |
| `contact_person` | string | optional | also allows [null,""] |
| `contactPerson` | string | optional | also allows [null,""] |
| `location` | string | optional | also allows [null,""] |
| `working_hours` | string | optional | also allows [null,""] |
| `workingHours` | string | optional | also allows [null,""] |
| `city` | string | optional | also allows [null,""] |
| `baseCity` | string | optional | also allows [null,""] |
| `address` | string | optional | also allows [null,""] |
| `state` | string | optional | also allows [null,""] |
| `pincode` | string | optional | also allows [null,""] |
| `country` | string | optional | also allows [null,""] |
| `placeId` | string | optional | also allows [null,""] |
| `place_id` | string | optional | also allows [null,""] |
| `latitude` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string","allow":["",null]}}] |
| `longitude` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"number"}},{"schema":{"type":"string","allow":["",null]}}] |
| `certLevel` | string | optional | also allows [null,""] |
| `skills` | alternatives | optional | also allows [null]; alternatives: [{"schema":{"type":"array","items":[{"type":"string"}]}},{"schema":{"type":"string"}}] |
| `profileStatus` | string | optional | also allows [null,""] |
| `documents` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `newDocuments` | array | optional | also allows [null]; items: [{"type":"object","flags":{"unknown":true}}] |
| `removedDocumentIds` | array | optional | also allows [null]; items: [{"type":"number"}] |

Root schema permits additional keys; acceptance is not a guarantee that every key is persisted.

Root constraints: `{"rules":[{"name":"min","args":{"limit":1}}]}`.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.update`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-users-id).

<a id="get-api-v1-users-id-activity"></a>
### GET `/api/v1/users/:id/activity`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.view`, `fleet.fleets.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.activity`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users-id-activity).

<a id="get-api-v1-users-id-permissions"></a>
### GET `/api/v1/users/:id/permissions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.view`, `fleet.fleets.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.getUserPermissions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users-id-permissions).

<a id="put-api-v1-users-id-permissions"></a>
### PUT `/api/v1/users/:id/permissions`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `users.permissions.manage`.

Path parameters: `id` (required).

Observed controller body fields: `permissionKeys`, `permissions`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.updateUserPermissions`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#put-api-v1-users-id-permissions).

<a id="patch-api-v1-users-id-status"></a>
### PATCH `/api/v1/users/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.update`, `fleet.fleets.update`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | — |

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.setStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-users-id-status).

<a id="get-api-v1-users-check-availability"></a>
### GET `/api/v1/users/check-availability`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

No explicit permission middleware attached; controller/service checks may still apply.

Observed controller query fields: `email`, `excludeUserId`, `phone`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.checkAvailability`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users-check-availability).

<a id="get-api-v1-users-quotas-fleet-operators"></a>
### GET `/api/v1/users/quotas/fleet-operators`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `users.view`, `fleet.fleets.view`.

Observed controller query fields: `excludeFleetId`, `excludeId`, `excludeUserId`, `organizationId`, `organization_id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/users/user.routes.js`. Implementation: `backend/src/modules/users/user.controller.js.getFleetOperatorQuotas`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-users-quotas-fleet-operators).

<a id="get-api-v1-vehicle-slots"></a>
### GET `/api/v1/vehicle-slots`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="post-api-v1-vehicle-slots"></a>
### POST `/api/v1/vehicle-slots`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.create`, `fleet.vehicles.create`, `fleet.routes.assign`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="delete-api-v1-vehicle-slots-id"></a>
### DELETE `/api/v1/vehicle-slots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.delete`, `fleet.vehicles.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="get-api-v1-vehicle-slots-id"></a>
### GET `/api/v1/vehicle-slots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="patch-api-v1-vehicle-slots-id"></a>
### PATCH `/api/v1/vehicle-slots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.update`, `fleet.vehicles.update`, `fleet.routes.assign`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="put-api-v1-vehicle-slots-id"></a>
### PUT `/api/v1/vehicle-slots/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.update`, `fleet.vehicles.update`, `fleet.routes.assign`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.vehicleSlots)`.

<a id="post-api-v1-vehicle-slots-check-conflict"></a>
### POST `/api/v1/vehicle-slots/check-conflict`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.checkSlotConflict`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-vehicle-slots-check-conflict).

<a id="get-api-v1-vehicle-slots-timetable-grid"></a>
### GET `/api/v1/vehicle-slots/timetable/grid`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.slots.view`, `fleet.vehicles.view`, `fleet.routes.view`.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.getSlotsTimetable`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-vehicle-slots-timetable-grid).

<a id="get-api-v1-vehicles"></a>
### GET `/api/v1/vehicles`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.view`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.list (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="post-api-v1-vehicles"></a>
### POST `/api/v1/vehicles`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.create`.

Plan quota resource: `vehicles`.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.create (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="delete-api-v1-vehicles-id"></a>
### DELETE `/api/v1/vehicles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.delete`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.remove (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="get-api-v1-vehicles-id"></a>
### GET `/api/v1/vehicles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.view`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.get (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="patch-api-v1-vehicles-id"></a>
### PATCH `/api/v1/vehicles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="put-api-v1-vehicles-id"></a>
### PUT `/api/v1/vehicles/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id` (required).

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.crud.update (backend/src/modules/fleet/fleet.service.js.vehicles)`.

<a id="patch-api-v1-vehicles-id-approve"></a>
### PATCH `/api/v1/vehicles/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveVehicle`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-approve).

<a id="patch-api-v1-vehicles-id-assign-driver"></a>
### PATCH `/api/v1/vehicles/:id/assign-driver`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.vehicles.update`, `fleet.drivers.assign`.

Path parameters: `id` (required).

Observed controller body fields: `driverId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `driverId` | number | required | integer |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.assignDriver`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-assign-driver).

<a id="patch-api-v1-vehicles-id-assign-gps"></a>
### PATCH `/api/v1/vehicles/:id/assign-gps`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (any one): `fleet.vehicles.update`, `fleet.devices.assign`.

Path parameters: `id` (required).

Observed controller body fields: `gpsDeviceId`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `gpsDeviceId` | number | required | integer |

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.assignGps`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-assign-gps).

<a id="get-api-v1-vehicles-id-documents"></a>
### GET `/api/v1/vehicles/:id/documents`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.vehicleDocuments`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-vehicles-id-documents).

<a id="patch-api-v1-vehicles-id-documents-docid-approve"></a>
### PATCH `/api/v1/vehicles/:id/documents/:docId/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id`, `docId` (required).

Observed controller params fields: `docId`, `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.approveVehicleDocument`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-documents-docid-approve).

<a id="patch-api-v1-vehicles-id-documents-docid-reject"></a>
### PATCH `/api/v1/vehicles/:id/documents/:docId/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id`, `docId` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `docId`, `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectVehicleDocument`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-documents-docid-reject).

<a id="patch-api-v1-vehicles-id-reject"></a>
### PATCH `/api/v1/vehicles/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.update`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.rejectVehicle`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-vehicles-id-reject).

<a id="get-api-v1-vehicles-id-telemetry"></a>
### GET `/api/v1/vehicles/:id/telemetry`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: yes.

Permission (all): `fleet.vehicles.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/fleet/fleet.routes.js`. Implementation: `backend/src/modules/fleet/fleet.controller.js.vehicleTelemetry`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-vehicles-id-telemetry).

<a id="post-api-v1-webhooks-gateway"></a>
### POST `/api/v1/webhooks/:gateway`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

Raw request body middleware: `{"type":"*/*"}`. Preserve bytes for signature verification.

Path parameters: `gateway` (required).

Observed controller body fields: `toString`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `gateway`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/payments/webhook.routes.js`. Implementation: `backend/src/modules/payments/webhook.controller.js.handle`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-webhooks-gateway).

<a id="get-api-v1-work-orders"></a>
### GET `/api/v1/work-orders`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.view`.

Controller response helpers: `paginated`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.list`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-work-orders).

<a id="post-api-v1-work-orders"></a>
### POST `/api/v1/work-orders`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `work_orders.create`, `work_orders.assign`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `organizationId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |
| `fleetId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |
| `vehicleId` | number | required | integer; sign {"sign":"positive"} |
| `issueCategory` | string | required | trim {"enabled":true}; max {"limit":160} |
| `urgency` | string | optional | one of ["critical","high","normal","low","Critical","High","Normal","Low"]; default "normal" |
| `description` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null]; default null |
| `instructions` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null]; default null |

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.create`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-work-orders).

<a id="get-api-v1-work-orders-id"></a>
### GET `/api/v1/work-orders/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.getById`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#get-api-v1-work-orders-id).

<a id="patch-api-v1-work-orders-id"></a>
### PATCH `/api/v1/work-orders/:id`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `work_orders.create`, `work_orders.edit`, `work_orders.update`, `work_orders.assign`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `vehicleId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |
| `fleetId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |
| `issueCategory` | string | optional | trim {"enabled":true}; max {"limit":160}; also allows ["",null] |
| `urgency` | string | optional | one of ["critical","high","normal","low","Critical","High","Normal","Low"] |
| `description` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |
| `instructions` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.update`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-work-orders-id).

<a id="patch-api-v1-work-orders-id-approve"></a>
### PATCH `/api/v1/work-orders/:id/approve`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.assign`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.approve`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-work-orders-id-approve).

<a id="patch-api-v1-work-orders-id-assign"></a>
### PATCH `/api/v1/work-orders/:id/assign`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.assign`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `technicianId` | number | required | integer; sign {"sign":"positive"} |
| `slaHours` | number | optional | integer; min {"limit":1}; max {"limit":720}; also allows [null] |
| `slaDueAt` | date | optional | also allows [null] |
| `eta` | string | optional | trim {"enabled":true}; max {"limit":80}; also allows ["",null] |
| `instructions` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |

Root constraints: `{"dependencies":[{"rel":"or","peers":["slaHours","slaDueAt"]}]}`.

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.assign`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-work-orders-id-assign).

<a id="post-api-v1-work-orders-id-rate"></a>
### POST `/api/v1/work-orders/:id/rate`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.view`.

Path parameters: `id` (required).

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `rating` | number | required | integer; min {"limit":1}; max {"limit":5} |
| `comment` | string | optional | trim {"enabled":true}; max {"limit":2000}; also allows ["",null] |
| `tags` | array | optional | also allows [null]; items: [{"type":"string","rules":[{"name":"trim","args":{"enabled":true}},{"name":"max","args":{"limit":50}}]}] |

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.rate`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-work-orders-id-rate).

<a id="patch-api-v1-work-orders-id-reject"></a>
### PATCH `/api/v1/work-orders/:id/reject`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.assign`.

Path parameters: `id` (required).

Observed controller body fields: `reason`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `reason` | string | optional | trim {"enabled":true}; max {"limit":1000}; also allows ["",null] |

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.reject`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-work-orders-id-reject).

<a id="patch-api-v1-work-orders-id-status"></a>
### PATCH `/api/v1/work-orders/:id/status`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (any one): `work_orders.update`, `work_orders.assign`.

Path parameters: `id` (required).

Observed controller body fields: `status`. These names are read by the handler; requiredness/types may be enforced further in the service.

Observed controller params fields: `id`. These names are read by the handler; requiredness/types may be enforced further in the service.

Controller response helpers: `success`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `status` | string | required | one of ["submitted","approved","dispatched","on_site","resolved","closed","rejected","Submitted","Approved","Dispatched","On_Site","Resolved","Closed","Rejected"] |
| `resolutionNotes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |
| `resolution_notes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |
| `notes` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null] |

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.setStatus`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#patch-api-v1-work-orders-id-status).

<a id="post-api-v1-work-orders-dispatch"></a>
### POST `/api/v1/work-orders/dispatch`

Authentication: Bearer access token required. Tenant scope: yes. Access gate: not attached on route.

Permission (all): `work_orders.assign`.

Controller response helpers: `created`; see global envelope rules.

**Validated body** (Joi; conversion enabled; unknown keys stripped unless schema allows them)

| Field | Type | Presence | Rules |
|---|---|---|---|
| `organizationId` | number | required | integer; sign {"sign":"positive"} |
| `fleetId` | number | optional | integer; sign {"sign":"positive"}; also allows [null] |
| `vehicleId` | number | required | integer; sign {"sign":"positive"} |
| `issueCategory` | string | required | trim {"enabled":true}; max {"limit":160} |
| `urgency` | string | optional | one of ["critical","high","normal","low","Critical","High","Normal","Low"]; default "normal" |
| `description` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null]; default null |
| `instructions` | string | optional | trim {"enabled":true}; max {"limit":5000}; also allows ["",null]; default null |
| `technicianId` | number | required | integer; sign {"sign":"positive"} |
| `slaDueAt` | date | optional | also allows [null] |
| `slaHours` | number | optional | integer; min {"limit":1}; max {"limit":720}; also allows [null] |
| `eta` | string | optional | trim {"enabled":true}; max {"limit":80}; also allows ["",null]; default null |

Root constraints: `{"dependencies":[{"rel":"or","peers":["slaDueAt","slaHours"]}]}`.

Route source: `backend/src/modules/work-orders/workOrder.routes.js`. Implementation: `backend/src/modules/work-orders/workOrder.controller.js.dispatch`.

[Controller excerpt](CONTROLLER_CONTRACTS.md#post-api-v1-work-orders-dispatch).

<a id="get-health"></a>
### GET `/health`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/app.js`. Implementation: `backend/src/app.js`.

<a id="get-health-ready"></a>
### GET `/health/ready`

Authentication: No requireAuth guard on route. Tenant scope: not attached on route. Access gate: not attached on route.

No explicit permission middleware attached; controller/service checks may still apply.

No Joi request schema attached. This does **not** mean no body/query is accepted. Consult the linked controller/service and the integration guide; unvalidated response/body fields are not inferred as a strict schema.

Route source: `backend/src/app.js`. Implementation: `backend/src/app.js`.
