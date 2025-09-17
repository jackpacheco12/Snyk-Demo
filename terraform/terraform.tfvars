# Copy this file to terraform.tfvars and update with your values

project_id = "jack-snyk-demo"
gcp_region = "us-central1"
environment = "production"
cluster_name = "bookshelf-mvp-cluster"
node_machine_type = "e2-small"
node_count = 1

# Database password for the bookshelf user
# Use a strong password and keep it secure
db_password = "password123"