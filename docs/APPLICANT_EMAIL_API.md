# Applicant email (approved / declined) – how it works & endpoints

Applicants receive an email when an admin sets their application to **approved**, **hired**, or **rejected**. There is no separate “send email” endpoint — the email is sent automatically when you update the application status.

---

## 1. How the email is triggered

1. Admin calls **PATCH /api/admin/applications/:id/status** with body:
   - `status`: `"hired"` | `"approved"` (accept) or `"rejected"` (decline)
   - `message`: optional custom text (replaces the default email body)

2. Backend:
   - Updates the application status and saves.
   - Reads applicant email from `application.data.email`, name from `application.data.fullName`, company and role from the application.
   - If status is **hired** or **approved** → sends an **approval** email.
   - If status is **rejected** → sends a **decline** email.

3. No email is sent for statuses: `pending`, `reviewed`, `interviewing` (only status is updated).

---

## 2. Endpoint

| Method | Endpoint | Auth | When email is sent |
|--------|----------|------|--------------------|
| PATCH | /api/admin/applications/:id/status | Bearer (admin JWT) | When status is **hired**, **approved**, or **rejected** |

**Request**

```
PATCH /api/admin/applications/<applicationId>/status
Authorization: Bearer <admin JWT>
Content-Type: application/json

{
  "status": "hired",
  "message": "Optional custom message (if omitted, default approval/decline text is used)"
}
```

- **Accept:** `"status": "hired"` or `"status": "approved"`
- **Decline:** `"status": "rejected"`
- **No email:** `"status": "pending"`, `"reviewed"`, or `"interviewing"`

**Response**

```json
{
  "ok": true,
  "data": {
    "application": { "_id": "...", "status": "hired", "reviewedAt": "..." },
    "emailSent": true,
    "emailError": null
  }
}
```

- If the application has no `data.email`, you get `emailSent: false` and `emailError: "No applicant email in application data"`.

---

## 3. Test-email endpoint (SMTP check)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/admin/test-email | Header `X-Super-Admin-Secret: <SUPER_ADMIN_SECRET>` | Sends one test approval email to check SMTP. |

**Body (optional):** `{ "to": "your@email.com" }`  
If `to` is omitted, the server uses SMTP_USER from .env as the recipient.

---

## 4. Env vars for email (backend)

- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM  
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.

---

## Summary

| Goal | What to call |
|------|----------------|
| Send approval email | PATCH .../applications/:id/status with `{ "status": "hired" }` or `{ "status": "approved" }` (optional `message`) |
| Send decline email | PATCH .../applications/:id/status with `{ "status": "rejected" }` (optional `message`) |
| Test that email works | POST /api/admin/test-email with X-Super-Admin-Secret and optional `{ "to": "email@example.com" }` |

Approval/decline emails are sent only via the status endpoint.
