# Test Journey (Changelog)

## 2026-01-09 — Initial automated suite
**Goal:** Lock the approval boundary invariants so behaviour can’t regress.

**Added:**
- Model tests for core entities (Project, Artifact, ArtifactVersion, ApprovalDecision)
- API tests for create/retrieve/version not found
- Approval finality tests (409 on second/conflicting decision)
- Integration flows: submit → approve/reject → verify finality

**Invariants protected:**
- One decision per version (immutable)
- Conflicting decisions blocked (409)

**Notes:**
- decided_by is required for approve/reject in MVP (auth later)

**Guide:** [docs/test/testing-guide.md](docs/test/testing-guide.md) — how the test process is run.

**Results:** [docs/test/test-results.md](docs/test/test-results.md) — current suite status and coverage.

**Test file:** [backend/artifacts/tests.py](backend/artifacts/tests.py) — the automated tests.

---

*Last Updated: January 9, 2026*
