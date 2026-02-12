import { useEffect, useState } from 'react'
import { X, Briefcase, FileText, User, Calendar, Mail, Download, Check } from 'lucide-react'

export type ApplicationStatus = 'Pending' | 'Reviewed' | 'Interviewing' | 'Accepted' | 'Rejected'

const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected']

export interface ApplicationDetail {
  id: string
  applicantName: string
  email: string
  role: string
  company: string
  dateApplied: string
  status: ApplicationStatus
  motivation?: string
  attachmentUrl?: string
  attachmentName?: string
  phone?: string
  address?: string
  educationStatus?: string
}

interface ApplicationDetailModalProps {
  application: ApplicationDetail | null
  onClose: () => void
  onMarkReviewed?: (applicationId: string) => void | Promise<void>
  markingReviewed?: boolean
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void | Promise<void>
  updatingStatus?: boolean
  statusError?: string | null
  onClearError?: () => void
  /** When provided, used for Download so auth (e.g. Bearer) can be sent. Otherwise plain link. */
  onDownloadResume?: (url: string, filename: string) => void | Promise<void>
}

export default function ApplicationDetailModal({
  application,
  onClose,
  onMarkReviewed,
  markingReviewed = false,
  onStatusChange,
  updatingStatus = false,
  statusError = null,
  onClearError,
  onDownloadResume,
}: ApplicationDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(application?.status ?? 'Pending')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (application) setSelectedStatus(application.status)
  }, [application?.id, application?.status])

  if (!application) return null

  const displayId = application.id.length > 12 ? `APP-${application.id.slice(-6)}` : application.id
  const hasResume = Boolean(application.attachmentUrl)
  const resumeLabel = application.attachmentName || 'Resume.pdf'
  const busy = markingReviewed || updatingStatus

  return (
    <div
      className="app-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-detail-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="app-detail-modal">
        <div className="app-detail-header">
          <div className="app-detail-title-row">
            <div>
              <h2 id="app-detail-title" className="app-detail-title">Application Details</h2>
              <p className="app-detail-id">ID: {displayId}</p>
            </div>
          </div>
          <button
            type="button"
            className="app-detail-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="app-detail-body">
          {/* Current Status */}
          <section className="app-detail-section">
            <h3 className="app-detail-section-title">
              <User size={18} aria-hidden />
              Current Status
            </h3>
            <div className="app-detail-section-box">
              <div className="app-detail-status-row">
                <span className={`admin-status-pill admin-status-pill--${application.status.toLowerCase()}`}>
                  {application.status}
                </span>
                <div className="app-detail-applied-on">
                  <Calendar size={16} aria-hidden />
                  <span>Applied On</span>
                  <span className="app-detail-date">{application.dateApplied}</span>
                </div>
              </div>
              {onStatusChange && (
                <div className="app-detail-next-step">
                  <span className="app-detail-next-step-label">Next step</span>
                  <div className="app-detail-next-step-row">
                    <select
                      className="app-detail-status-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                      aria-label="Change application status"
                      disabled={busy}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="app-detail-btn app-detail-btn--primary app-detail-btn--small"
                      onClick={() => onStatusChange(application.id, selectedStatus)}
                      disabled={busy || selectedStatus === application.status}
                    >
                      {updatingStatus ? 'Updating…' : 'Update status'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Applicant Information */}
          <section className="app-detail-section">
            <h3 className="app-detail-section-title">
              <User size={18} aria-hidden />
              Applicant Information
            </h3>
            <div className="app-detail-cards">
              <div className="app-detail-card">
                <span className="app-detail-label">FULL NAME</span>
                <span className="app-detail-value">{application.applicantName}</span>
              </div>
              <div className="app-detail-card">
                <span className="app-detail-label">EMAIL ADDRESS</span>
                <span className="app-detail-value app-detail-value-with-icon">
                  <Mail size={16} aria-hidden />
                  {application.email}
                </span>
              </div>
            </div>
            {(application.phone || application.address || application.educationStatus) && (
              <div className="app-detail-section-box app-detail-section-box--extra">
                <div className="app-detail-grid">
                  {application.phone && (
                    <div className="app-detail-field">
                      <span className="app-detail-label">PHONE</span>
                      <span className="app-detail-value">{application.phone}</span>
                    </div>
                  )}
                  {application.address && (
                    <div className="app-detail-field app-detail-field--full">
                      <span className="app-detail-label">ADDRESS</span>
                      <span className="app-detail-value">{application.address}</span>
                    </div>
                  )}
                  {application.educationStatus && (
                    <div className="app-detail-field">
                      <span className="app-detail-label">EDUCATION</span>
                      <span className="app-detail-value">{application.educationStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Position Details */}
          <section className="app-detail-section">
            <h3 className="app-detail-section-title">
              <Briefcase size={18} aria-hidden />
              Position Details
            </h3>
            <div className="app-detail-cards">
              <div className="app-detail-card">
                <span className="app-detail-label">ROLE</span>
                <span className="app-detail-value app-detail-value-with-icon">
                  <Briefcase size={16} aria-hidden />
                  {application.role}
                </span>
              </div>
              <div className="app-detail-card">
                <span className="app-detail-label">COMPANY</span>
                <span className="app-detail-value">
                  <FileText size={16} aria-hidden />
                  {application.company}
                </span>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="app-detail-section">
            <h3 className="app-detail-section-title">
              <FileText size={18} aria-hidden />
              Documents
            </h3>
            <div className="app-detail-docs">
              <div className="app-detail-resume-row">
                <div className="app-detail-resume-info">
                  <FileText size={20} className="app-detail-resume-icon" aria-hidden />
                  <div>
                    <span className="app-detail-resume-name">{resumeLabel}</span>
                    <span className="app-detail-resume-type">PDF Document</span>
                  </div>
                </div>
                {hasResume ? (
                  onDownloadResume ? (
                    <button
                      type="button"
                      className="app-detail-download-btn"
                      onClick={() => {
                        setDownloading(true)
                        Promise.resolve(onDownloadResume(application.attachmentUrl!, resumeLabel))
                          .finally(() => setDownloading(false))
                      }}
                      disabled={downloading}
                    >
                      <Download size={18} aria-hidden />
                      {downloading ? 'Downloading…' : 'Download'}
                    </button>
                  ) : (
                    <a
                      href={application.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-detail-download-btn"
                      download={resumeLabel}
                    >
                      <Download size={18} aria-hidden />
                      Download
                    </a>
                  )
                ) : (
                  <span className="app-detail-download-btn app-detail-download-btn--disabled">
                    <Download size={18} aria-hidden />
                    No file
                  </span>
                )}
              </div>
              <div className="app-detail-cover">
                <span className="app-detail-label">COVER LETTER</span>
                <div className="app-detail-cover-text">
                  {application.motivation || '—'}
                </div>
              </div>
            </div>
          </section>
        </div>

        {statusError && (
          <div className="app-detail-error-wrap">
            <p className="app-detail-error" role="alert">
              {statusError}
            </p>
            {onClearError && (
              <button type="button" className="app-detail-btn app-detail-btn--secondary app-detail-btn--small" onClick={onClearError}>
                Try again
              </button>
            )}
          </div>
        )}

        <div className="app-detail-footer">
          <button type="button" className="app-detail-btn app-detail-btn--secondary" onClick={onClose}>
            Close
          </button>
          {onMarkReviewed && (
            <button
              type="button"
              className="app-detail-btn app-detail-btn--primary"
              onClick={() => onMarkReviewed(application.id)}
              disabled={busy}
              aria-label={markingReviewed ? 'Updating status' : 'Mark application as reviewed'}
            >
              <Check size={18} aria-hidden />
              {markingReviewed ? 'Updating…' : 'Mark as Reviewed'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
