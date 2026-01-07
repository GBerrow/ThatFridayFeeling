# ThatFridayFeeling

ThatFridayFeeling is a multi-tenant project management and client approval platform designed for digital agencies. It helps agencies manage projects, share deliverables with clients, collect structured feedback and capture formal approvals, all with a clear audit trail.

**Ship work faster. Get approvals without the chaos.**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Core Workflow](#core-workflow)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Security & Data Isolation](#security--data-isolation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Demo](#demo)

---

## Project Overview

Digital agencies often manage client communication, feedback, and approvals across email, Slack, and project boards. This leads to lost feedback, unclear approval states, and disputes over what was approved and when.

ThatFridayFeeling provides agencies with a centralized platform for managing client-facing deliverables, collecting structured feedback, and recording formal approvals in a controlled and auditable workflow.

This project is an independent full-stack SaaS application built with a React frontend and a Django REST API backend.

## Problem Statement

Agencies commonly struggle with:

- Fragmented client feedback across multiple tools
- Unclear approval states and version confusion
- Lack of accountability around who approved deliverables
- Poor separation between internal agency work and client-facing views

Traditional task management tools focus on internal collaboration but do not provide a structured client approval process.

## Solution

ThatFridayFeeling introduces a workflow-driven approval system that separates internal project management from client-facing review and sign-off.

Key design principles:

- Clear project and deliverable ownership
- Role-based access for agency staff and clients
- Enforced approval workflows
- Immutable audit logs for accountability
- Multi-tenant architecture to support multiple agencies

## Key Features

- Multi-tenant organizations (agencies)
- Project and deliverable management
- Deliverable versioning
- Client comments and structured feedback
- Approval and change-request workflow
- Role-based access control (RBAC)
- Audit log for key actions
- REST API with documented endpoints
- Responsive React frontend

## User Roles

- **Agency Owner** – manages organization, users, and projects
- **Agency Staff** – manages projects and deliverables
- **Client User** – reviews deliverables and submits approvals or feedback

Permissions are enforced at both the organization and object level.

## Core Workflow

1. Agency creates a project for a client
2. Deliverables are uploaded and versioned
3. Deliverable is submitted for client review
4. Client provides comments or requests changes
5. Client approves the deliverable
6. Approved versions are locked and recorded in the audit log

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS

**Backend**

- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery

**Tooling & Infrastructure**

- Docker & Docker Compose
- GitHub Actions (CI)
- Playwright (E2E testing)
- pytest (backend testing)

## Architecture Overview

The application follows a decoupled architecture:

- A React SPA consumes a REST API
- Django REST Framework handles business logic and permissions
- PostgreSQL stores tenant-isolated data
- Redis and Celery manage background tasks such as notifications
- Docker provides a consistent local development environment

## Security & Data Isolation

- Each organizations data is logically isolated via tenant-aware queries
- Role-based permissions control access to projects and deliverables
- Sensitive operations are protected with authentication and authorization checks
- Environment variables are used for all secrets and credentials

## Testing

- Unit and integration tests using `pytest`
- API tests for core workflows
- End-to-end tests using Playwright
- Automated tests run via GitHub Actions on pull requests

## Deployment

- Backend and frontend are containerized using Docker
- Deployed using a cloud platform (e.g. Render or Railway)
- PostgreSQL managed database
- CI pipeline ensures tests pass before deployment

## Future Enhancements

- Real-time notifications
- Advanced reporting and analytics
- File previews and annotation tools
- Client-facing public project links
- Subscription billing for agencies

## Demo

Demo credentials and a live deployment link will be provided once the core MVP is complete.

---