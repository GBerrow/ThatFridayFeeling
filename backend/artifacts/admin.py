from django.contrib import admin

from .models import Artifact, ArtifactVersion, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'artifact_type', 'created_at')
    list_filter = ('project', 'artifact_type')
    search_fields = ('name', 'project__name')


@admin.register(ArtifactVersion)
class ArtifactVersionAdmin(admin.ModelAdmin):
    list_display = ('artifact', 'version_number', 'url', 'submitted_by', 'created_at', 'get_status')
    list_filter = ('artifact__project', 'created_at')
    search_fields = ('artifact__name', 'submitted_by')
    readonly_fields = ('created_at', 'updated_at')

    def get_status(self, obj):
        if hasattr(obj, 'approval_decision') and obj.approval_decision:
            return obj.approval_decision.get_decision_display()
        return 'Awaiting Approval'
    get_status.short_description = 'Status'
