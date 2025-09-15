#!/bin/bash

# Deploy infrastructure using Terraform

set -e

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        echo "Error: PROJECT_ID not set. Please set it as an environment variable or configure gcloud."
        exit 1
    fi
fi

cd terraform

echo "Initializing Terraform..."
terraform init

echo "Planning Terraform deployment..."
terraform plan -var="project_id=$PROJECT_ID"

echo "Applying Terraform configuration..."
terraform apply -var="project_id=$PROJECT_ID" -auto-approve

echo "Getting cluster credentials..."
CLUSTER_NAME=$(terraform output -raw cluster_name)
CLUSTER_LOCATION=$(terraform output -raw cluster_location)

gcloud container clusters get-credentials $CLUSTER_NAME --region $CLUSTER_LOCATION --project $PROJECT_ID

echo "Installing nginx-ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "Infrastructure deployed successfully!"
echo "Cluster: $CLUSTER_NAME"
echo "Location: $CLUSTER_LOCATION"
echo "Project: $PROJECT_ID"
echo "Run './scripts/deploy-app.sh' to deploy the application."