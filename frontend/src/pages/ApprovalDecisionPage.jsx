import '../App.css'
import { NavLink, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getArtifactVersion, approveVersion, rejectVersion } from '../api/client'

export function ApprovalDecisionPage() {
  const { versionId } = useParams()
  const [version, setVersion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form states
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const id = Number.parseInt(versionId, 10)
        if (Number.isNaN(id)) {
          setError('Missing or invalid version id')
          return
        }

        const data = await getArtifactVersion(id)
        setVersion(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersion()
  }, [versionId])

  const handleApprove = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const updated = await approveVersion(parseInt(versionId), email)
      // Update local version state so UI reflects decision immediately
      setVersion(updated)
      setSuccess(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const updated = await rejectVersion(parseInt(versionId), email, reason)
      // Update local version state so UI reflects decision immediately
      setVersion(updated)
      setSuccess(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if already decided
  const isAlreadyDecided = version && version.decision !== null

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2>Review & decide</h2>
          <p className="subtle">Approve or reject this submitted version.</p>
        </div>
        <div className="row">
          <NavLink to="/approvals" className="btn">← Back</NavLink>
        </div>
      </div>

      {isLoading && (
        <div className="card">
          <p className="subtle">Loading...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="card">
          <div className="alert alertError">
            <strong>Version not found</strong>
            <div style={{ marginTop: 6 }}>Unable to find version ID: <span className="mono">{versionId}</span></div>
            <div className="actions" style={{ marginTop: 12 }}>
              <NavLink to="/submit" className="btn btnPrimary">Create & submit →</NavLink>
              <NavLink to="/approvals" className="btn">Go to approvals</NavLink>
            </div>
          </div>
        </div>
      )}

      {version && (
        <div className="card stack">
          <div className="kpi">
            <span className="pill">Version ID: <span className="mono">{version.id}</span></span>
            <span className={`pill ${version.status === 'APPROVED' ? 'pillApproved' : version.status === 'REJECTED' ? 'pillRejected' : 'pillPending'}`}>
              {version.status}
            </span>
          </div>

          <div className="stack">
            <div className="row">
              <span className="subtle">URL:</span>
              <a href={version.url} target="_blank" rel="noopener noreferrer">{version.url}</a>
            </div>
            <div className="row">
              <span className="subtle">Submitted by:</span>
              <span className="mono">{version.submitted_by}</span>
            </div>
          </div>

          {isAlreadyDecided ? (
            <div className="alert alertInfo">
              <strong>This version has already been decided.</strong>
              <div style={{ marginTop: 6 }}>
                Decision: <span className="mono">{version.decision.decision}</span> · Decided by: <span className="mono">{version.decision.decided_by}</span>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <NavLink to="/approvals" className="btn">Back to approvals list →</NavLink>
              </div>
            </div>
          ) : (
            <form className="stack">
              {submitError && (
                <div className="alert alertError">
                  <strong>Could not submit decision</strong>
                  <div style={{ marginTop: 6 }}>{submitError}</div>
                </div>
              )}
              {success && (
                <div className="alert alertSuccess">
                  Decision submitted successfully!
                </div>
              )}

              <div className="field">
                <label>Your email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="field">
                <label>Reason (required for rejection)</label>
                <textarea
                  className="input textarea"
                  placeholder="Explain why this version is being rejected..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="actions">
                <button className="btn btnPrimary" onClick={handleApprove} disabled={isSubmitting || !email}>
                  {isSubmitting ? 'Submitting...' : 'Approve'}
                </button>
                <button className="btn btnDanger" onClick={handleReject} disabled={isSubmitting || !email || !reason}>
                  {isSubmitting ? 'Submitting...' : 'Reject'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}