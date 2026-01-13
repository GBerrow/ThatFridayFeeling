import '../App.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getArtifactVersion } from '../api/client'

export function ApprovalDecisionPage() {
  const { versionId } = useParams()
  const [version, setVersion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {version && (
        <div>
          <h2>Artifact Version Details</h2>
          <p>ID: {version.id}</p>
          <p>Status: {version.status}</p>
          <p>URL: {version.url}</p>
          <p>Submitted By: {version.submitted_by}</p>
    </div>
  ) }
    </div>
  )
}