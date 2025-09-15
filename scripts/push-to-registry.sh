#!/bin/bash

# Push Docker images to GCP Artifact Registry

set -e

# Configuration
GCP_REGION=${GCP_REGION:-"us-central1"}
PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Unable to get GCP Project ID. Make sure gcloud CLI is configured or set PROJECT_ID environment variable."
    exit 1
fi

REGISTRY_URL="$GCP_REGION-docker.pkg.dev/$PROJECT_ID/bookshelf-mvp"

echo "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker $GCP_REGION-docker.pkg.dev

echo "Tagging images for Artifact Registry..."
docker tag bookshelf-backend:latest $REGISTRY_URL/bookshelf-backend:latest
docker tag bookshelf-frontend:latest $REGISTRY_URL/bookshelf-frontend:latest

echo "Pushing images to Artifact Registry..."
docker push $REGISTRY_URL/bookshelf-backend:latest
docker push $REGISTRY_URL/bookshelf-frontend:latest

echo "Images pushed successfully to Artifact Registry!"
echo "Backend: $REGISTRY_URL/bookshelf-backend:latest"
echo "Frontend: $REGISTRY_URL/bookshelf-frontend:latest"