from django.contrib import admin

from .models import ApprovalDecision


@admin.register(ApprovalDecision)
class ApprovalDecisionAdmin(admin.ModelAdmin):
    list_display = ('artifact_version', 'decision', 'decided_by', 'decided_at')
    list_filter = ('decision', 'decided_at')
    search_fields = ('artifact_version__artifact__name', 'decided_by')
    readonly_fields = ('decided_at',)

    def has_delete_permission(self, request, obj=None):
        # Enforce immutability: decisions cannot be deleted
        return False

    def has_change_permission(self, request, obj=None):
        # Enforce immutability: decisions cannot be edited
        return False if obj else True
