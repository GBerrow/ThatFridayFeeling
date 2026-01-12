# Developer Guide — ThatFridayFeeling

This guide is intended for developers who want to understand ThatFridayFeeling. It explains setup, architecture, and key design decisions.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Architecture](#project-architecture)
- [Key Decisions & Quirks](#key-decisions--quirks)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+ and npm
- Git

### Backend Setup

1. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser (for admin access)**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```
   
   Backend is now available at `http://localhost:8000`
   Admin interface at `http://localhost:8000/admin/`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local` from example**
   ```bash
   cp .env.example .env.local
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Frontend is now available at `http://localhost:5173`

### Verify Everything Works

1. Open `http://localhost:8000/api/` in your browser — you should see the API root
2. Open `http://localhost:5173/` in your browser — you should see the React app
3. Check browser console for errors (there shouldn't be any CORS errors)

---

## Project Architecture

### Current Backend Structure

```
backend/
├── thatfridayfeeling/        # Project settings
│   ├── settings.py           # Django configuration (CORS, installed apps, etc.)
│   ├── urls.py               # Root URL routing
│   ├── wsgi.py               # Production entry point
│   └── asgi.py               # ASGI entry point
│
├── artifacts/                # Core MVP app
│   ├── models.py             # Project, Artifact, ArtifactVersion models
│   ├── views.py              # REST API endpoints
│   ├── serializers.py        # Data serialization (request/response)
│   ├── urls.py               # API routes (/api/artifact-versions/, etc.)
│   ├── tests.py              # Test suite (23 tests validating finality)
│   └── migrations/           # Database schema changes
│
├── approvals/                # Approval decisions
│   ├── models.py             # ApprovalDecision model
│   └── migrations/
│
├── manage.py                 # Django management command entry point
├── requirements.txt          # Python dependencies
└── db.sqlite3                # Development database
```

### Current Frontend Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts         # TypeScript API client (typed functions for backend calls)
│   │
│   ├── pages/                # Full-page components (created during week 1)
│   │   ├── SubmitVersion.tsx     # Agency submits version for approval
│   │   └── ApprovalDecision.tsx  # Client approves/rejects version
│   │
│   ├── components/           # Reusable UI components (to be created)
│   │
│   ├── App.jsx               # Main app component and routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── .env.example              # Environment template (VITE_API_URL)
├── .env.local                # Local environment (git-ignored)
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── index.html                # HTML entry point
```

### How They Communicate

```
Frontend (React/TypeScript)
    ↓
API Client (src/api/client.ts)
    ↓
fetch() with typed requests/responses
    ↓
Django REST API (backend/artifacts/views.py)
    ↓
Database (SQLite in dev)
```

**Key Point:** The API client (`client.ts`) is typed. When you call `approveVersion()`, TypeScript knows exactly what shape the response will have. This prevents bugs.

---

## Key Decisions & Quirks

### 1. Why TypeScript?

TypeScript catches errors **before you run the code**. When the frontend calls the backend API, TypeScript ensures:

- You're passing the right data types (number vs string)
- The API response matches what you expect
- You're not typo'ing field names

Example:
```typescript
// TypeScript knows version.status can ONLY be these 3 values
if (version.status === 'AWAITING_APPROVAL') {
  // Safe: TypeScript enforces this
}

if (version.status === 'PENDING') {
  // ❌ TypeScript error: 'PENDING' is not valid!
}
```

### 2. Why CORS Configuration?

CORS (Cross-Origin Resource Sharing) is a browser security feature. Without it:

- Frontend at `localhost:5173` can't call backend at `localhost:8000`
- You'd get "blocked by CORS" errors in the console

**Solution:** `settings.py` tells Django to allow `localhost:5173`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
```

### 3. Why `version_number` is Auto-Assigned

In the backend, `ArtifactVersion` auto-assigns `version_number`:

```python
# Backend (models.py)
class ArtifactVersion(models.Model):
    artifact = ForeignKey(Artifact, ...)
    version_number = AutoField()  # Database handles this
    url = URLField()
```

**Why?** Prevents client mistakes:
- Client doesn't have to think about version numbers
- Backend guarantees they're sequential (1, 2, 3, ...)
- Eliminates bugs from duplicates or gaps

**For the frontend:** Don't include `version_number` when creating a version. It comes back in the response.

```typescript
// ✅ Correct: version_number is omitted
await createArtifactVersion(artifactId, url, submittedBy)

// ❌ Wrong: don't add version_number yourself
await createArtifactVersion(artifactId, url, submittedBy, 5)
```

### 4. Why `decided_by` is an Email String

In the MVP, there's no authentication yet. So `decided_by` is just an email string:

```typescript
// Frontend: user enters their email
const email = "client@example.com"
await approveVersion(versionId, email)
```

**Important:** This is temporary. Post-MVP, we'll use real authentication (OAuth, JWT, etc.). But for now, it's simple and works.

### 5. Why HTTP 409 Conflict on Duplicate Decisions

The core MVP rule: **One decision per version. Period.**

If someone tries to approve/reject twice:
```
POST /api/artifact-versions/1/approve/ → 200 OK (first time) ✅
POST /api/artifact-versions/1/approve/ → 409 Conflict (second time) ❌
```

**In the frontend:** Show an error: "This version has already been decided."

The backend enforces this in the view:
```python
if decision_exists:
    return Response(
        {"detail": "A decision already exists for this version."},
        status=status.HTTP_409_CONFLICT
    )
```

---

## Development Workflow

### Running Tests

The backend test suite validates the approval boundary hypothesis (23 tests, all passing).

```bash
cd backend

# Run all tests
python manage.py test

# Run with verbose output (recommended)
python manage.py test artifacts -v 2

# Run a specific test class
python manage.py test artifacts.tests.ApprovalBoundaryAPITest

# Run a specific test
python manage.py test artifacts.tests.ApprovalBoundaryAPITest.test_finality_prevents_duplicate_approval
```

See [docs/test/testing-guide.md](docs/test/testing-guide.md) for detailed info.

### Creating Test Data

Use Django Admin to create test data:

1. Start the backend: `python manage.py runserver`
2. Go to `http://localhost:8000/admin/`
3. Log in with your superuser credentials
4. Create a **Project** (e.g., "Acme Corp Rebrand")
5. Create an **Artifact** under that project (e.g., "Homepage Design")
6. Now you can test API endpoints with real data

### Testing API Endpoints Manually

```bash
# Get all versions
curl http://localhost:8000/api/artifact-versions/

# Create a version (requires project + artifact IDs from admin)
curl -X POST http://localhost:8000/api/artifact-versions/ \
  -H "Content-Type: application/json" \
  -d '{
    "artifact": 1,
    "url": "https://figma.com/design/abc123",
    "submitted_by": "jane@agency.com"
  }'

# Approve a version
curl -X POST http://localhost:8000/api/artifact-versions/1/approve/ \
  -H "Content-Type: application/json" \
  -d '{"decided_by": "client@example.com"}'

# Try approving again (should get 409)
curl -X POST http://localhost:8000/api/artifact-versions/1/approve/ \
  -H "Content-Type: application/json" \
  -d '{"decided_by": "client@example.com"}'
# Response: 409 Conflict with "already exists" message
```

### Commit Conventions

Use conventional commits for clarity:

```bash
# Feature (new page, new API integration)
git commit -m "feat: add approval decision page"

# Fix (bug fix)
git commit -m "fix: handle 409 conflict in UI"

# Documentation
git commit -m "docs: update DEVELOPER.md with setup steps"

# Tests
git commit -m "test: add component tests for submit form"

# Chores (dependencies, config)
git commit -m "chore: upgrade React to 19"
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Define the model** (if needed) in `backend/artifacts/models.py`
2. **Create a serializer** in `backend/artifacts/serializers.py`
3. **Add a view** in `backend/artifacts/views.py` (use `APIView` or `ViewSet`)
4. **Route it** in `backend/artifacts/urls.py`
5. **Test it** in `backend/artifacts/tests.py`
6. **Update the frontend API client** in `frontend/src/api/client.ts`

### Adding a New React Component

1. Create file: `frontend/src/components/MyComponent.tsx`
2. Export it: `export function MyComponent() { ... }`
3. Import in your page: `import { MyComponent } from '@/components/MyComponent'`
4. Use it: `<MyComponent />`

### Adding a New Page

1. Create file: `frontend/src/pages/MyPage.tsx`
2. Define routing in `frontend/src/App.jsx`
3. Add navigation links in your layout

### Debugging CORS Issues

If you see `blocked by CORS` in the browser console:

1. **Check backend is running:** `python manage.py runserver`
2. **Check CORS config:** Is `localhost:5173` in `CORS_ALLOWED_ORIGINS`?
3. **Check `.env.local`:** Does `VITE_API_URL=http://localhost:8000` exist?
4. **Restart frontend:** Kill `npm run dev` and restart it

### Checking API Response Format

When testing in the browser console:

```javascript
// Fetch a version to see its shape
fetch('http://localhost:8000/api/artifact-versions/1/')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
```

This helps you verify the response matches your TypeScript types.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```
VITE_API_URL=http://localhost:8000
```

This tells the frontend where the backend API lives.

**Note:** `.env.local` is git-ignored (don't commit it). `.env.example` shows the template.

### Backend (`backend/settings.py`)

Key settings related to the MVP:

```python
# CORS configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend dev server
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # Dev only
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'rest_framework'"

**Cause:** Django REST Framework not installed.

**Fix:**
```bash
cd backend
pip install -r requirements.txt
```

Verify it's installed:
```bash
python -c "import rest_framework; print(rest_framework.VERSION)"
```

### "CORS policy: blocked by CORS policy"

**Cause:** Frontend origin not allowed in Django.

**Fix:**
1. Check `backend/thatfridayfeeling/settings.py`
2. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
3. Restart Django: `python manage.py runserver`

### Frontend can't reach backend API

**Check:**
1. Is the backend running? `python manage.py runserver`
2. Is `.env.local` correct? `VITE_API_URL=http://localhost:8000`
3. Are you on the right ports? Backend: 8000, Frontend: 5173
4. No typos in the API URL in `.env.local`

### Tests failing with database errors

**Cause:** Migrations not applied.

**Fix:**
```bash
python manage.py migrate
python manage.py test
```

### "version 'react' not found" or similar npm errors

**Cause:** Frontend dependencies not installed.

**Fix:**
```bash
cd frontend
npm install
npm run dev
```

### Need to reset the database

```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## Next Steps

- **Week 1 / Tuesday:** Build the React pages (Submit Version, Approval Decision)
- **Week 1 / Wednesday:** Add component tests and GitHub Actions CI
- **Week 1 / Thursday:** Polish UI and tag v0.1.0

For more details, see [README.md](README.md).

---

**Questions?** Check the relevant section in this guide, or trace through the code starting with `frontend/src/api/client.ts` (frontend) or `backend/artifacts/views.py` (backend).
