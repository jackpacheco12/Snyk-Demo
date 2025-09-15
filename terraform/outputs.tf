output "cluster_name" {
  description = "GKE cluster name"
  value       = google_container_cluster.bookshelf_cluster.name
}

output "cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = google_container_cluster.bookshelf_cluster.endpoint
}

output "cluster_location" {
  description = "GKE cluster location"
  value       = google_container_cluster.bookshelf_cluster.location
}

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.gcp_region
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.gcp_region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.bookshelf_repo.repository_id}"
}