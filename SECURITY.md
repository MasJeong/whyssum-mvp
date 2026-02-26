# Security Notes

`왜씀?` MVP uses a basic hardening baseline for public deployment.

## Implemented Controls

- Security headers via middleware
  - Content-Security-Policy
  - Referrer-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Permissions-Policy
  - Cross-Origin-Opener-Policy
  - Strict-Transport-Security (HTTPS only)
- Server-side request validation using `zod`
- Basic IP-based rate limiting for API routes
- Explicit 400/429/500 error responses without stack traces

## Current Limitations

- In-memory rate limiting resets on process restart and does not coordinate across instances
- No authentication/authorization yet (MVP scope)
- No WAF/bot management rules yet

## Production Hardening Checklist

1. Replace in-memory rate limiting with Redis-backed distributed limiter
2. Add API authentication for sensitive endpoints
3. Add request logging + anomaly monitoring (Sentry/PostHog)
4. Add CSRF protection for state-changing routes
5. Add dependency scanning in CI (`npm audit`, SCA)
6. Add secrets management policy (`.env` only, no hardcoded secrets)
