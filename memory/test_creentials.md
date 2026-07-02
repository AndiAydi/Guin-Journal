"# Journal-Guin Test Credentials

## Smoke / dev account (created via curl during build)
- email: smoke1@test.com
- password: smoke123
- user_id: user_ebf999d7e723
- auth_provider: email

## Notes
- Google OAuth uses Emergent Managed Google Auth (session_id → /api/auth/session). No app-managed password.
- For automated testing of auth-gated pages, create a session row directly:

```js
db.user_sessions.insertOne({
  user_id: \"<user_id>\",
  session_token: \"test_session_<timestamp>\",
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
```
Then send the value as either the `session_token` cookie or `Authorization: Bearer <token>` header.
"