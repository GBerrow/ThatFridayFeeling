# Test Journey (Changelog)

## 2026-01-14 — Frontend Tests + GitHub Actions CI ✅
**Goal:** Add automated testing to frontend and set up CI/CD pipeline for regression protection.

**Added:**
- React component tests (Vitest + React Testing Library)
  - SubmitArtifactPage: form inputs, submit button
  - ApprovalDecisionPage: email input, component rendering
- GitHub Actions CI workflow
  - Frontend tests run on every push/PR
  - Backend tests run on every push/PR
  - Both jobs run in parallel
- Test helper function for reusable component test patterns

**Configuration:**
- Vitest v4.0.17 with happy-dom environment
- Tests auto-discover from `src/test/*.test.jsx`
- npm test scripts for local development

**Results:**
- ✅ 4 frontend tests passing
- ✅ 23 backend tests passing (from Jan 9)
- ✅ CI pipeline fully operational

**Guide:** [docs/test/testing-guide.md](docs/test/testing-guide.md) — updated with frontend testing section.

**CI Workflow:** [.github/workflows/test.yml](.github/workflows/test.yml) — automated testing on push/PR

---

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
