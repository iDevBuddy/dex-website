# Netlify runtime compatibility

The production deploy for Search Console setup failed because the combined
environment exceeded the legacy Lambda runtime's 4 KB limit. All 17 function
entrypoints now default-export Netlify's official `withLambda` adapter. Their
existing named handlers, guards, payload handling, and business logic remain
unchanged. Background modes and existing cron schedules are explicit.

`@netlify/aws-lambda-compat` is pinned to 1.0.2 for the existing Node 20 runtime.
Its only dependency is Netlify's types package. This avoids maintaining a custom
HTTP/Lambda translation layer or removing legitimate credentials to fit a cap.

Regression tests exercise each entrypoint's modern export, authorization/method
guards, signed Slack payload preservation, and schedule/background configuration.
Production acceptance requires successful deployment with the real environment,
authenticated cloud-status access, and unchanged function schedules.

Reference: https://docs.netlify.com/build/functions/api/#netlifyaws-lambda-compat
