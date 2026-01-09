from django.db import models

from artifacts.models import ArtifactVersion


class ApprovalDecision(models.Model):
    class Decision(models.TextChoices):
        APPROVE = 'APPROVE', 'Approve'
        REJECT = 'REJECT', 'Reject'

    artifact_version = models.OneToOneField(
        ArtifactVersion,
        related_name='approval_decision',
        on_delete=models.CASCADE,
    )
    decision = models.CharField(max_length=10, choices=Decision.choices)
    reason = models.CharField(max_length=100, blank=True)
    note = models.TextField(blank=True)
    decided_by = models.CharField(max_length=255)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-decided_at']

    def __str__(self) -> str:
        return f"{self.artifact_version} -> {self.decision}"
