# Frontend / FastAPI contract

The current FastAPI application exposes only `GET /` and `GET /health`. The frontend does not simulate authentication or make tenant-scoped requests until the following contract is agreed and implemented.

Configure the service URL with `VITE_API_BASE_URL` (see `.env.example`). This value must contain only the API origin; it must never include a client or tenant ID.

## Implemented authentication contract

- `POST /auth/login` accepts `{ "email", "password" }` and returns a 15-minute bearer token.
- The frontend keeps the token in memory only and sends it as `Authorization: Bearer <token>`.
- `GET /me` returns server-derived identity, role, capabilities, and assigned clients.
- `POST /auth/logout` revokes the current token and returns `204`.

## Remaining administration decision

The current UI contains user/client assignment controls, but no safe assignment-management contract has been agreed. Those controls must not be connected until role model, permitted assignment changes, and audit requirements are specified.

## Response handling requirements

When the contract is available, the frontend should:

- clear its session and return to sign-in for `401` or an explicit expired-session response;
- render `insufficient_evidence` as a non-answer with no invented prose;
- display only citations returned with that answer;
- show a retryable error for network and `5xx` failures; and
- rely on backend authorization for every route and never construct tenant scope from URL parameters or local state.
