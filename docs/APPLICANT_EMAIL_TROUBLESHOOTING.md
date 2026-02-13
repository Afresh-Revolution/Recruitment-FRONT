# Applicant email not sending – troubleshooting

When an admin sets status to **Accepted** or **Rejected**, the **backend** is responsible for sending the email. The frontend only calls `PATCH /api/admin/applications/:id/status` with `{ "status": "hired" | "approved" | "rejected" }`.

If applicants are not receiving emails, check the following on the **backend** (Recruitment-BACK or your API server).

---

## 1. Backend returns email status

The PATCH response should include:

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

- If the email **failed**, the backend should set `emailSent: false` and `emailError: "reason"` (e.g. `"No applicant email in application data"`).
- The admin dashboard shows this in the success toast: "Email failed: &lt;emailError&gt;" so you can see the reason.

---

## 2. Application has applicant email

The backend sends the email to **`application.data.email`**.

- When the applicant submits via **POST /api/formdata/apply**, the frontend sends `email` as a form field. The backend must save it into the FormData document as **`data.email`**.
- In your controller (e.g. `createWithResume`), ensure every form field (including `email`) is copied into the `data` object before saving to MongoDB.
- If `data.email` is missing, the backend should return `emailSent: false`, `emailError: "No applicant email in application data"`.

---

## 3. SMTP / email is configured on the backend

The backend must have email sending configured (e.g. Nodemailer, SendGrid, Resend).

- **Env vars** (see backend `env.example`):  
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, etc.
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.
- **Test:** Use **POST /api/admin/test-email** with header `X-Super-Admin-Secret: <SUPER_ADMIN_SECRET>` (and optional body `{ "to": "your@email.com" }`) to verify SMTP works.

---

## 4. Status handler sends the email

In the backend controller that handles **PATCH /api/admin/applications/:id/status**:

- When `status` is **hired** or **approved** → call the approval-email function (e.g. `sendApplicationStatusEmail(application, 'approved')`).
- When `status` is **rejected** → call the decline-email function.
- Use `application.data.email` as the recipient and set `emailSent` / `emailError` in the response based on the send result.

---

## 5. What the frontend does

- Sends **email** when the applicant applies (POST /api/formdata/apply with form field `email`).
- Sends **status** when the admin updates (PATCH with `status: "hired"` | `"rejected"` etc.).
- Shows the backend’s **emailSent** / **emailError** in the admin toast after updating to Accepted/Rejected.

So: **fix the email on the backend** (data.email present, SMTP configured, status handler sends email and returns emailSent/emailError). The frontend cannot send the email itself.
