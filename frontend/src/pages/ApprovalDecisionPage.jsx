import '../App.css'
import { useParams } from 'react-router-dom'
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
        const data = await getArtifactVersion(parseInt(versionId))
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
      await approveVersion(parseInt(versionId), email)
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
      await rejectVersion(parseInt(versionId), email, reason)
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
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {version && (
        <div>
          <h2>Artifact Version Details</h2>
          <p>ID: {version.id}</p>
          <p>Status: {version.status}</p>
          <p>URL: {version.url}</p>
          <p>Submitted By: {version.submitted_by}</p>

          {isAlreadyDecided ? (
            <div style={{ color: 'red' }}>
              <p><strong>This version has already been decided.</strong></p>
              <p>Decision: {version.decision.decision}</p>
              <p>Decided by: {version.decision.decided_by}</p>
            </div>
          ) : (
            <form>
              {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
              {success && <p style={{ color: 'green' }}>Decision submitted successfully!</p>}

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />

              <textarea
                placeholder="Reason (required for rejection)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />

              <button onClick={handleApprove} disabled={isSubmitting || !email}>
                {isSubmitting ? 'Submitting...' : 'Approve'}
              </button>
              <button onClick={handleReject} disabled={isSubmitting || !email || !reason}>
                {isSubmitting ? 'Submitting...' : 'Reject'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}