from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from approvals.models import ApprovalDecision
from .models import ArtifactVersion
from .serializers import (
    ApprovalDecisionSerializer,
    ArtifactVersionCreateSerializer,
    ArtifactVersionSerializer,
)


class ApiRoot(APIView):
    """Simple API root that lists primary endpoints for developer convenience."""
    def get(self, request, format=None):
        return Response(
            {
                'artifact_versions_create': request.build_absolute_uri(
                    '/api/artifact-versions/'
                ),
            }
        )


class ArtifactVersionCreateView(APIView):
    def post(self, request):
        serializer = ArtifactVersionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        version = serializer.save()
        return Response(ArtifactVersionSerializer(version).data, status=status.HTTP_201_CREATED)


class ArtifactVersionDetailView(APIView):
    def get(self, request, pk: int):
        version = get_object_or_404(ArtifactVersion.objects.select_related('approval_decision'), pk=pk)
        return Response(ArtifactVersionSerializer(version).data)


class ArtifactVersionApproveView(APIView):
    def post(self, request, pk: int):
        return self._decide(request=request, pk=pk, decision=ApprovalDecision.Decision.APPROVE)

    def _decide(self, request, pk: int, decision: str):
        version = get_object_or_404(ArtifactVersion, pk=pk)

        decided_by = request.data.get('decided_by') or ''
        if not decided_by:
            return Response({'detail': 'decided_by is required.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('reason', '')
        note = request.data.get('note', '')

        with transaction.atomic():
            if ApprovalDecision.objects.filter(artifact_version=version).exists():
                return Response({'detail': 'A decision already exists for this version.'}, status=status.HTTP_409_CONFLICT)

            ApprovalDecision.objects.create(
                artifact_version=version,
                decision=decision,
                decided_by=decided_by,
                reason=reason,
                note=note,
            )
            # Reload to get the new approval_decision relation
            version.refresh_from_db()

        serializer = ArtifactVersionSerializer(version)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ArtifactVersionRejectView(ArtifactVersionApproveView):
    def post(self, request, pk: int):
        return self._decide(request=request, pk=pk, decision=ApprovalDecision.Decision.REJECT)
