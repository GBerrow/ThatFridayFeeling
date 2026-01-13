import { useState } from "react";
import "../App.css";
import { createArtifactVersion } from "../api/client";

export function SubmitArtifactPage() {
  const [artifactId, setArtifactId] = useState("");
  const [url, setUrl] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await createArtifactVersion(
        parseInt(artifactId),
        url,
        submittedBy
      );
      console.log("Success:", result);
      setSuccess(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Submitted successfully!</p>}

      <input
        type="text"
        placeholder="Artifact ID"
        value={artifactId}
        onChange={(e) => setArtifactId(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="text"
        placeholder="Submitted By"
        value={submittedBy}
        onChange={(e) => setSubmittedBy(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
