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

output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.bookshelf_db.name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.bookshelf_db.private_ip_address
}

output "database_public_ip" {
  description = "Cloud SQL public IP address"
  value       = google_sql_database_instance.bookshelf_db.public_ip_address
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.bookshelf_db.connection_name
}