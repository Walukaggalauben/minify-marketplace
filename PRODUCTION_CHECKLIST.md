# MINIFY MARKET Production Checklist

## Required before deployment
- [ ] Set a strong `JWT_SECRET` in the production environment.
- [ ] Set `DATABASE_URL` to the production PostgreSQL instance.
- [ ] Set `CORS_ORIGINS` to the exact production web origin(s).
- [ ] Set `FLW_SECRET_KEY` and `FLW_SECRET_HASH` before enabling Flutterwave payments.
- [ ] Use HTTPS for both web and API services.
- [ ] Move uploaded images from local disk to durable object storage before multi-instance deployment.
- [ ] Configure automated PostgreSQL backups and verify a restore procedure.
- [ ] Configure application/process monitoring and error alerting.
- [ ] Configure Redis with authentication/TLS where required by the production provider.

## Payment status
Order mobile-money payment is intentionally not marked PAID by the client. A live gateway/webhook integration must be enabled before accepting real order payments.

## Security
Authentication, JWT production-secret enforcement, CORS restrictions, security headers, validation with unknown-field rejection, global throttling, and stricter upload controls are enabled.
