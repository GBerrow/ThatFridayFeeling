/// <reference types="vite/client" />

// Get the API URL from environment variables
// Falls back to localhost:8000 if not set (for safe development)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      // version_number is auto-assigned by backend, so don't include it
    }),
  });

  // If the response it not 201 Created, throw an error
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to create version");
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
  const res = await fetch(`${API_BASE}/api/artifact-versions/${versionId}/`, {
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error('Version not found')
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