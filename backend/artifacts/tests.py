"""
Test suite for the Approval Boundary MVP.

This test suite validates the core MVP hypothesis:
- Enforcing finality at the approval boundary
- Preventing duplicate/conflicting decisions
- Ensuring clear, unambiguous approval or rejection
"""
from django.test import TestCases
from rest_framework.test import APITestCase
from rest_framework import status

from artifacts.models import Project, Artifact, ArtifactVersion
from approvals.models import ApprovalDecision


class ProjectModelTest(TestCase):
    """Test the Project model."""

    def test_project_creation(self):
        """Test that a project can be created with a name."""
        project = Project.objects.create(name="Acme Corp Rebrand")
        self.assertEqual(project.name, "Acme Corp Rebrand")
        self.assertIsNotNone(project.created_at)
        self.assertIsNotNone(project.updated_at)

    def test_project_str_representation(self):
        """Test the string representation of a project."""
        project = Project.objects.create(name="Test Project")
        self.assertEqual(str(project), "Test Project")


class ArtifactModelTest(TestCase):
    """Test the Artifact model."""

    def setUp(self):
        self.project = Project.objects.create(name="Test Project")

    def test_artifact_creation(self):
        """Test that an artifact can be created under a project."""
        artifact = Artifact.objects.create(
            project=self.project,
            name="Homepage Design",
            artifact_type="Design"
        )
        self.assertEqual(artifact.name, "Homepage Design")
        self.assertEqual(artifact.project, self.project)
        self.assertEqual(artifact.artifact_type, "Design")

    def test_artifact_str_representation(self):
        """Test the string representation of an artifact."""
        artifact = Artifact.objects.create(
            project=self.project,
            name="Logo Concept"
        )
        self.assertEqual(str(artifact), "Test Project: Logo Concept")


class ArtifactVersionModelTest(TestCase):
    """Test the ArtifactVersion model."""

    def setUp(self):
        self.project = Project.objects.create(name="Test Project")
        self.artifact = Artifact.objects.create(
            project=self.project,
            name="Landing Page"
        )

    def test_artifact_version_creation(self):
        """Test that an artifact version can be created with a URL."""
        version = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url="https://figma.com/design/abc123",
            submitted_by="jane@agency.com"
        )
        self.assertEqual(version.version_number, 1)
        self.assertEqual(version.url, "https://figma.com/design/abc123")
        self.assertEqual(version.submitted_by, "jane@agency.com")
        self.assertEqual(version.artifact, self.artifact)

    def test_artifact_version_unique_constraint(self):
        """Test that duplicate version numbers for the same artifact are prevented."""
        ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url="https://example.com/v1"
        )
        
        # Attempting to create another version 1 should fail
        with self.assertRaises(Exception):
            ArtifactVersion.objects.create(
                artifact=self.artifact,
                version_number=1,
                url="https://example.com/v1-duplicate"
            )

    def test_artifact_version_ordering(self):
        """Test that versions are ordered by creation date (newest first)."""
        v1 = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url="https://example.com/v1"
        )
        v2 = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=2,
            url="https://example.com/v2"
        )
        
        versions = list(ArtifactVersion.objects.all())
        self.assertEqual(versions[0], v2)  # Newest first
        self.assertEqual(versions[1], v1)


class ApprovalDecisionModelTest(TestCase):
    """Test the ApprovalDecision model."""

    def setUp(self):
        self.project = Project.objects.create(name="Test Project")
        self.artifact = Artifact.objects.create(
            project=self.project,
            name="Test Artifact"
        )
        self.version = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url="https://example.com/v1"
        )

    def test_approval_decision_creation(self):
        """Test creating an approval decision."""
        decision = ApprovalDecision.objects.create(
            artifact_version=self.version,
            decision=ApprovalDecision.Decision.APPROVE,
            decided_by="client@example.com"
        )
        self.assertEqual(decision.decision, ApprovalDecision.Decision.APPROVE)
        self.assertEqual(decision.decided_by, "client@example.com")
        self.assertEqual(decision.artifact_version, self.version)
        self.assertIsNotNone(decision.decided_at)

    def test_rejection_with_reason(self):
        """Test creating a rejection with a reason."""
        decision = ApprovalDecision.objects.create(
            artifact_version=self.version,
            decision=ApprovalDecision.Decision.REJECT,
            decided_by="client@example.com",
            reason="Colors don't match brand guidelines",
            note="Please use primary blue (#0066CC)"
        )
        self.assertEqual(decision.decision, ApprovalDecision.Decision.REJECT)
        self.assertEqual(decision.reason, "Colors don't match brand guidelines")
        self.assertIn("primary blue", decision.note)


