from django.urls import path

from .views import (
    ArtifactCreateView,
    ArtifactVersionApproveView,
    ArtifactVersionCreateView,
    ArtifactVersionDetailView,
    ArtifactVersionRejectView,
    ApiRoot,
)

urlpatterns = [
    path('', ApiRoot.as_view(), name='api-root'),
    path('artifacts/', ArtifactCreateView.as_view(), name='artifact-create'),
    path('artifact-versions/', ArtifactVersionCreateView.as_view(), name='artifactversion-list-create'),
    path('artifact-versions/<int:pk>/', ArtifactVersionDetailView.as_view(), name='artifactversion-detail'),
    path('artifact-versions/<int:pk>/approve/', ArtifactVersionApproveView.as_view(), name='artifactversion-approve'),
    path('artifact-versions/<int:pk>/reject/', ArtifactVersionRejectView.as_view(), name='artifactversion-reject'),
]
