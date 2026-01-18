/// <reference types="vite/client" />

// Get the API URL from environment variables
// Falls back to Render backend for production, localhost:8000 for development
const API_BASE = import.meta.env.VITE_API_URL || "https://thatfridayfeeling.onrender.com";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// These describe the shape of data returned from the API

export interface ApprovalDecision {
  id: number;
  decision: "APPROVE" | "REJECT";
  decided_by: string;
  decided_at: string;
  reason?: string;
  note?: string;
}

export interface Artifact {
  id: number;
  project: number;
  name: string;
  artifact_type: string;
  created_at: string;
}

export interface ArtifactVersion {
  id: number;
  artifact: number;
  version_number: number;
  url: string;
  status: "AWAITING_APPROVAL" | "APPROVED" | "REJECTED";
  submitted_by: string;
  created_at: string;
  decision: ApprovalDecision | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
// These functions call the backend API and return data

/**
 * Create a new artifact
 *
 * Called when an agency wants to create a new artifact for submission.
 */
export async function createArtifact(
  name: string,
  artifactType: string = ""
): Promise<Artifact> {
  const res = await fetch(`${API_BASE}/api/artifacts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      artifact_type: artifactType,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.log("Full error response:", errorData);
    const errorMessage = errorData.detail || JSON.stringify(errorData) || "Failed to create artifact";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Create a new artifact version
 *
 * Called when an agency submits a version for approval.
 * The backend auto-assigns the version_number.
 */

export async function createArtifactVersion(
  artifactId: number,
  url: string,
  submittedBy: string
): Promise<ArtifactVersion> {
  const res = await fetch(`${API_BASE}/api/artifact-versions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artifact: artifactId,
      url,
      submitted_by: submittedBy,
    }),
  });

  // If the response it not 201 Created, throw an error
  if (!res.ok) {
    const errorData = await res.json();
    console.log("Full error response:", errorData);  // Log everything for debugging
    const errorMessage = errorData.detail || JSON.stringify(errorData) || "Failed to create version";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Get a specific artifact version
 * 
 * Called when viewing a version before approving/rejecting.
 * Returns the version details + decision (if made).
 */
export async function getArtifactVersion(versionId: number): Promise<ArtifactVersion> {
  const url = `${API_BASE}/api/artifact-versions/${versionId}/`
  console.log('Fetching version from:', url)
  
  const res = await fetch(url, {
    method: 'GET',
  })

  console.log('Response status:', res.status)
  
  if (!res.ok) {
    const errorText = await res.text()
    console.log('Error response:', errorText)
    throw new Error('Version not found')
  }

  const data = await res.json()
  console.log('Fetched version:', data)
  return data
}

/**
 * List all artifact versions
 * 
 * Called to show all versions awaiting approval.
 * Optionally filter by status: 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED'
 */
export async function listArtifactVersions(status?: string): Promise<ArtifactVersion[]> {
  const url = new URL(`${API_BASE}/api/artifact-versions/`)
  if (status) {
    url.searchParams.append('status', status)
  }
  
  const res = await fetch(url.toString(), {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error('Failed to fetch versions')
  }

  return res.json()
}

/**
 * Approve a version
 * 
 * Called when client clicks "Approve".
 * Returns 409 Conflict if already decided.
 */

export async function approveVersion(
    versionId: number,
    decidedBy: string,
): Promise<ArtifactVersion> {
    const res = await fetch(
        `${API_BASE}/api/artifact-versions/${versionId}/approve/`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                decided_by: decidedBy,
            }),
        }
    )

    if (!res.ok) {
        const errorData = await res.json()
        // Check for 409 (finality violation)
        if (res.status === 409) {
            throw new Error('This version has already been decided')
        }
        throw new Error(errorData.detail || 'Failed to approve version')
    }
    return res.json()
}

/**
 * Reject a version
 * 
 * Called when client clicks "Reject".
 * Requires a reason for rejection.
 * Returns 409 Conflict if already decided.
 */

export async function rejectVersion(
    versionId: number,
    decidedBy: string,
    reason: string,
    note?: string,
): Promise<ArtifactVersion> {
    const res = await fetch(
        `${API_BASE}/api/artifact-versions/${versionId}/reject/`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                decided_by: decidedBy,
                reason,
                note,
            }),
        }   
    )

    if (!res.ok) {
        const errorData = await res.json()
        // Check for 409 (finality violation)
        if (res.status === 409) {
            throw new Error('This version has already been decided')
        }
        throw new Error(errorData.detail || 'Failed to reject version')
    }
    return res.json()
}