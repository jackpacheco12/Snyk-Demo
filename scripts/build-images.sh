#!/bin/bash

# Build and tag Docker images for the bookshelf application

set -e

echo "Building Docker images..."

# Build backend image
echo "Building backend image..."
docker build -t bookshelf-backend:latest ./backend

# Build frontend image
echo "Building frontend image..."
docker build -t bookshelf-frontend:latest ./frontend

echo "Docker images built successfully!"

# Optional: Tag for ECR (uncomment and modify as needed)
# AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# AWS_REGION="us-west-2"
#
# docker tag bookshelf-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookshelf-backend:latest
# docker tag bookshelf-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookshelf-frontend:latest

echo "To push to Artifact Registry, run: ./scripts/push-to-registry.sh"