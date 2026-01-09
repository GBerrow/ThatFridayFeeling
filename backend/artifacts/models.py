from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Artifact(models.Model):
    project = models.ForeignKey(Project, related_name='artifacts', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    artifact_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.project}: {self.name}"


class ArtifactVersion(models.Model):
    artifact = models.ForeignKey(Artifact, related_name='versions', on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    url = models.URLField()
    submitted_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('artifact', 'version_number')
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.artifact} v{self.version_number}"
