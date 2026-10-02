# Waypoint Postman API

## Import

In Postman, import both files in this folder:

- `Waypoint Backend API.postman_collection.json`
- `Waypoint Hosted API.postman_environment.json`

Select the **Waypoint Hosted API** environment and set `baseUrl` to the API origin only, for example `https://api.example.com`. Do not add `/api/v1` or a trailing slash. Set `loginEmail` and `loginPassword` to an existing account. The environment secret is blank by design.

Run **Authentication → Login** first. Its test script saves the returned JWT as the collection variable `accessToken`. Protected requests inherit that bearer token. For admin-only user provisioning, log in with an ADMIN account first so the collection variable contains that account's token.

The collection also defines `depotId`, `outletId`, and `orderDate`. Change them to match the account and data in the hosted database. The sample values match the seeded reference data; the date is only an example.

## Included API routes

These are all routes currently implemented in the backend controllers:

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/v1/health` | Public |
| `POST` | `/api/v1/auth/login` | Public |
| `POST` | `/api/v1/auth/signup` | ADMIN |
| `GET` | `/api/v1/outlets?depotId=` | DISPATCHER, LOADER, ADMIN |
| `GET` | `/api/v1/vehicles/availability?depotId=` | DISPATCHER, LOADER, ADMIN |
| `GET` | `/api/v1/orders?outletId=&orderDate=` | STOREKEEPER, DISPATCHER, ADMIN |
| `POST` | `/api/v1/orders` | STOREKEEPER |
| `POST` | `/api/v1/plans/run` | DISPATCHER, ADMIN |

Each request in the collection has a sample success response. Request bodies and response examples reflect the backend DTOs. Tokens and example IDs are placeholders; Postman replaces the token after login, and the server generates real IDs.

### Notes

- Signup creates a user and returns `{ email, role, displayName }`; it does not issue a JWT. The password must be 8–72 characters. Supported roles are `STOREKEEPER`, `STORE_MANAGER`, `DISPATCHER`, `LOADER`, and `DRIVER`; do not use `ADMIN` here.
- Provide `outletId` for order queries as DISPATCHER or ADMIN. A STOREKEEPER is scoped to their active assigned outlet; the server ignores the supplied outlet ID for this role.
- Order creation does not accept `outletId`. The backend resolves the active outlet from the authenticated STOREKEEPER account. Required request fields are `productBrand`, `itemDescription`, `deliveryDate`, `tempRequirement`, `units`, `weightKg`, and `volumeM3`.
- A dispatcher may only run a plan for their assigned depot. Admins may specify any existing depot.
- There is one plan per depot and plan date in the current schema. Use a new date when running another plan for the same depot.
- Other frontend areas, including audit trail, forecasts, fine ledger, fuel integrity, configuration, loader scans, and driver workflows, do not have backend routes yet. They are listed in `docs/backend-api-roadmap.md` and are not represented as live endpoints in this collection.
