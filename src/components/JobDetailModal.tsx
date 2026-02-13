import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { RoleDetail } from '../api/types'

export type { RoleDetail } from '../api/types'

interface JobDetailModalProps {
  role: RoleDetail
  onClose: () => void
  onNext?: (role: RoleDetail) => void
}

const DEFAULT_DESCRIPTION =
  'This role is responsible for driving key outcomes and collaborating with teams. You will work closely with senior management to set goals, make key decisions, and ensure the company\'s vision and objectives are achieved efficiently and ethically.'

const DEFAULT_REQUIREMENTS = [
  'Proven experience in a relevant role',
  'Strong strategic planning and execution skills',
  'Ability to work effectively in a remote or hybrid environment',
  'Excellent communication and problem-solving abilities',
  'Proficiency in digital collaboration tools',
]

const DEFAULT_QUALIFICATIONS_INTRO = 'Individuals seeking growth and hands-on experience.'
const DEFAULT_QUALIFICATIONS = [
  'Undergraduate or postgraduate students',
  'Graduates of recognized institutions',
  'NYSC members or recent NYSC graduates',
  'Others with relevant interest or experience',
]

const JobDetailModal = ({ role, onClose, onNext }: JobDetailModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  const description = role.description ?? DEFAULT_DESCRIPTION
  const requirements = role.requirements ?? DEFAULT_REQUIREMENTS
  const qualificationsIntro = role.qualificationsIntro ?? DEFAULT_QUALIFICATIONS_INTRO
  const qualifications = role.qualifications ?? DEFAULT_QUALIFICATIONS
  const duration = role.jobType
  const applicationDeadline = role.applicationDeadline ?? `${role.deadline}, 2026`

  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    return () => {
      previousActiveRef.current?.focus()
    }
  }, [])

  const handleClose = () => {
    previousActiveRef.current?.focus()
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const modalContent = (
    <div className="job-detail-overlay job-detail-overlay--portal" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
      <div className="job-detail-dialog" onClick={(e) => e.stopPropagation()}>
        <button ref={closeButtonRef} type="button" className="job-detail-close" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="job-detail-content">
          <div className="job-detail-section">
            <h2 id="job-detail-title" className="job-detail-heading">Job Title</h2>
            <div className="job-detail-field">{role.title}</div>
          </div>

          <div className="job-detail-section">
            <h2 className="job-detail-heading">Job Description</h2>
            <div className="job-detail-box">
              <p className="job-detail-text">{description}</p>
            </div>
          </div>

          <div className="job-detail-section">
            <h2 className="job-detail-heading">Job Requirement</h2>
            <div className="job-detail-box">
              <ul className="job-detail-list">
                {requirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="job-detail-section">
            <h2 className="job-detail-heading">Job Qualifications</h2>
            <div className="job-detail-box">
              <p className="job-detail-text">{qualificationsIntro}</p>
              <ul className="job-detail-list">
                {qualifications.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="job-detail-row">
            <div className="job-detail-section">
              <h2 className="job-detail-heading">Job Duration</h2>
              <div className="job-detail-field">{duration}</div>
            </div>
            <div className="job-detail-section">
              <h2 className="job-detail-heading">Application deadline</h2>
              <div className="job-detail-field">{applicationDeadline}</div>
            </div>
          </div>

          <div className="job-detail-footer">
            <button
              type="button"
              className="job-detail-next"
              onClick={() => (onNext ? onNext(role) : handleClose())}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}

export default JobDetailModal
