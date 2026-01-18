import { useState } from "react";
import "../App.css";
import { createArtifact, createArtifactVersion } from "../api/client";

export function SubmitArtifactPage() {
  const [artifactName, setArtifactName] = useState("");
  const [artifactType, setArtifactType] = useState("");
  const [url, setUrl] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Create artifact
      const artifact = await createArtifact(artifactName, artifactType);
      console.log("Artifact created:", artifact);

      // Step 2: Submit version for the newly created artifact
      const result = await createArtifactVersion(artifact.id, url, submittedBy);
      console.log("Version submitted:", result);

      setSuccess(true);
      setSuccessMessage(
        `✅ Artifact "${artifactName}" created! Version ${result.version_number} submitted. ` +
          `👉 <a href="/approve/${result.id}" style="color: inherit; text-decoration: underline;">Review & Approve →</a>`
      );

      // Clear form
      setArtifactName("");
      setArtifactType("");
      setUrl("");
      setSubmittedBy("");
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2>Submit for approval</h2>
          <p className="subtle">Creates an artifact and submits version 1 (or next).</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="stack">
          {error && (
            <div className="alert alertError">
              <strong>❌ Error</strong>
              <div style={{ marginTop: 6 }}>{error}</div>
            </div>
          )}
          {success && (
            <div
              className="alert alertSuccess"
              dangerouslySetInnerHTML={{ __html: successMessage }}
            />
          )}

          <div className="field">
            <label>Artifact Name</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Q1 Marketing Campaign"
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="field">
            <label>Artifact Type (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., PDF, Design, Document"
              value={artifactType}
              onChange={(e) => setArtifactType(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="field">
            <label>Version URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://example.com/artifact.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="field">
            <label>Submitted By</label>
            <input
              className="input"
              type="text"
              placeholder="your@email.com"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn btnPrimary" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Create Artifact & Submit Version"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
