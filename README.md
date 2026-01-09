# ThatFridayFeeling

ThatFridayFeeling is an opinionated approval‑boundary MVP for digital agencies that enforces clear, unambiguous client sign‑off on versioned work.

Instead of facilitating ongoing discussion or collaboration, it introduces a hard approval boundary where a specific version of work must be explicitly approved or rejected, with a permanent audit record.

**Ship work faster. Get approvals without the chaos.**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Product Hypothesis](#product-hypothesis)
- [Problem Statement](#problem-statement)
- [Design Principles](#design-principles)
- [MVP Scope](#mvp-scope)
- [MVP Approval Boundary](#mvp-approval-boundary)
- [Approval Boundary API (MVP)](#approval-boundary-api-mvp)
- [Anti‑Features](#anti-features)
- [Intentionally Deferred Features](#intentionally-deferred-features)
- [What This Is Not](#what-this-is-not)
- [User Roles](#user-roles)
- [Core Workflow](#core-workflow)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Architecture Overview](#architecture-overview)
- [Security & Data Isolation](#security--data-isolation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Demo](#demo)

---

## Project Overview

Digital agencies often manage client communication, feedback, and approvals across email, Slack, and project boards. This leads to lost feedback, unclear approval states, and disputes over what was approved and when.

ThatFridayFeeling provides agencies with a centralized platform for managing client‑facing deliverables, collecting structured feedback, and recording formal approvals in a controlled and auditable workflow.

This project is an independent full‑stack SaaS application built with a React frontend and a Django REST API backend.

---

## Product Hypothesis

This project is built around a single hypothesis:

> **Treating client approval as a hard, enforced decision, rather than an informal conversation, eliminates ambiguity and reduces disputes in agency workflows.**

ThatFridayFeeling deliberately removes flexibility at the approval stage in order to test whether clarity and finality outperform general‑purpose collaboration tools.

---

## Problem Statement

Despite the availability of modern project management tools, agencies still rely on email, PDFs, and message threads to obtain final client sign‑off.

This is because most tools treat approval as an informal outcome of discussion rather than a first‑class, enforceable action. As a result:

- **"Approved" is implied rather than explicit**
- **Feedback is disconnected from specific versions**
- **Finality is unclear**
- **Accountability is lost**

---

## Design Principles

ThatFridayFeeling is intentionally opinionated and constrained.

Core design principles:

- **Approval is binary** – a version is either approved or rejected
- **Approval is explicit** – approval requires a deliberate user action
- **Versions are immutable** – approved work cannot be edited
- **Finality is enforced** – approval locks the workflow
- **Every decision is attributable** – who approved what, and when, is always recorded

---

## MVP Scope

The MVP intentionally supports only the following capabilities:

- **Versioned submissions via URL** – a link to work (e.g. Figma, staging site, PDF) is submitted for approval
- **Explicit submission for approval**
- **Binary client decision** – approve or reject
- **Structured rejection reasons** (non‑conversational)
- **Immutable approval records with timestamps**
- **Enforced finality at the approval boundary** – once a decision is made, further changes are blocked
- **Auditable decision history per version**

Multi‑tenancy, file uploads and role‑based access are intentionally deferred beyond the MVP.

---

## MVP Approval Boundary

The MVP is centred around a single, explicit approval boundary.

This boundary represents the moment where flexibility is intentionally removed and a final decision is enforced.

The approval boundary is validated through three core screens:

### 1. Agency – Submit Artifact Version

[View wireframe → Agency – Submit Artifact Version](<docs/wireframes/MVP_Wireframes/Agency – Submit Artifact Version.png>)

The agency submits a specific, immutable version of work for approval via a URL.

This screen establishes:

- Clear project and artifact context
- Explicit versioning
- Ownership of submission
- A single action to request approval

**Once submitted, the version is locked and cannot be altered.**

### 2. Client – Approval Decision

[View Wireframe → Client – Approval Decision](<docs/wireframes/MVP_Wireframes/Client – Approval Decision.png>)

The client is presented with one clear question:

**"Do you approve this version for sign‑off?"**

The client must choose one of two irreversible actions:

- **Approve**
- **Reject**

Approval requires deliberate confirmation and cannot be implied or inferred.

### 3. Audit – Decision Record

[Wireframe → Audit – Decision Record](<docs/wireframes/MVP_Wireframes/Audit – Decision Record.png>)

Once a decision is made, the system creates a permanent audit record.

This screen:

- Confirms the outcome (approved or rejected)
- Records who made the decision and when
- Prevents any further modification
- Exposes only outcome‑appropriate actions

This record replaces informal approval via email or messages.

**Once a decision is recorded, the system enforces finality by rejecting any subsequent approval or rejection attempts.**

---

## Approval Boundary API (MVP)

The MVP exposes a minimal API focused exclusively on enforcing the approval boundary.

### Endpoints

- `POST /api/artifact-versions/` – Submit a new immutable version for approval.
- `GET /api/artifact-versions/{id}/` – Retrieve a version and its decision (if made).
- `POST /api/artifact-versions/{id}/approve/` – Approve the specified version.
- `POST /api/artifact-versions/{id}/reject/` – Reject the specified version with a structured reason.

### Finality Rules

- Each `ArtifactVersion` may have exactly **one decision**.
- Decisions are **immutable** once recorded.
- Any subsequent approve/reject attempt returns **HTTP 409 Conflict**.
- Approving after a rejection and rejecting after an approval are both **blocked**.

---

## Anti‑Features

### Intentional Omissions

ThatFridayFeeling deliberately does **not** support:

- Chat or threaded discussion
- Free‑form comments
- Task management
- Custom workflow states
- Soft or implied approvals
- Parallel version editing
- Real‑time collaboration

These omissions are intentional. The goal of the MVP is to enforce clarity and finality at the approval stage, not to replace general collaboration tools.

---

## Intentionally Deferred Features

The following features are explicitly deferred beyond the MVP to maintain a focused scope:

- File uploads and storage
- Real‑time chat or threaded discussion
- Multi‑tenant organisation support
- Role‑based permissions and access control
- Task management or custom workflow states
- Parallel version editing or live collaboration
- Notifications and reporting

These may be considered in future phases but are outside the current MVP.

---

## What This Is Not

This project is **not** a task manager, collaboration suite, or replacement for tools like ClickUp or Monday.com.

It is designed to **complement** existing tools by formalizing the approval moment they handle poorly.

---

## User Roles

> **Note:** User roles and permissions are part of the broader product vision but are not yet implemented in the MVP. Planned roles include:

- **Agency Owner** – manages organization, users, and projects
- **Agency Staff** – manages projects and deliverables
- **Client User** – reviews deliverables and submits approvals or feedback

Permissions will be enforced at both the organization and object level in future phases.

---

## Core Workflow

### Agency

1. Submit a link to a specific version of work
2. Mark the version as "Ready for Approval"
3. The system locks the version

### Client

4. Views a single, clearly identified version
5. Must explicitly choose:
   - **Approve**
   - **Reject** (with a structured reason)

### System

6. Records the decision with timestamp and approver
7. Locks the outcome permanently

---

## Tech Stack

### Current (MVP Implementation)

**Backend**

- Django
- Django REST Framework
- SQLite (development)
- Django Admin

**Frontend**

- Not yet implemented (planned React SPA)

### Planned / Post‑MVP

**Frontend**

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS

**Backend**

- PostgreSQL
- Redis
- Celery

**Tooling & Infrastructure**

- Docker & Docker Compose
- GitHub Actions (CI)
- Playwright (E2E testing)
- pytest (backend testing)

---

## Local Development

### Backend

To run the backend locally:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API root is available at `http://localhost:8000/api/` and the admin interface at `http://localhost:8000/admin/`.

### Frontend

Planned for post‑MVP; not yet implemented.

---

## Architecture Overview

> **Note:** The following describes the intended post‑MVP architecture. The MVP currently implements only the backend API; the React SPA and infrastructure described here are planned for future phases.

The application follows a decoupled architecture:

- A React SPA consumes a REST API
- Django REST Framework handles business logic and permissions
- PostgreSQL stores tenant‑isolated data
- Redis and Celery manage background tasks such as notifications
- Docker provides a consistent local development environment

---

## Security & Data Isolation

> **Note:** Multi‑tenant data isolation and role‑based permissions are planned for future phases. The MVP uses a single tenant and minimal authentication.

- Each organisation's data is logically isolated via tenant‑aware queries
- Role‑based permissions control access to projects and deliverables
- Sensitive operations are protected with authentication and authorization checks
- Environment variables are used for all secrets and credentials

---

## Testing

> **Note:** Automated tests will be added in subsequent phases; the MVP currently includes only minimal manual verification.

- Unit and integration tests using `pytest`
- API tests for core workflows
- End‑to‑end tests using Playwright
- Automated tests run via GitHub Actions on pull requests

---

## Deployment

> **Note:** Deployment details are planned for future phases. The MVP runs locally using the Django development server.

- Backend and frontend are containerised using Docker
- Deployed using a cloud platform (e.g. Render or Railway)
- PostgreSQL managed database
- CI pipeline ensures tests pass before deployment

---

## Future Enhancements

- Invite‑by‑email onboarding
- Notifications for pending approvals
- Basic reporting (approval turnaround time)
- Public share links for approvals
- Optional "discussion layer" as a separate mode (kept out of MVP)

---

## Demo

Demo credentials and a live deployment link will be provided once the core MVP is complete.

---
