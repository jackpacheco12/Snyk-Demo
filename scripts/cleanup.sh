#!/bin/bash

# Clean up resources

set -e

echo "Cleaning up Kubernetes resources..."
kubectl delete -k k8s/ --ignore-not-found=true

echo "Cleaning up infrastructure..."
cd terraform
terraform destroy -auto-approve

echo "Cleanup completed!"