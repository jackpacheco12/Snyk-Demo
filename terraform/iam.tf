# Container Registry access for pushing images
resource "google_project_iam_member" "container_registry_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.gke_service_account.email}"
}

# Artifact Registry access (for newer GCP projects)
resource "google_project_iam_member" "artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.gke_service_account.email}"
}

# Enable Artifact Registry API
resource "google_project_service" "artifact_registry_api" {
  service = "artifactregistry.googleapis.com"
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "bookshelf_repo" {
  location      = var.gcp_region
  repository_id = "bookshelf-mvp"
  description   = "Docker repository for bookshelf MVP"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry_api]
}