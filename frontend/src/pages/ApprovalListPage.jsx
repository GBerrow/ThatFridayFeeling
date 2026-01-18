import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listArtifactVersions } from '../api/client'
import '../App.css'

export function ApprovalListPage() {
  const navigate = useNavigate()
  const [allVersions, setAllVersions] = useState([])
  const [versions, setVersions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('AWAITING_APPROVAL')

  const applyFilter = (items, status) => {
    if (!status) return items
    return items.filter(v => v.status === status)
  }

  useEffect(() => {
    let isMounted = true
    const fetchVersions = async () => {
      try {
        const data = await listArtifactVersions()
        if (isMounted) {
          setAllVersions(data)
          setVersions(applyFilter(data, filter))
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchVersions()
    const intervalId = setInterval(fetchVersions, 4000)
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [filter])

  const handleViewDecision = (versionId) => {
    navigate(`/approve/${versionId}`)
  }

  const pendingCount = allVersions.filter(v => v.status === 'AWAITING_APPROVAL').length
  const approvedCount = allVersions.filter(v => v.status === 'APPROVED').length
  const rejectedCount = allVersions.filter(v => v.status === 'REJECTED').length

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2>Approvals dashboard</h2>
          <p className="subtle">Live view of pending versions and decision history.</p>
        </div>
      </div>

      <div className="card stack">
        <div className="kpi">
          <span className="pill pillPending">⏳ {pendingCount} Awaiting</span>
          <span className="pill pillApproved">✅ {approvedCount} Approved</span>
          <span className="pill pillRejected">❌ {rejectedCount} Rejected</span>
        </div>

        <div className="row">
          <button className={`btn ${filter === 'AWAITING_APPROVAL' ? 'btnPrimary' : ''}`} onClick={() => setFilter('AWAITING_APPROVAL')}>
            ⏳ Awaiting Approval ({pendingCount})
          </button>
          <button className={`btn ${filter === 'APPROVED' ? 'btnPrimary' : ''}`} onClick={() => setFilter('APPROVED')}>
            ✅ Approved ({approvedCount})
          </button>
          <button className={`btn ${filter === 'REJECTED' ? 'btnPrimary' : ''}`} onClick={() => setFilter('REJECTED')}>
            ❌ Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="subtle">Loading versions...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="alert alertError">
            <strong>Failed to fetch versions</strong>
            <div style={{ marginTop: 6 }}>{error}</div>
          </div>
        </div>
      )}

      {!isLoading && !error && versions.length === 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="subtle">No versions to display for this filter.</p>
        </div>
      )}

      {!isLoading && !error && versions.length > 0 && (
        <div className="grid" style={{ marginTop: 14 }}>
          {versions.map((version) => (
            <div className="item" key={version.id}>
              <div className="itemHeader">
                <div className="stack" style={{ gap: 10 }}>
                  <div className="kpi">
                    <span className="pill">Version ID: <span className="mono">{version.id}</span> (v{version.version_number})</span>
                    <span className={`pill ${version.status === 'APPROVED' ? 'pillApproved' : version.status === 'REJECTED' ? 'pillRejected' : 'pillPending'}`}>
                      {version.status}
                    </span>
                  </div>

                  <div className="row" style={{ gap: 12 }}>
                    <span className="subtle">URL:</span>
                    <a href={version.url} target="_blank" rel="noopener noreferrer">{version.url}</a>
                  </div>

                  <div className="row" style={{ gap: 12 }}>
                    <span className="subtle">Submitted by:</span>
                    <span className="mono">{version.submitted_by}</span>
                    <span className="subtle">·</span>
                    <span className="subtle">{new Date(version.created_at).toLocaleString()}</span>
                  </div>

                  {version.decision && (
                    <div className="alert alertInfo">
                      <strong>Decision:</strong> <span className="mono">{version.decision.decision}</span>
                      <div style={{ marginTop: 6 }}>
                        Decided by <span className="mono">{version.decision.decided_by}</span> · {new Date(version.decision.decided_at).toLocaleString()}
                      </div>
                      {version.decision.reason && (
                        <div style={{ marginTop: 6 }}>
                          <span className="subtle">Reason:</span> {version.decision.reason}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {version.status === 'AWAITING_APPROVAL' && (
                  <button className="btn btnPrimary" onClick={() => handleViewDecision(version.id)}>
                    Review & Decide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
