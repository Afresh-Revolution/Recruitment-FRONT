# Application & CV API – Endpoint and How It Works

## Main endpoint: submit application + CV in one request

`POST /api/formdata/apply`

- **Purpose:** Submit a job application and optionally attach a CV in a single request. The backend stores the file (multer) and creates the application in MongoDB.
- **Content-Type:** multipart/form-data
- **Auth:** None

### How it works

1. **Request body (form fields + optional file)**  
   Send multipart form data with:
   - **Required:** companyId, roleId
   - **Optional:** applicantId
   - **Optional file:** field name `resume` (PDF or Word, max 10 MB)
   - Any other fields as form fields (e.g. fullName, email, phone, address, educationStatus, role, motivation, workRemotely, workingDaysTime, etc.)

2. **Backend flow**
   - Multer handles the `resume` file: saves it under `uploads/` with a unique filename (e.g. `1234567890-abc123.pdf`).
   - Controller `createWithResume`:
     - Reads companyId, roleId, applicantId from req.body.
     - Puts every other form field into a `data` object (e.g. data.fullName, data.email, …).
     - If a file was uploaded, sets data.resumeUrl and data.attachmentUrl to `/uploads/<filename>`.
     - Creates one FormData document in MongoDB with that data and returns it.

3. **Response**  
   `201` with body:  
   `{ "ok": true, "data": { ...application document } }`

One API call stores both the CV and the application.

---

## Other related endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/formdata/apply | Submit application + optional CV in one multipart request. |
| POST | /api/formdata | Submit application as JSON only (no file). |
| POST | /api/upload/resume | Upload only a resume file; returns { ok, url, filename }. |
| GET | /api/formdata | List applications (optional `?companyId=...`). |
| GET | /uploads/:filename | Public URL to download a stored file (e.g. CV). |

---

## Frontend usage

The app uses `POST /api/formdata/apply` with flat form fields and optional `resume` file. See `src/api/formdata.ts`.
