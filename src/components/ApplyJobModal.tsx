import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, AlertCircle } from 'lucide-react'
import { submitApplication } from '../api/formdata'
import { getCompanyObjectId } from '../api/destination'

const EDUCATION_OPTIONS = ['Student', 'Graduate', 'NYSC', 'Unemployed', 'Others']

const WORKING_DAYS = [
  'Mondays: 10am - 5pm',
  'Wednesday: 10am - 5pm',
  'Friday: 10am - 4pm',
]
const WORKING_DAYS_STRING = WORKING_DAYS.join(', ')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-+()]{10,}$/

const RESUME_ACCEPT = '.pdf,.doc,.docx'
const RESUME_MAX_BYTES = 5 * 1024 * 1024 // 5MB
const RESUME_MAX_LABEL = '5MB'
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i

interface ApplyJobModalProps {
  companyId: string
  roleId: string
  jobTitle: string
  onClose: () => void
  /** Called when user dismisses the success overlay (so parent can mark this role as Applied). */
  onSuccess?: (roleId: string, formData?: any) => void
  /** When set, a notice is shown and the submit button is disabled (e.g. for preview/mock roles). */
  submissionDisabled?: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  education?: string
  role?: string
  motivation?: string
  attachment?: string
}

const ApplyJobModal = ({ companyId, roleId, jobTitle, onClose, onSuccess, submissionDisabled }: ApplyJobModalProps) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [education, setEducation] = useState<string[]>([])
  const [role, setRole] = useState('')
  const [motivation, setMotivation] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const handleCloseRef = useRef<() => void>(() => { })

  const handleClose = () => {
    previousActiveRef.current?.focus()
    onClose()
  }
  handleCloseRef.current = handleClose

  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    return () => {
      previousActiveRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const toggleEducation = (option: string) => {
    setEducation((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]
    )
  }

  const validate = useCallback((): FormErrors => {
    const err: FormErrors = {}
    const nameTrim = fullName.trim()
    if (!nameTrim) err.fullName = 'Full name is required'
    if (!email.trim()) err.email = 'Email is required'
    else if (!EMAIL_REGEX.test(email)) err.email = 'Enter a valid email address'
    if (!phone.trim()) err.phone = 'Phone number is required'
    else if (!PHONE_REGEX.test(phone.replace(/\s/g, ''))) err.phone = 'Enter a valid phone number'
    if (!address.trim()) err.address = 'Current address is required'
    if (education.length === 0) err.education = 'Select at least one option'
    if (!role || role === '') err.role = 'Please select a role'
    if (!motivation.trim()) err.motivation = 'Please tell us why you want to work with us'
    return err
  }, [fullName, email, phone, address, education, role, motivation])

  const validateFile = (f: File | null): string | null => {
    if (!f) return null
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(f.type) && !/\.(pdf|doc|docx)$/i.test(f.name)) return `Use PDF or Word (.doc, .docx) only`
    if (f.size > RESUME_MAX_BYTES) return `File must be under ${RESUME_MAX_LABEL}`
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0] ?? null
    const err = validateFile(chosen)
    setFileError(err)
    setFile(err ? null : chosen)
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setSubmitError(null)
    if (!isValid) return
    if (!OBJECT_ID_REGEX.test(roleId)) {
      setSubmitting(true)
      await new Promise((r) => setTimeout(r, 400))
      setShowSuccess(true)
      setSubmitting(false)
      return
    }
    setSubmitting(true)
    try {
      let effectiveCompanyId = companyId
      if (!OBJECT_ID_REGEX.test(companyId)) {
        const resolved = await getCompanyObjectId(companyId)
        if (!resolved) {
          setSubmitError('Unable to load company details. Please go to Browse Jobs and select a company, then try again.')
          setSubmitting(false)
          return
        }
        effectiveCompanyId = resolved
      }
      const result = await submitApplication({
        companyId: effectiveCompanyId,
        roleId,
        jobTitle,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        education,
        role,
        workingDaysTime: WORKING_DAYS_STRING,
        motivation: motivation.trim(),
        workRemotely: true,
        resume: file ?? undefined,
      })
      if (result.ok) {
        setShowSuccess(true)
      } else {
        setSubmitError(result.message ?? 'Submission failed')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = useCallback(() => {
    // Construct application details from form state
    const applicationData = {
      applicantName: fullName,
      email,
      phone,
      address,
      educationStatus: education.join(', '),
      role: jobTitle, // Using jobTitle as the applied role name
      motivation,
      attachmentName: file?.name,
      // attachmentUrl is not available since we don't get it back from backend, 
      // but we can mark it as "submitted"
    }

    onSuccess?.(roleId, applicationData) // Pass data back
    setShowSuccess(false)
    onClose()
  }, [roleId, onSuccess, onClose, fullName, email, phone, address, education, jobTitle, motivation, file])

  const successCloseRef = useRef(handleSuccessClose)
  successCloseRef.current = handleSuccessClose

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const showError = (field: keyof FormErrors) =>
    (touched[field] || submitAttempted) && errors[field]

  const modalContent = (
    <div
      className="job-detail-overlay apply-job-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-job-title"
    >
      <div className="apply-job-dialog" onClick={(e) => e.stopPropagation()}>
        <button ref={closeButtonRef} type="button" className="job-detail-close" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 id="apply-job-title" className="apply-job-title">
          Apply Job - {jobTitle}
        </h2>

        {submissionDisabled && (
          <div className="apply-job-notice" role="alert">
            <AlertCircle size={18} aria-hidden />
            {submissionDisabled}
          </div>
        )}

        <form className="apply-job-form" onSubmit={handleSubmit}>
          <div className="apply-job-section">
            <h3 className="apply-job-heading">Personal Information</h3>
            <div className="apply-job-grid">
              <div className="apply-job-field-wrap">
                <label htmlFor="apply-fullName">Full Name</label>
                <input
                  id="apply-fullName"
                  type="text"
                  className={`apply-job-input ${showError('fullName') ? 'apply-job-input--error' : ''}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  placeholder="Full Name"
                  aria-required
                  aria-invalid={!!showError('fullName')}
                />
                {showError('fullName') && (
                  <span className="apply-job-error" role="alert">{errors.fullName}</span>
                )}
              </div>
              <div className="apply-job-field-wrap">
                <label htmlFor="apply-email">Email Address</label>
                <input
                  id="apply-email"
                  type="email"
                  className={`apply-job-input ${showError('email') ? 'apply-job-input--error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="Email Address"
                  aria-required
                  aria-invalid={!!showError('email')}
                />
                {showError('email') && (
                  <span className="apply-job-error" role="alert">{errors.email}</span>
                )}
              </div>
              <div className="apply-job-field-wrap">
                <label htmlFor="apply-phone">Phone Number</label>
                <input
                  id="apply-phone"
                  type="tel"
                  className={`apply-job-input ${showError('phone') ? 'apply-job-input--error' : ''}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  placeholder="Phone Number"
                  aria-required
                  aria-invalid={!!showError('phone')}
                />
                {showError('phone') && (
                  <span className="apply-job-error" role="alert">{errors.phone}</span>
                )}
              </div>
              <div className="apply-job-field-wrap">
                <label htmlFor="apply-address">Current Address (City/State)</label>
                <input
                  id="apply-address"
                  type="text"
                  className={`apply-job-input ${showError('address') ? 'apply-job-input--error' : ''}`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, address: true }))}
                  placeholder="Current Address (City/State)"
                  aria-required
                  aria-invalid={!!showError('address')}
                />
                {showError('address') && (
                  <span className="apply-job-error" role="alert">{errors.address}</span>
                )}
              </div>
            </div>
          </div>

          <div className="apply-job-section">
            <h3 className="apply-job-heading">Education Status</h3>
            <div className="apply-job-checkboxes">
              {EDUCATION_OPTIONS.map((option) => (
                <label key={option} className="apply-job-checkbox-label">
                  <input
                    type="checkbox"
                    checked={education.includes(option)}
                    onChange={() => toggleEducation(option)}
                    onBlur={() => setTouched((p) => ({ ...p, education: true }))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {showError('education') && (
              <span className="apply-job-error" role="alert">{errors.education}</span>
            )}
          </div>

          <div className="apply-job-section">
            <h3 className="apply-job-heading">Role</h3>
            <div className="apply-job-field-wrap">
              <select
                id="apply-role"
                className={`apply-job-select ${showError('role') ? 'apply-job-input--error' : ''}`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, role: true }))}
                aria-required
                aria-invalid={!!showError('role')}
              >
                <option value="">Select Role</option>
                <option value={jobTitle}>{jobTitle}</option>
              </select>
              {showError('role') && (
                <span className="apply-job-error" role="alert">{errors.role}</span>
              )}
            </div>
          </div>

          <div className="apply-job-section">
            <h3 className="apply-job-heading">Working days & Time</h3>
            <div className="apply-job-working-days">
              {WORKING_DAYS.map((line) => (
                <span key={line} className="apply-job-working-day">{line}</span>
              ))}
            </div>
          </div>

          <div className="apply-job-section">
            <h3 className="apply-job-heading">Motivation</h3>
            <div className="apply-job-field-wrap">
              <textarea
                id="apply-motivation"
                className={`apply-job-textarea ${showError('motivation') ? 'apply-job-input--error' : ''}`}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, motivation: true }))}
                placeholder="Why do you want to work with us? (Short Answer)"
                rows={4}
                aria-required
                aria-invalid={!!showError('motivation')}
              />
              {showError('motivation') && (
                <span className="apply-job-error" role="alert">{errors.motivation}</span>
              )}
            </div>
          </div>

          <div className="apply-job-section">
            <h3 className="apply-job-heading">Attachment (PDF or Word, max {RESUME_MAX_LABEL})</h3>
            <label className="apply-job-upload">
              <input
                type="file"
                accept={RESUME_ACCEPT}
                onChange={handleFileChange}
                className="apply-job-upload-input"
                aria-invalid={!!fileError}
                aria-describedby={fileError ? 'apply-file-error' : undefined}
              />
              <Upload size={32} className="apply-job-upload-icon" aria-hidden />
              <span className="apply-job-upload-text">
                {file ? file.name : 'Upload File'}
              </span>
            </label>
            {fileError && (
              <span id="apply-file-error" className="apply-job-error" role="alert">
                {fileError}
              </span>
            )}
          </div>

          <div className="apply-job-remote-badge">
            <AlertCircle size={18} aria-hidden />
            <span>Work is remotely</span>
          </div>

          {submitError && (
            <p className="apply-job-error apply-job-submit-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="apply-job-footer">
            <button type="submit" className="apply-job-submit" disabled={submitting || !!submissionDisabled}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )

  const runSuccessClose = () => {
    successCloseRef.current?.()
  }

  const successOverlay =
    showSuccess &&
    (() => {
      const node = (
        <div
          className="apply-success-overlay"
          onClick={(e) => e.target === e.currentTarget && runSuccessClose()}
          onKeyDown={(e) => e.key === 'Escape' && runSuccessClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-success-title"
        >
          <div className="apply-success-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 id="apply-success-title" className="apply-success-title">
              Application submitted successfully
            </h3>
            <p className="apply-success-text">
              Thank you for applying. We&apos;ll be in touch.
            </p>
            <button
              type="button"
              className="apply-success-ok"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                runSuccessClose()
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                runSuccessClose()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  runSuccessClose()
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )
      return typeof document !== 'undefined' && document.body
        ? createPortal(node, document.body)
        : node
    })()

  if (typeof document !== 'undefined' && document.body) {
    return (
      <>
        {createPortal(modalContent, document.body)}
        {successOverlay}
      </>
    )
  }
  return (
    <>
      {modalContent}
      {successOverlay}
    </>
  )
}

export default ApplyJobModal
