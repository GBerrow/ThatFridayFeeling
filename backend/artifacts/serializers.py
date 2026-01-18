from django.db import models
from rest_framework import serializers

from approvals.models import ApprovalDecision
from .models import Artifact, ArtifactVersion


class ApprovalDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalDecision
        fields = ['decision', 'reason', 'note', 'decided_by', 'decided_at']
        read_only_fields = ['decided_at']


class ArtifactVersionSerializer(serializers.ModelSerializer):
    decision = ApprovalDecisionSerializer(read_only=True, source='approval_decision')
    status = serializers.SerializerMethodField()

    class Meta:
        model = ArtifactVersion
        fields = [
            'id',
            'artifact',
            'version_number',
            'url',
            'submitted_by',
            'status',
            'created_at',
            'updated_at',
            'decision',
        ]
        read_only_fields = ['status', 'created_at', 'updated_at', 'decision']

    def get_status(self, obj: ArtifactVersion) -> str:
        if hasattr(obj, 'approval_decision') and obj.approval_decision:
            return 'APPROVED' if obj.approval_decision.decision == ApprovalDecision.Decision.APPROVE else 'REJECTED'
        return 'AWAITING_APPROVAL'


class ArtifactVersionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifactVersion
        fields = ['artifact', 'url', 'submitted_by']

    def create(self, validated_data):
        """Auto-assign the next version number if not provided."""
        artifact = validated_data['artifact']
        
        # Get the highest version number for this artifact
        max_version = ArtifactVersion.objects.filter(
            artifact=artifact
        ).aggregate(models.Max('version_number'))['version_number__max'] or 0
        
        # Set the next version number
        validated_data['version_number'] = max_version + 1
        
        return super().create(validated_data)


class ArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artifact
        fields = ['id', 'project', 'name', 'artifact_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class ArtifactCreateSerializer(serializers.ModelSerializer):
    """Simple serializer for creating artifacts with just name and type."""
    class Meta:
        model = Artifact
        fields = ['name', 'artifact_type']
    
    def create(self, validated_data):
        """Create artifact with a default project."""
        from .models import Project
        
        # Get or create a default project
        default_project, _ = Project.objects.get_or_create(
            name='Default Project',
            defaults={'name': 'Default Project'}
        )
        
        validated_data['project'] = default_project
        return super().create(validated_data)
