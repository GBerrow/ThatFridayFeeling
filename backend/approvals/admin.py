from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import ApprovalDecision


@admin.register(ApprovalDecision)
class ApprovalDecisionAdmin(admin.ModelAdmin):
    list_display = ('artifact_version_link', 'decision', 'decided_by', 'decided_at')
    list_filter = ('decision', 'decided_at')
    search_fields = ('artifact_version__artifact__name', 'decided_by')
    readonly_fields = ('decided_at', 'artifact_version')

    def artifact_version_link(self, obj):
        """Display artifact version as a clickable link."""
        url = reverse('admin:artifacts_artifactversion_change', args=[obj.artifact_version.id])
        return format_html('<a href="{}">{}</a>', url, obj.artifact_version)
    artifact_version_link.short_description = 'Artifact Version'

    def has_delete_permission(self, request, obj=None):
        # Allow deletion to support cascade deletes from artifact versions
        return True

    def has_change_permission(self, request, obj=None):
        # Enforce immutability: decisions cannot be edited
        return False if obj else True
    
    def has_add_permission(self, request):
        # Decisions are created automatically, not manually
        return False
