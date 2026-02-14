# MVP Production Readiness Gap Analysis

## Scope reviewed
- Backend API bootstrap, middleware wiring, and route registration.
- Frontend routing, role dashboards, checkout flow, and admin settings screens.
- Repository-level operational readiness (test automation, CI/CD, and observability signals).

## High-priority gaps before MVP launch

### 1) Payment platform integration is not fully live
- The backend payment route is implemented, but route mounting is currently disabled in the server bootstrap.
- Frontend has payment slices/components and PayPal flows, but disabling backend payment routes means no unified production payment orchestration (including webhooks/refunds path) through `/api/payments`.
- **MVP impact:** high risk for failed checkout/payment reconciliation and manual operations.

### 2) Admin settings are mostly UI placeholders, not persisted configuration
- Admin settings tabs render UI forms, but at least key payment settings are using local state and browser alert without durable backend persistence.
- There is duplicated tab metadata (`taxjs` appears twice), indicating unfinished settings IA/polish.
- **MVP impact:** operations team cannot safely manage gateways/tax/exchange/logistics from production UI.

### 3) Security middleware is partially implemented but not fully enforced end-to-end
- CSRF protection helper exists but is not applied in the server middleware chain.
- CORS allowlist includes static hardcoded origins alongside env-driven values; needs environment-specific governance and validation.
- **MVP impact:** elevated security/compliance risk in production traffic.

### 4) QA/testing is not production-grade automated
- There are a few test files across backend/frontend, but repository scripts do not provide a standardized `test` pipeline and there is no CI workflow.
- Some existing tests are script-style/manual API calls and not integrated into repeatable build gates.
- **MVP impact:** regressions can ship undetected, especially in checkout/auth/order flows.

### 5) Monitoring/operability baseline is incomplete
- Basic `/api/health` endpoint exists, but production readiness still needs structured logs, error tracking, metrics dashboards, and alerting SLOs.
- Current logging is mostly console-based.
- **MVP impact:** slower incident detection/recovery and weak postmortem data.

## Medium-priority product/flow completion gaps

### 6) Role/authorization UX hardening
- Vendor dashboard redirects to `/unauthorized`, but router does not define a dedicated route/page for unauthorized access.
- **MVP impact:** broken UX path and unclear permission error handling.

### 7) Live chat appears incomplete as support feature
- Frontend includes a live chat screen using Socket.IO, but backend socket service labels typing as “future feature” and current event contracts are not clearly aligned for full support-chat operation.
- No visible persistence/escalation/ticketing path for support conversations.
- **MVP impact:** support expectations may not match actual reliability.

### 8) Release hygiene / codebase hardening
- Debug/test components are imported into production vendor dashboard file and controlled via query params.
- Two similarly named middleware directories (`middleware` and `middlewares`) increase maintenance risk and onboarding friction.
- **MVP impact:** accidental exposure of non-production diagnostics and avoidable complexity.

## Recommended MVP backlog (practical sequence)

### Phase A (must-have for launch)
1. Enable and validate payment backend routes in production environment, including webhook verification, refund permissions, and reconciliation jobs.
2. Replace admin settings placeholders with persisted APIs + encrypted secret storage + audit trail.
3. Enforce CSRF/session security strategy consistently (or explicitly move to token-only pattern and remove dead CSRF code).
4. Add CI pipeline with mandatory checks: lint, unit/integration smoke tests, build, and minimal e2e checkout test.
5. Add production observability baseline: structured logging, centralized error tracking, metrics, uptime alerts.

### Phase B (should-have during beta)
6. Add unauthorized route/page and consistent RBAC error UX.
7. Stabilize live chat as true support module (event contract, persistence, moderation/admin console, SLA fallback).
8. Remove/feature-flag debug components from production bundles; consolidate middleware folder structure.

### Phase C (post-MVP enhancements)
9. Add email verification and stronger account recovery UX/policies (if not already fully enforced in auth journeys).
10. Add formal API versioning and deprecation policy for long-term client compatibility.
11. Add load/perf testing gates for high-traffic sale scenarios.

## Short answer: remaining features to become MVP production-ready
- Production-hardened **payments** (enabled backend routes + webhook/reconciliation confidence).
- Real **admin operations settings** (persisted + secure secret management + auditability).
- Fully enforced **security controls** (CSRF/session model, strict env-configurable CORS governance).
- Reliable **quality gates** (CI + automated tests for auth/cart/checkout/order).
- Essential **observability** (logs/metrics/errors/alerts).
- Clean **RBAC UX + support flow completion** (unauthorized page, chat reliability/persistence).
- **Codebase hardening** (remove debug artifacts from production paths, reduce architectural duplication).
