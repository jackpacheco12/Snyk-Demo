terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
}

# VPC Network
resource "google_compute_network" "bookshelf_vpc" {
  name                    = "bookshelf-mvp-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "bookshelf_subnet" {
  name          = "bookshelf-mvp-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.bookshelf_vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.1.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Enable required APIs
resource "google_project_service" "container_api" {
  service = "container.googleapis.com"
}

resource "google_project_service" "compute_api" {
  service = "compute.googleapis.com"
}

resource "google_project_service" "sql_api" {
  service = "sqladmin.googleapis.com"
}

# GKE Cluster
resource "google_container_cluster" "bookshelf_cluster" {
  name     = var.cluster_name
  location = var.gcp_region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.bookshelf_vpc.name
  subnetwork = google_compute_subnetwork.bookshelf_subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  deletion_protection = false

  depends_on = [
    google_project_service.container_api,
    google_project_service.compute_api,
  ]
}

# GKE Node Pool
resource "google_container_node_pool" "bookshelf_nodes" {
  name       = "bookshelf-mvp-nodes"
  location   = var.gcp_region
  cluster    = google_container_cluster.bookshelf_cluster.name
  node_count = var.node_count

  node_config {
    preemptible  = true
    machine_type = var.node_machine_type

    service_account = google_service_account.gke_service_account.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = var.environment
    }

    tags = ["bookshelf-mvp"]
  }

  depends_on = [google_container_cluster.bookshelf_cluster]
}

# Service Account for GKE nodes
resource "google_service_account" "gke_service_account" {
  account_id   = "bookshelf-mvp-gke-sa"
  display_name = "GKE Service Account for bookshelf-mvp"
}

# IAM bindings for the service account
resource "google_project_iam_member" "gke_service_account_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gke_service_account.email}"
}

# Private Service Access for Cloud SQL
resource "google_compute_global_address" "private_ip_alloc" {
  name          = "bookshelf-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.bookshelf_vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.bookshelf_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]

  depends_on = [google_project_service.sql_api]
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "bookshelf_db" {
  name             = "bookshelf-mvp-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.bookshelf_vpc.id
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = false

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.sql_api
  ]
}

# Database
resource "google_sql_database" "bookshelf" {
  name     = "bookshelf"
  instance = google_sql_database_instance.bookshelf_db.name
}

# Database User
resource "google_sql_user" "bookshelf_user" {
  name     = "bookshelf"
  instance = google_sql_database_instance.bookshelf_db.name
  password = var.db_password
}