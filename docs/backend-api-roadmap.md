# Waypoint backend API map

## Current state

The backend is a Spring Boot 3 / Java 21 application with Flyway migrations and PostgreSQL. It uses API → application service → domain/repository layers for orders, master-data reads, and planning. SQL is issued with `JdbcTemplate`; value inputs are bound with `?` parameters.

Existing routes:

| Route | Current purpose | Frontend use |
|---|---|---|
| `POST /api/v1/auth/login` | Authenticate and issue JWT | Login |
| `POST /api/v1/auth/signup` | Admin-only user provisioning; returns account details, never a user token | No current screen yet |
| `GET /api/v1/health` | Health response | Optional |
| `GET /api/v1/outlets?depotId=` | Read active outlets | Not connected |
| `GET /api/v1/vehicles/availability?depotId=` | Read vehicles | Dispatcher dashboard only |
| `GET /api/v1/orders?outletId=&orderDate=` | Read outlet orders | Not connected |
| `POST /api/v1/orders` | Place an order for the authenticated user's assigned outlet | Store Manager place-order form |
| `POST /api/v1/plans/run` | Run dispatch allocation | Dispatcher dashboard |

The frontend connects login, dispatcher vehicle lookup/planning, and Store Manager one-off order submission. The order endpoint derives outlet ownership from the authenticated identity, and the form sends item description, brand, quantity, weight, volume, delivery date, and temperature requirement. Most other screens use local arrays or component state. Those values are prototypes and must be replaced with API responses before the app can show operational data reliably.

Security baseline in place: API, application, persistence, and JWT service calls log method start/end/duration and exception class without request payloads; role checks protect current write/read routes; public signup is disabled in favor of admin-only provisioning; CORS accepts any origin with credentials disabled; database and JWT secrets must be supplied through environment variables; validation and database conflicts return safe Problem Details; and Store Manager order access is scoped to the assigned active outlet. This baseline still needs tests and deployment-specific secret configuration.

## Screen-to-API requirements

### Admin

| Screen | API operations | Data needed |
|---|---|---|
| Overview | `GET /admin/overview?date=&depotId=&brand=&period=` | Confirmed orders, completed/planned stops, at-risk deliveries, deferrals, on-time trend, brand/depot breakdown, recent integrity issues |
| Audit Trail | `GET /admin/audit-events?depotId=&status=&q=&from=&to=&page=&size=`; `GET /admin/audit-events/{id}` | Immutable event ID, actor and role, entity/reference, depot, event time, server receipt time, status/conflict, before/after values, reason, correlation ID |
| Forecast | `GET /admin/forecast?from=&days=&depotId=&brand=&orderType=` | Daily actual/forecast counts, confidence range, demand peak, required/available vehicle counts by type/temperature, fuel/capacity risks |
| Fine Ledger | `GET /admin/fines?...`; `GET /admin/fines/{id}`; `PATCH /admin/fines/{id}/decision`; `POST /admin/fines/{id}/reimbursement` | Driver, vehicle, outlet, depot, timestamp, amount/currency, incident reason, evidence reference, review decision/reason, payment state and audit history |
| Fuel Integrity | `GET /admin/fuel-integrity?...`; `GET /admin/fuel-integrity/{vehicleId}`; `POST /admin/fuel-integrity/{recordId}/review` | Vehicle, weekly quota, reported litres, odometer/trip distance, expected fuel, variance, evidence, review status and reviewer |
| Users | `GET /admin/users?...`; `POST /admin/users`; `PATCH /admin/users/{id}`; `PATCH /admin/users/{id}/active` | Email, display name, role, assigned outlet/depot/vehicle, active state, created/updated timestamps; never return password hashes |
| Master Data | CRUD `/admin/depots`, `/admin/districts`, `/admin/outlets`, `/admin/vehicles`, `/admin/service-allowances` | Existing master-data schema fields, active state and version; validate foreign keys and allowed enum values |
| Configuration | `GET /admin/configuration`; `PUT /admin/configuration` | Cutoff, route limit, operating calendar, deferral and notification flags, revision, updated-by/time, mandatory change reason |

### Dispatcher

| Screen | API operations | Data needed |
|---|---|---|
| Dashboard | `GET /dispatcher/dashboard?depotId=&date=` | Queue counts, confirmed/unassigned orders, deferred count, active routes/stops/driver/vehicle/status, on-time and vehicle metrics |
| Order Queue | `GET /dispatcher/orders?...`; `PATCH /dispatcher/orders/{id}/status` | Order reference, outlet/brand/district, depot, type, quantity/weight/volume, cutoff flag, current status, delivery window, allocation and deferral details |
| Planning & Allocation | `GET /plans/candidates?...`; `POST /plans/run` | Candidate order and vehicle inputs, constraint checks, score, plan result, trips/stops, capacity/fuel figures and deferral reasons |
| Suggested Plan | `GET /plans/{planId}`; `POST /plans/{planId}/publish` | Routes, vehicle/driver, ordered stops, departure/arrival estimates, capacity, risk flags, deferrals and decision state |
| Route Review | `GET /routes/{routeId}`; `PATCH /routes/{routeId}` | Stop sequence/window calculations, vehicle changes, approval state, reason and reviewer audit event |
| Fleet & Fuel | `GET /dispatcher/fleet?...` | Vehicle availability/workshop status, current trip, quota use, fuel variance, maintenance flags |
| Live Monitoring | `GET /dispatcher/routes/live?...` (consider SSE/WebSocket later) | Current route/stop state, last location timestamp, ETA, delay reason, stale/offline indicator |
| Emergency | `GET /dispatcher/incidents`; `POST /dispatcher/incidents`; `PATCH /dispatcher/incidents/{id}` | Breakdown/delay type, route/vehicle/driver, location, impact, action, status, event times |
| History | `GET /dispatcher/history?...` | Plans, published routes, order outcomes, deferrals, changes and audit references |

