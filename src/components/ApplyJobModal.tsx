import { useState, useCallback } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'

const EDUCATION_OPTIONS = ['Student', 'Graduate', 'NYSC', 'Unemployed', 'Others']

const WORKING_DAYS = [
  'Mondays: 10am - 5pm',
  'Wednesday: 10am - 5pm',
  'Friday: 10am - 4pm',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-+()]{10,}$/

interface ApplyJobModalProps {
  jobTitle: string
  onClose: () => void
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

const ApplyJobModal = ({ jobTitle, onClose }: ApplyJobModalProps) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [education, setEducation] = useState<string[]>([])
  const [role, setRole] = useState('')
  const [motivation, setMotivation] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isValid) return
    // TODO: submit to API
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const showError = (field: keyof FormErrors) =>
    (touched[field] || submitAttempted) && errors[field]

  return (
    <div
      className="job-detail-overlay apply-job-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-job-title"
    >
      <div className="apply-job-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="job-detail-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 id="apply-job-title" className="apply-job-title">
          Apply Job - {jobTitle}
        </h2>

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
            <h3 className="apply-job-heading">Attachment</h3>
            <label className="apply-job-upload">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="apply-job-upload-input"
              />
              <Upload size={32} className="apply-job-upload-icon" aria-hidden />
              <span className="apply-job-upload-text">
                {file ? file.name : 'Upload File'}
              </span>
            </label>
          </div>

          <div className="apply-job-remote-badge">
            <AlertCircle size={18} aria-hidden />
            <span>Work is remotely</span>
          </div>

          <div className="apply-job-footer">
            <button type="submit" className="apply-job-submit">
              Submit Application
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div
          className="apply-success-overlay"
          onClick={(e) => e.target === e.currentTarget && handleSuccessClose()}
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
            <button type="button" className="apply-success-ok" onClick={handleSuccessClose}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplyJobModal
