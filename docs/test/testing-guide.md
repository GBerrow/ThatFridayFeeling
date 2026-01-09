# Testing Guide - ThatFridayFeeling MVP

Quick reference for running and understanding the test suite.

---

## Running Tests

### Run All Tests
```bash
cd backend
python manage.py test
```

### Run Artifacts App Tests Only
```bash
python manage.py test artifacts
```

### Run with Verbose Output
```bash
python manage.py test artifacts -v 2
```

### Run Specific Test Class
```bash
# Model tests
python manage.py test artifacts.tests.ProjectModelTest
python manage.py test artifacts.tests.ArtifactModelTest
python manage.py test artifacts.tests.ArtifactVersionModelTest
python manage.py test artifacts.tests.ApprovalDecisionModelTest

# API tests
python manage.py test artifacts.tests.ArtifactVersionAPITest
python manage.py test artifacts.tests.ApprovalBoundaryAPITest

# Integration tests
python manage.py test artifacts.tests.ApprovalWorkflowIntegrationTest
```

### Run Single Test
```bash
python manage.py test artifacts.tests.ApprovalBoundaryAPITest.test_finality_prevents_duplicate_approval
```

---

## Manual API Testing

You can also test the API manually using curl, HTTPie, or tools like Postman/Insomnia.

### 1. Start the Development Server
```bash
cd backend
python manage.py runserver
```

### 2. Create Test Data via Django Admin
Visit http://localhost:8000/admin/

Create:
- A Project (e.g., "Test Project")
- An Artifact under that project (e.g., "Homepage Design")

### 3. Test the API Endpoints

#### Submit a New Version
```bash
curl -X POST http://localhost:8000/api/artifact-versions/ \
  -H "Content-Type: application/json" \
  -d '{
    "artifact": 1,
    "version_number": 1,
    "url": "https://figma.com/test",
    "submitted_by": "designer@agency.com"
  }'
```

#### Retrieve a Version
```bash
curl http://localhost:8000/api/artifact-versions/1/
```

#### Approve a Version
```bash
curl -X POST http://localhost:8000/api/artifact-versions/1/approve/ \
  -H "Content-Type: application/json" \
  -d '{
    "decided_by": "client@example.com",
    "note": "Looks great!"
  }'
```

#### Reject a Version
```bash
curl -X POST http://localhost:8000/api/artifact-versions/1/reject/ \
  -H "Content-Type: application/json" \
  -d '{
    "decided_by": "client@example.com",
    "reason": "Needs changes",
    "note": "Please update the colors"
  }'
```

#### Test Finality (Should Return 409 Conflict)
```bash
# Try to approve again after already approving
curl -X POST http://localhost:8000/api/artifact-versions/1/approve/ \
  -H "Content-Type: application/json" \
  -d '{"decided_by": "someone@example.com"}'
```

Expected response:
```json
{
  "detail": "A decision already exists for this version."
}
```
HTTP Status: **409 Conflict**

---

## Understanding Test Results

### ✅ All Tests Pass
```
Ran 23 tests in 0.141s
OK
```
This means:
- All 23 test cases executed successfully
- No failures or errors
- The approval boundary is working as designed

### ❌ Test Failure Example
```
FAIL: test_finality_prevents_duplicate_approval
AssertionError: 200 != 409
```
This would indicate:
- The finality constraint is not being enforced
- A duplicate approval was allowed (should be blocked)
- Need to check the approval logic in views.py

### ⚠️ Test Error Example
```
ERROR: test_approve_version
AttributeError: 'NoneType' object has no attribute 'id'
```
This would indicate:
- A code error (not a logical failure)
- Possibly a missing object or incorrect setup
- Need to check the test setup or view implementation

---

## Test Categories Explained

### 1. Model Tests
Test Django models directly (no API involved).

**What they test:**
- Object creation
- Field validation
- Model constraints (unique_together)
- String representations
- Relationships (ForeignKey, OneToOneField)

**Example:**
```python
def test_artifact_version_unique_constraint(self):
    """Test that duplicate version numbers are prevented."""
    # Should succeed
    ArtifactVersion.objects.create(
        artifact=self.artifact,
        version_number=1,
        url="https://example.com/v1"
    )
    
    # Should fail with IntegrityError
    with self.assertRaises(Exception):
        ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,  # Duplicate!
            url="https://example.com/v1-dup"
        )
```

### 2. API Endpoint Tests
Test REST API endpoints using DRF's APITestCase.

**What they test:**
- HTTP methods (GET, POST)
- Status codes (200, 201, 400, 404, 409)
- Request/response data format
- Error handling

**Example:**
```python
def test_create_artifact_version(self):
    """Test POST /api/artifact-versions/"""
    response = self.client.post(url, data, format='json')
    
    self.assertEqual(response.status_code, 201)  # Created
    self.assertEqual(response.data['status'], 'AWAITING_APPROVAL')
```

### 3. Approval Boundary Tests
Test the **core MVP hypothesis**: finality enforcement.

**What they test:**
- Approval and rejection actions
- HTTP 409 Conflict when finality is violated
- Decision immutability
- The "single decision per version" rule

**Example:**
```python
def test_finality_prevents_duplicate_approval(self):
    """CORE MVP TEST: Cannot approve twice."""
    # First approval - should succeed
    response1 = self.client.post(approve_url, data)
    self.assertEqual(response1.status_code, 200)
    
    # Second approval - should fail with 409
    response2 = self.client.post(approve_url, data)
    self.assertEqual(response2.status_code, 409)  # Conflict!
```

### 4. Integration Tests
Test complete workflows from start to finish.

**What they test:**
- Multi-step processes
- Data persistence across requests
- Realistic user journeys
- End-to-end validation

**Example:**
```python
def test_complete_approval_workflow(self):
    """Test: Agency submits → Client approves → Decision recorded"""
    # Step 1: Submit version
    create_response = self.client.post(...)
    version_id = create_response.data['id']
    
    # Step 2: Approve version
    approve_response = self.client.post(...)
    self.assertEqual(approve_response.data['status'], 'APPROVED')
    
    # Step 3: Verify finality
    reject_response = self.client.post(...)  # Try to reject
    self.assertEqual(reject_response.status_code, 409)  # Blocked!
```

---

## Common Testing Patterns

### Testing for Success
```python
response = self.client.post(url, data)
self.assertEqual(response.status_code, 200)
self.assertEqual(response.data['status'], 'APPROVED')
```

### Testing for Validation Errors (400)
```python
response = self.client.post(url, {})  # Missing required fields
self.assertEqual(response.status_code, 400)
self.assertIn('decided_by', response.data['detail'].lower())
```

### Testing for Not Found (404)
```python
response = self.client.get('/api/artifact-versions/99999/')
self.assertEqual(response.status_code, 404)
```

### Testing for Conflict (409) - THE KEY MVP TEST
```python
# First action succeeds
response1 = self.client.post(approve_url, data)
self.assertEqual(response1.status_code, 200)

# Second action fails (finality enforced)
response2 = self.client.post(approve_url, data)
self.assertEqual(response2.status_code, 409)
self.assertIn('already exists', response2.data['detail'].lower())
```

---

## Adding New Tests

When adding new features, write tests following this pattern:

1. **Create a new test method** in the appropriate test class
2. **Use descriptive names** starting with `test_`
3. **Add a docstring** explaining what you're testing
4. **Arrange**: Set up test data
5. **Act**: Execute the action
6. **Assert**: Verify the outcome

```python
def test_your_new_feature(self):
    """Test that your new feature works correctly."""
    # Arrange
    project = Project.objects.create(name="Test")
    
    # Act
    response = self.client.post('/api/your-endpoint/', {...})
    
    # Assert
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.data['field'], 'expected_value')
```

---

## Test Database

Django automatically creates and destroys a test database for each test run.

**Important:**
- Tests use an **in-memory SQLite database** (fast, isolated)
- Tests **do not affect** your development database
- Each test class gets a fresh database
- You can see the database creation/migration output in verbose mode

---

## Debugging Failed Tests

### 1. Run the specific failing test
```bash
python manage.py test artifacts.tests.YourTestClass.test_your_method -v 2
```

### 2. Add print statements or use pdb
```python
def test_something(self):
    response = self.client.post(...)
    print(response.data)  # Debug output
    import pdb; pdb.set_trace()  # Debugger breakpoint
    self.assertEqual(...)
```

### 3. Check the actual response
```python
self.assertEqual(response.status_code, 200, 
                 f"Got {response.status_code}: {response.data}")
```

### 4. Verify your test data setup
```python
def setUp(self):
    print(f"Created project: {self.project.id}")  # Verify setup
    super().setUp()
```

---

## Coverage Analysis (Optional)

To see which code lines are covered by tests:

```bash
pip install coverage
coverage run --source='.' manage.py test artifacts
coverage report
coverage html
```

Open `htmlcov/index.html` in your browser to see detailed coverage.

---

## Continuous Integration (Future)

When you set up GitHub Actions, tests will run automatically on every:
- Push to main
- Pull request
- Before deployment

Example `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          python manage.py test
```

---

## Summary

✅ **23 tests validate the approval boundary MVP**  
✅ **All tests passing = core hypothesis validated**  
✅ **Finality enforcement working correctly (HTTP 409)**  
✅ **Complete workflows tested end-to-end**

Run tests frequently during development to catch regressions early.