class ArtifactVersionAPITest(APITestCase):
    """Test the ArtifactVersion API endpoints."""

    def setUp(self):
        """Create test data for API tests."""
        self.project = Project.objects.create(name="API Test Project")
        self.artifact = Artifact.objects.create(
            project=self.project,
            name="API Test Artifact"
        )

    def test_create_artifact_version(self):
        """Test POST /api/artifact-versions/ to create a new version."""
        url = '/api/artifact-versions/'
        data = {
            'artifact': self.artifact.id,
            'version_number': 1,
            'url': 'https://staging.example.com/homepage',
            'submitted_by': 'developer@agency.com'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['version_number'], 1)
        self.assertEqual(response.data['url'], 'https://staging.example.com/homepage')
        self.assertEqual(response.data['status'], 'AWAITING_APPROVAL')
        self.assertIsNone(response.data['decision'])

    def test_retrieve_artifact_version(self):
        """Test GET /api/artifact-versions/{id}/ to retrieve a version."""
        version = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url='https://example.com/test',
            submitted_by='test@example.com'
        )
        
        url = f'/api/artifact-versions/{version.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], version.id)
        self.assertEqual(response.data['status'], 'AWAITING_APPROVAL')

    def test_retrieve_nonexistent_version_returns_404(self):
        """Test that retrieving a non-existent version returns 404."""
        url = '/api/artifact-versions/99999/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ApprovalBoundaryAPITest(APITestCase):
    """
    Test the core approval boundary hypothesis:
    - Decisions are binary (approve or reject)
    - Decisions are final (no duplicates)
    - Decisions are explicit (require decided_by)
    """

    def setUp(self):
        """Create a test version awaiting approval."""
        self.project = Project.objects.create(name="Boundary Test Project")
        self.artifact = Artifact.objects.create(
            project=self.project,
            name="Boundary Test Artifact"
        )
        self.version = ArtifactVersion.objects.create(
            artifact=self.artifact,
            version_number=1,
            url='https://figma.com/test123',
            submitted_by='agency@example.com'
        )

    def test_approve_version(self):
        """Test POST /api/artifact-versions/{id}/approve/ approves a version."""
        url = f'/api/artifact-versions/{self.version.id}/approve/'
        data = {
            'decided_by': 'client@example.com',
            'note': 'Looks great, approved!'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'APPROVED')
        self.assertEqual(response.data['decision']['decision'], 'APPROVE')
        self.assertEqual(response.data['decision']['decided_by'], 'client@example.com')
        self.assertIsNotNone(response.data['decision']['decided_at'])

    def test_reject_version(self):
        """Test POST /api/artifact-versions/{id}/reject/ rejects a version."""
        url = f'/api/artifact-versions/{self.version.id}/reject/'
        data = {
            'decided_by': 'client@example.com',
            'reason': 'Needs revision',
            'note': 'The header font is too small'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'REJECTED')
        self.assertEqual(response.data['decision']['decision'], 'REJECT')
        self.assertEqual(response.data['decision']['reason'], 'Needs revision')

    def test_approve_requires_decided_by(self):
        """Test that approval requires decided_by field."""
        url = f'/api/artifact-versions/{self.version.id}/approve/'
        data = {}  # No decided_by
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('decided_by', response.data['detail'].lower())

    def test_reject_requires_decided_by(self):
        """Test that rejection requires decided_by field."""
        url = f'/api/artifact-versions/{self.version.id}/reject/'
        data = {}  # No decided_by
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_finality_prevents_duplicate_approval(self):
        """
        CORE MVP TEST: Test that finality is enforced - 
        a version cannot be approved twice.
        """
        url = f'/api/artifact-versions/{self.version.id}/approve/'
        data = {'decided_by': 'client@example.com'}
        
        # First approval should succeed
        response1 = self.client.post(url, data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Second approval attempt should fail with 409 Conflict
        response2 = self.client.post(url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('already exists', response2.data['detail'].lower())

    def test_finality_prevents_approval_after_rejection(self):
        """
        CORE MVP TEST: Test that a rejected version cannot be approved.
        """
        reject_url = f'/api/artifact-versions/{self.version.id}/reject/'
        approve_url = f'/api/artifact-versions/{self.version.id}/approve/'
        data = {'decided_by': 'client@example.com'}
        
        # First reject
        response1 = self.client.post(reject_url, data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Attempt to approve after rejection should fail
        response2 = self.client.post(approve_url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_409_CONFLICT)

    def test_finality_prevents_rejection_after_approval(self):
        """
        CORE MVP TEST: Test that an approved version cannot be rejected.
        """
        approve_url = f'/api/artifact-versions/{self.version.id}/approve/'
        reject_url = f'/api/artifact-versions/{self.version.id}/reject/'
        data = {'decided_by': 'client@example.com'}
        
        # First approve
        response1 = self.client.post(approve_url, data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # Attempt to reject after approval should fail
        response2 = self.client.post(reject_url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_409_CONFLICT)

    def test_approve_nonexistent_version_returns_404(self):
        """Test that approving a non-existent version returns 404."""
        url = '/api/artifact-versions/99999/approve/'
        data = {'decided_by': 'client@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reject_nonexistent_version_returns_404(self):
        """Test that rejecting a non-existent version returns 404."""
        url = '/api/artifact-versions/99999/reject/'
        data = {'decided_by': 'client@example.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ApprovalWorkflowIntegrationTest(APITestCase):
    """
    Integration test simulating the complete approval workflow 
    described in the MVP documentation.
    """

    def test_complete_approval_workflow(self):
        """
        Test the full happy path:
        1. Agency submits a version
        2. Client approves it
        3. Decision is recorded permanently
        """
        # Setup
        project = Project.objects.create(name="Integration Test Project")
        artifact = Artifact.objects.create(
            project=project,
            name="Homepage Redesign"
        )
        
        # Step 1: Agency submits version
        create_url = '/api/artifact-versions/'
        create_data = {
            'artifact': artifact.id,
            'version_number': 1,
            'url': 'https://staging.acme.com/homepage-v1',
            'submitted_by': 'designer@agency.com'
        }
        create_response = self.client.post(create_url, create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        version_id = create_response.data['id']
        self.assertEqual(create_response.data['status'], 'AWAITING_APPROVAL')
        
        # Step 2: Client approves version
        approve_url = f'/api/artifact-versions/{version_id}/approve/'
        approve_data = {
            'decided_by': 'stakeholder@client.com',
            'note': 'Perfect! Approved for launch.'
        }
        approve_response = self.client.post(approve_url, approve_data, format='json')
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        self.assertEqual(approve_response.data['status'], 'APPROVED')
        
        # Step 3: Verify decision is permanently recorded
        retrieve_url = f'/api/artifact-versions/{version_id}/'
        retrieve_response = self.client.get(retrieve_url)
        self.assertEqual(retrieve_response.data['status'], 'APPROVED')
        self.assertEqual(
            retrieve_response.data['decision']['decided_by'],
            'stakeholder@client.com'
        )
        self.assertIsNotNone(retrieve_response.data['decision']['decided_at'])
        
        # Step 4: Verify finality - cannot change decision
        reject_url = f'/api/artifact-versions/{version_id}/reject/'
        reject_data = {'decided_by': 'someone@example.com'}
        reject_response = self.client.post(reject_url, reject_data, format='json')
        self.assertEqual(reject_response.status_code, status.HTTP_409_CONFLICT)

    def test_complete_rejection_workflow(self):
        """
        Test the rejection path:
        1. Agency submits a version
        2. Client rejects it with structured feedback
        3. Decision is recorded permanently
        """
        # Setup
        project = Project.objects.create(name="Rejection Test Project")
        artifact = Artifact.objects.create(
            project=project,
            name="Logo Design"
        )
        
        # Step 1: Agency submits version
        create_data = {
            'artifact': artifact.id,
            'version_number': 1,
            'url': 'https://figma.com/logo-concept-1',
            'submitted_by': 'designer@agency.com'
        }
        create_response = self.client.post(
            '/api/artifact-versions/',
            create_data,
            format='json'
        )
        version_id = create_response.data['id']
        
        # Step 2: Client rejects with structured reason
        reject_url = f'/api/artifact-versions/{version_id}/reject/'
        reject_data = {
            'decided_by': 'marketing@client.com',
            'reason': 'Does not align with brand identity',
            'note': 'The colors are too bright. Please use our brand palette.'
        }
        reject_response = self.client.post(reject_url, reject_data, format='json')
        self.assertEqual(reject_response.status_code, status.HTTP_200_OK)
        self.assertEqual(reject_response.data['status'], 'REJECTED')
        self.assertEqual(
            reject_response.data['decision']['reason'],
            'Does not align with brand identity'
        )
        
        # Step 3: Verify rejection is permanent
        approve_response = self.client.post(
            f'/api/artifact-versions/{version_id}/approve/',
            {'decided_by': 'someone@example.com'},
            format='json'
        )
        self.assertEqual(approve_response.status_code, status.HTTP_409_CONFLICT)
