from rest_framework import serializers

from approvals.models import ApprovalDecision
from .models import ArtifactVersion


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
        fields = ['artifact', 'version_number', 'url', 'submitted_by']
