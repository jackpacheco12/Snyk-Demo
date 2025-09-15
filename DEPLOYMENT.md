# Bookshelf MVP - GCP Deployment Guide

This guide will help you deploy the bookshelf application to Google Cloud Platform using Google Kubernetes Engine (GKE).

## Prerequisites

1. Google Cloud Platform account with billing enabled
2. `gcloud` CLI installed and configured
3. `kubectl` installed
4. `terraform` installed
5. `docker` installed
6. `kustomize` installed (or use `kubectl apply -k`)

## Setup

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Set your project:**
   ```bash
   export PROJECT_ID="your-project-id"
   gcloud config set project $PROJECT_ID
   ```

3. **Enable required APIs:**
   ```bash
   gcloud services enable container.googleapis.com
   gcloud services enable compute.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

## Deployment Steps

### 1. Build Docker Images

```bash
./scripts/build-images.sh
```

### 2. Deploy Infrastructure

This will create:
- VPC network and subnet
- GKE cluster with node pool
- Artifact Registry repository
- Required IAM roles and service accounts

```bash
export PROJECT_ID="your-project-id"
./scripts/deploy-infrastructure.sh
```

### 3. Push Images to Artifact Registry

```bash
export USE_REGISTRY=true
./scripts/push-to-registry.sh
```

### 4. Deploy Application

```bash
export USE_REGISTRY=true
./scripts/deploy-app.sh
```

## Accessing the Application

After deployment, the script will provide instructions to access the application:

1. Get the LoadBalancer IP from the ingress controller
2. Add an entry to your `/etc/hosts` file pointing `bookshelf-mvp.local` to the LoadBalancer IP
3. Access the application at `http://bookshelf-mvp.local`

## Monitoring

Check the status of your deployment:

```bash
# Check pods
kubectl get pods -n bookshelf-mvp

# Check services
kubectl get services -n bookshelf-mvp

# Check ingress
kubectl get ingress -n bookshelf-mvp

# View logs
kubectl logs -f deployment/bookshelf-backend -n bookshelf-mvp
kubectl logs -f deployment/bookshelf-frontend -n bookshelf-mvp
```

## Cleanup

To destroy all resources:

```bash
./scripts/cleanup.sh
```

## Cost Optimization

The default configuration uses:
- `e2-medium` instances (preemptible for cost savings)
- Single node per zone
- Regional persistent disks

For production, consider:
- Using standard (non-preemptible) instances
- Increasing node count for high availability
- Setting up monitoring and alerting
- Implementing proper backup strategies

## Security Considerations

- All containers run as non-root users
- Resource limits are set for all containers
- Network policies can be added for additional security
- Service accounts follow principle of least privilege

## Troubleshooting

### Common Issues

1. **Permission errors:**
   - Ensure proper IAM roles are assigned
   - Verify gcloud authentication

2. **Image pull errors:**
   - Check Artifact Registry permissions
   - Verify image tags in kustomization.yaml

3. **LoadBalancer not getting IP:**
   - Wait a few minutes for GCP to provision the LoadBalancer
   - Check firewall rules

4. **Pods not starting:**
   - Check resource quotas in your GCP project
   - Verify node capacity

### Useful Commands

```bash
# Get cluster credentials
gcloud container clusters get-credentials bookshelf-mvp-cluster --region us-central1

# Check cluster status
kubectl cluster-info

# Scale deployments
kubectl scale deployment bookshelf-backend --replicas=3 -n bookshelf-mvp

# Update images
kubectl set image deployment/bookshelf-backend backend=new-image:tag -n bookshelf-mvp
```