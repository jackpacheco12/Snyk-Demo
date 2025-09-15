#!/bin/bash

# Deploy the application to Kubernetes

set -e

echo "Deploying application to Kubernetes..."

# Update image references in kustomization if using Artifact Registry
if [ "$USE_REGISTRY" = "true" ]; then
    PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}
    GCP_REGION=${GCP_REGION:-"us-central1"}
    REGISTRY_URL="$GCP_REGION-docker.pkg.dev/$PROJECT_ID/bookshelf-mvp"

    # Update kustomization.yaml with Artifact Registry images
    cd k8s
    kustomize edit set image bookshelf-backend=$REGISTRY_URL/bookshelf-backend:latest
    kustomize edit set image bookshelf-frontend=$REGISTRY_URL/bookshelf-frontend:latest
    cd ..
fi

echo "Applying Kubernetes manifests..."
kubectl apply -k k8s/

echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/bookshelf-backend -n bookshelf-mvp
kubectl wait --for=condition=available --timeout=300s deployment/bookshelf-frontend -n bookshelf-mvp

echo "Getting application URL..."
INGRESS_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$INGRESS_IP" ]; then
    echo "Waiting for LoadBalancer IP to be assigned..."
    sleep 30
    INGRESS_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi

echo "Application deployed successfully!"
if [ -n "$INGRESS_IP" ]; then
    echo "Add the following to your /etc/hosts file:"
    echo "$INGRESS_IP bookshelf-mvp.local"
    echo ""
    echo "Then access the application at: http://bookshelf-mvp.local"
else
    echo "LoadBalancer IP not yet assigned. Check later with:"
    echo "kubectl get service ingress-nginx-controller -n ingress-nginx"
fi

echo ""
echo "To check application status:"
echo "kubectl get pods -n bookshelf-mvp"
echo "kubectl get services -n bookshelf-mvp"