# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within AI Knowledge Platform, please send an email to the project maintainers. All security vulnerabilities will be promptly addressed.

**Please do NOT report security vulnerabilities through public GitHub issues.**

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

### Authentication
- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens with secure HTTP-only cookies
- OAuth 2.0 integration (Google, GitHub)
- Session management with NextAuth.js

### API Security
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS configuration
- SQL injection prevention via Prisma ORM
- XSS protection through React's automatic escaping
- CSRF protection via SameSite cookies

### Data Protection
- Environment variables for all secrets
- No secrets in version control
- Secure file upload with type and size validation
- Database connections encrypted in transit

### Infrastructure
- Security headers via Next.js middleware
- Docker container runs as non-root user
- Dependencies audited regularly

## Best Practices for Contributors

1. Never commit secrets, API keys, or credentials
2. Use environment variables for configuration
3. Validate all user inputs on the server side
4. Use parameterized queries (handled by Prisma)
5. Follow OWASP Top 10 guidelines
6. Keep dependencies updated

## Dependency Security

We use `npm audit` to check for known vulnerabilities in dependencies:

```bash
npm audit
npm audit fix
```

## Changelog

Security-related changes are documented in the [CHANGELOG](CHANGELOG.md).
