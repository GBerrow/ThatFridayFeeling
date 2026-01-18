# ThatFridayFeeling

## 🚀 Live Demo

The MVP is now deployed and fully functional!

**[→ Try the Live Frontend](https://thatfridayfeeling-frontend.onrender.com)**

See the 2-minute demo walkthrough below to understand the approval boundary in action.


![ThatFridayFeeling](assets/images/banner.png)

---

ThatFridayFeeling is an opinionated approval‑boundary MVP designed specifically for digital agencies and their clients. It replaces ad-hoc approvals scattered across emails, PDF's, chat threads and project boards with a single, enforceable sign-off moment.

Instead of facilitating ongoing discussion or collaboration, it introduces a hard approval boundary where a specific version of work must be explicitly approved or rejected, with a permanent audit record. This deliberate constraint eliminates ambiguity and ensures everyone knows exactly what was approved, when, and by whom.

Instead of facilitating ongoing discussion or collaboration, it introduces a hard approval boundary where a specific version of work must be explicitly approved or rejected, with a permanent audit record.

**Ship work faster. Get approvals without the chaos.**

---

## Table of Contents

- [ThatFridayFeeling](#thatfridayfeeling)
  - [🚀 Live Demo](#-live-demo)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Problem Statement](#problem-statement)
  - [Audience \& Pain Points](#audience--pain-points)
    - [Who This Is For](#who-this-is-for)
    - [What Pain They Feel](#what-pain-they-feel)
    - [Why Existing Tools Fail Them](#why-existing-tools-fail-them)
    - [How This Project Solves It - Deliberately](#how-this-project-solves-it---deliberately)
    - [Product Hypothesis](#product-hypothesis)
  - [Design Principles](#design-principles)
  - [MVP Scope](#mvp-scope)
  - [MVP Approval Boundary](#mvp-approval-boundary)
    - [1. Agency – Submit Artifact Version](#1-agency--submit-artifact-version)
    - [2. Client – Approval Decision](#2-client--approval-decision)
    - [3. Audit – Decision Record](#3-audit--decision-record)
  - [Approval Boundary API (MVP)](#approval-boundary-api-mvp)
    - [Endpoints](#endpoints)
    - [Finality Rules](#finality-rules)
  - [Anti‑Features](#antifeatures)
    - [Intentional Omissions](#intentional-omissions)
  - [Intentionally Deferred Features](#intentionally-deferred-features)
  - [What This Is Not](#what-this-is-not)
  - [User Roles](#user-roles)
  - [Core Workflow](#core-workflow)
    - [Agency](#agency)
    - [Client](#client)
    - [System](#system)
  - [Tech Stack](#tech-stack)
    - [Current (MVP Implementation)](#current-mvp-implementation)
      - [Backend](#backend)
      - [Frontend](#frontend)
    - [Planned / Post‑MVP](#planned--postmvp)
      - [Frontend](#frontend-1)
      - [Backend](#backend-1)
      - [Tooling \& Infrastructure](#tooling--infrastructure)
  - [Local Development](#local-development)
    - [Getting Started (Quick Setup)](#getting-started-quick-setup)
      - [Prerequisites](#prerequisites)
      - [Backend Setup (5 minutes)](#backend-setup-5-minutes)
      - [Frontend Setup (5 minutes)](#frontend-setup-5-minutes)
      - [Verify Everything Works](#verify-everything-works)
    - [Demo Walkthrough](#demo-walkthrough)
      - [Step 1: Submit an Artifact Version (Agency)](#step-1-submit-an-artifact-version-agency)
      - [Step 2: Approve the Version (Client)](#step-2-approve-the-version-client)
      - [Step 3: Verify in Approvals Dashboard](#step-3-verify-in-approvals-dashboard)
      - [Step 4: Test Finality (Try to Approve Again)](#step-4-test-finality-try-to-approve-again)
      - [Optional: Test Rejection](#optional-test-rejection)
  - [Architecture Overview](#architecture-overview)
  - [Security \& Data Isolation](#security--data-isolation)
  - [Testing](#testing)
    - [Testing Documentation](#testing-documentation)
    - [Testing Workflow](#testing-workflow)
    - [Planned / Future Testing](#planned--future-testing)
  - [Deployment](#deployment)
    - [✅ Current Deployment (v0.1.0)](#-current-deployment-v010)
    - [Deployment Architecture](#deployment-architecture)
  - [Future Enhancements](#future-enhancements)
  - [Demo](#demo)

--- 

## Project Overview 

Digital agencies often manage client communication, feedback, and approvals across email, Slack, and project boards. This leads to lost feedback, unclear approval states, and disputes over what was approved and when.

ThatFridayFeeling provides agencies with a centralized platform for managing client‑facing deliverables, collecting structured feedback, and recording formal approvals in a controlled and auditable workflow.

This project is an independent full‑stack SaaS application built with a React frontend and a Django REST API backend.

---

## Problem Statement

Despite the availability of modern project management tools, agencies still rely on email, PDFs, and message threads to obtain final client sign‑off.

This is because most tools treat approval as an informal outcome of discussion rather than a first‑class, enforceable action. As a result:

- **"Approved" is implied rather than explicit**
- **Feedback is disconnected from specific versions**
- **Finality is unclear**
- **Accountability is lost**

---

## Audience & Pain Points

### Who This Is For 

- **Digital agencies** - Web, design, branding, marketing and product agencies must obtain clear client sign-off before shipping, billing or launching work.

- **Account managers and project leads** - Professionals responsible for delivering work and tracking approvals across multiple clients and projects

- **Clients and stakeholders** - decision-makers who need to review and approve deliverables with confidence that they're looking at the exact version that will be final.

### What Pain They Feel

Digital agencies often juggle approvals across fragmented channels, email threads, PDF attachments, chat messages, comments on project boards and more. This leads to:

- Uncertainty over which version was approved and when.
- Feedback and approvals that are lost or disconnected from specific versions.
- Disputes about whether approval was actually given or what changes were requested.
- Delays to shipping, billing, or launching due to slow or unclear sign-off processes.

### Why Existing Tools Fail Them

Most project management and collaboration tools treat approval as an informal by-product of discussion. A "Looks good!" comment in Slack or an "Approved" email might be interpreted as sign-off, but there's no enforced, verifiable decision. These tools are optimized for conversation, not for capturing a definitive sign-off. They lack:

- **Verison locking** - Ensuring everyone is reviewing the exact same variable.
- **Madatory decisions** - Forcing an explicit approve or reject action. Rather than implying approval in a comment. 
- **Immutable audit trails** -  Recording who approved what, when and why in a permanent record.

As a result, approvals become ambiguous, leading to confusion, delays and disputes. **Accountability is lost**.

### How This Project Solves It - Deliberately

ThatFridayFeeling fills this gap by introducing a **hard approval boundary:**

- Agencies submit a specific record version for approval
- Clients must explicitly **approve** or **reject**. there is no way to imply or infer approval through comments or messages.
- The system records the decision with a timestamp and approver identity. Creating a permanent, auditable record.
- Once a decision is made, the outcome is final; any further attempts to approve or reject are blocked.

### Product Hypothesis

By enforcing this boundary, **ThatFridayFeeling** brings clarity, reduces disputes and allows teams to move forward faster with confidence. It complements existing PM and collaboration tools by formalizing the approval moment they handle poorly in comparison.

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

1. Views a single, clearly identified version
2. Must explicitly choose:
   - **Approve**
   - **Reject** (with a structured reason)

### System

1. Records the decision with timestamp and approver
2. Locks the outcome permanently

---

## Tech Stack

### Current (MVP Implementation)

#### Backend

- Django
- Django REST Framework
- SQLite (development)
- Django Admin

#### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS (dark mode)
- Deployed on Render

### Planned / Post‑MVP

#### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS

#### Backend

- PostgreSQL
- Redis
- Celery

#### Tooling & Infrastructure

- Docker & Docker Compose
- GitHub Actions (CI)
- Playwright (E2E testing)
- pytest (backend testing)

---

## Local Development

### Getting Started (Quick Setup)

#### Prerequisites

- **Python 3.13+** (backend)
- **Node.js 18+** and npm (frontend)
- **Git**

#### Backend Setup (5 minutes)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Create a superuser (optional, for Django admin)
python manage.py createsuperuser

# 6. Start the development server
python manage.py runserver
```

Backend is now running at **http://localhost:8000**

**To access Django admin:** http://localhost:8000/admin/

#### Frontend Setup (5 minutes)

```bash
# 1. Navigate to frontend directory (from project root)
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Frontend is now running at **http://localhost:5173**

#### Verify Everything Works

1. Open http://localhost:5173 in your browser
2. You should see the ThatFridayFeeling home page with dark blue background
3. Click "Submit" → try creating an artifact and submitting a version
4. If successful, backend and frontend are communicating ✅

---

### Demo Walkthrough

**Time:** ~2 minutes  
**What it shows:** Full end-to-end approval workflow

#### Step 1: Submit an Artifact Version (Agency)

1. Go to http://localhost:5173/submit
2. Fill in the form:
   - **Artifact Name:** `Q1 Marketing Campaign`
   - **Artifact Type:** `Design` (optional)
   - **Version URL:** `https://example.com/campaign.pdf`
   - **Submitted By:** `agency@example.com`
3. Click **"Create Artifact & Submit Version"**
4. See success message with link to approval page ✅

#### Step 2: Approve the Version (Client)

1. Click the link in the success message (or manually navigate to the approval page)
2. You should see:
   - Version ID and status
   - The submitted URL
   - Submission details
3. Fill in:
   - **Your email:** `client@example.com`
4. Click **"Approve"**
5. See confirmation: "Decision submitted successfully!" ✅

#### Step 3: Verify in Approvals Dashboard

1. Click **"Approvals"** in the top navigation
2. You should see:
   - **0 Awaiting** | **1 Approved** | **0 Rejected**
   - The version you just approved listed under "Approved (1)"
   - Decision details showing who approved it and when

#### Step 4: Test Finality (Try to Approve Again)

1. Click **"Review & Decide"** on the same version
2. Try clicking **"Approve"** again
3. You should see an error: **"This version has already been decided"** ✅
   - This proves the system enforces finality

#### Optional: Test Rejection

1. Go back to Submit page
2. Create another artifact (e.g., `Q2 Campaign`)
3. On the approval page, fill in:
   - **Your email:** `client@example.com`
   - **Reason:** `Colors don't match brand guidelines`
4. Click **"Reject"**
5. See it appear in the Approvals dashboard under **"Rejected (1)"**

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

### Testing Documentation

The MVP includes an automated backend test suite focused on enforcing the approval boundary invariant.  
Detailed coverage and execution results are documented separately to avoid duplication in this README.

- **[Test Journey](docs/test/test-journey.md)** – Chronological log of what was tested, when, and why. Each entry captures the testing goal, what behaviour was protected, and links to detailed results.

- **[Test Results](docs/test/test-results.md)** – Snapshot of the current test suite, including coverage areas and key invariants proven.

- **[Testing Guide](docs/test/testing-guide.md)** – How to run tests locally and understand test conventions used in the project.

### Testing Workflow

1. Implement or modify backend behaviour
2. Add or update automated tests to protect the relevant invariant
3. Run the full test suite locally
4. Update **test-journey.md** when new behaviour or invariants are introduced
5. Update **test-results.md** only when test scope or coverage meaningfully changes

### Planned / Future Testing

The following testing areas are intentionally deferred until the relevant features exist:

- End-to-end tests using Playwright (frontend not yet implemented)
- CI-based test execution via GitHub Actions
- Performance and load testing
- Authentication and permission tests
- Multi-tenant data isolation tests

---

## Deployment

### ✅ Current Deployment (v0.1.0)

**Frontend Static Site:** Render  
**Backend Web Service:** Render  
**Database:** Render PostgreSQL (Free tier)  

**Live URLs:**
- Frontend: https://thatfridayfeeling-frontend.onrender.com
- Backend API: https://thatfridayfeeling.onrender.com/api/

### Deployment Architecture

- **Frontend:** Static site build with `npm run build` → Vite output to `dist/`
- **Backend:** Gunicorn WSGI server with Django migrations on startup
- **Database:** PostgreSQL 16 on Render (1 GB free tier)
- **Auto-Deploy:** Enabled on commits to `main` branch

---

## Future Enhancements

- Invite‑by‑email onboarding
- Notifications for pending approvals
- Basic reporting (approval turnaround time)
- Public share links for approvals
- Optional "discussion layer" as a separate mode (kept out of MVP)

---

## Demo

**The MVP is live!** Visit **[ThatFridayFeeling Frontend](https://thatfridayfeeling-frontend.onrender.com)** to try the 2-minute demo walkthrough above.

No credentials needed — create a test approval and see finality enforcement in action.

---