### Store Manager

| Screen | API operations | Data needed |
|---|---|---|
| Dashboard | `GET /store/dashboard`; `GET /store/orders/recent` | The authenticated user's outlet, order counts/statuses, delivery/receipt state, invoices and order summaries |
| Place Order | `POST /store/orders`; `GET/POST/PATCH/DELETE /store/schedules` | Item/brand/type, units, weight, volume, requested date, cutoff decision; recurring quantity/frequency/first run/state |
| Track Orders | `GET /store/orders?status=&type=&q=`; `GET /store/orders/{id}` | Status timeline, assigned vehicle/driver, ETA/window, items, risk and deferral reason |
| Receive & Confirm | `POST /store/orders/{id}/receipt` | Per-item received/damaged/missing quantities, proof type/reference, receiver name, event time, offline sync ID |
| History | `GET /store/history?...`; `GET /store/orders/{id}/documents` | Delivered/deferred status, item summary, invoice/receipt references, feedback and dates |

### Loader

| Screen | API operations | Data needed |
|---|---|---|
| Dashboard | `GET /loader/loads?date=`; `GET /loader/loads/{id}` | Assigned truck/driver/dock/route, order/package count, planned sequence, capacity, load progress and clearance status |
| Scan Packages | `POST /loader/loads/{id}/scans`; `GET /loader/loads/{id}/scans`; `POST /loader/loads/{id}/defects`; `POST /loader/loads/{id}/complete` | Package code, expected order/stop, scan event ID/time/device, duplicate/conflict result, defect type/severity/note/evidence, completion state |
| Missing Items | `GET /loader/missing-items`; `PATCH /loader/missing-items/{id}` | Package/shipment/order, expected dock/truck, weight, investigation state, resolution and event history |
| Defect Items | `GET /loader/defects`; `PATCH /loader/defects/{id}` | Package details, defect, severity, photo reference, resolution/rescan state and actor |

### Driver

| Screen | API operations | Data needed |
|---|---|---|
| Today / Stops | `GET /driver/route/today`; `POST /driver/routes/{id}/start`; `PATCH /driver/stops/{id}` | Assigned route, stop/order sequence, outlet address/window, package checklist, ETA, arrival/departure and stop outcome |
| Fuel Log | `GET /driver/fuel`; `POST /driver/fuel` | Vehicle, date, odometer, litres, station, cost/currency, receipt image reference and offline event ID |
| Fine Report | `POST /driver/fines` | Route/stop, type, amount, time/location, narrative, ticket/evidence reference |
| Proof of Delivery | `POST /driver/stops/{id}/proof-of-delivery` | Receiver, delivered/short quantities, condition, signature/photo references, timestamp and idempotency key |
| History | `GET /driver/history` | Completed routes/stops, fuel entries, fines and POD status |

## Security and data rules

- Use `JdbcTemplate`/`NamedParameterJdbcTemplate` with bound values for every input. Dynamic sort/filter SQL must come from a fixed allow-list; never concatenate request values into SQL.
- Enforce roles at route/service boundaries. Derive store outlet, driver vehicle, loader depot and dispatcher depot from the authenticated user instead of trusting IDs supplied by the browser.
- Keep admin account provisioning behind an admin-only endpoint. Public signup must not accept operational or admin roles.
- Return DTOs only; do not expose password hashes, internal exception messages, SQL, JWT contents, or evidence storage paths.
- Validate request shapes and enforce ownership for every `{id}` lookup/update. Use optimistic versions for mutable plans, orders, and master data.
- Make mobile/offline mutations idempotent with client event IDs. Preserve original event time and server received time; record conflicting updates as new audit events.
- Use parameterized SQL and transactions for state transitions. Add indexes that match the final filter/sort patterns and pagination keys.
- Log method start/end, duration, and exception type at API/application boundaries. Do not log passwords, authorization headers, evidence, or full payloads.

## Suggested implementation order

1. Finish identity and role scoping, then centralize error responses and boundary logs.
2. Connect the existing outlet/order APIs to the Store Manager flow and derive outlet ownership from the JWT identity.
3. Add plan read/publish/review APIs and replace dispatcher prototype data.
4. Implement the admin audit/configuration/master-data/user APIs, then fine/fuel reporting.
5. Add loader and driver event tables/APIs with idempotent offline sync and evidence references.
6. Replace dashboard mock values with aggregate endpoints; add live event transport only after durable route/stop events exist.
