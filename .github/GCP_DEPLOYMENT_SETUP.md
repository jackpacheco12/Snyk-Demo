# Complete GCP Deployment Setup Guide

## Prerequisites
- Google Cloud Platform account with billing enabled
- GitHub repository with this code
- `gcloud` CLI installed locally

## Quick Action Checklist

### ✅ Step 1: Get Your GCP Project ID
```bash
gcloud projects list
```
**→ COPY YOUR PROJECT ID** (e.g., `bookshelf-mvp-123456`)

### ✅ Step 2: Get Snyk API Token
1. Go to [snyk.io](https://snyk.io)
2. Sign up/login
3. Go to Account Settings → API Token
4. **→ COPY THE TOKEN** (starts like `abc123...`)

### ✅ Step 3: Create GCP Service Account & Key
```bash
# REPLACE YOUR_PROJECT_ID with actual project ID from Step 1
export PROJECT_ID="YOUR_PROJECT_ID"

# Create service account
gcloud iam service-accounts create github-actions --project=$PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/container.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Create key file
gcloud iam service-accounts keys create github-key.json \
    --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Show key content
cat github-key.json
```
**→ COPY THE ENTIRE JSON OUTPUT**

### ✅ Step 4: Deploy Infrastructure
```bash
export PROJECT_ID="YOUR_ACTUAL_PROJECT_ID"
./scripts/deploy-infrastructure.sh
```

### ✅ Step 5: Add GitHub Secrets
Go to: **Your Repo → Settings → Secrets and Variables → Actions → New Repository Secret**

Add these 4 secrets:

| Secret Name | Value to Paste |
|-------------|----------------|
| `SNYK_TOKEN` | **Your Snyk token from Step 2** |
| `GCP_SA_KEY` | **Entire JSON from Step 3** |
| `GCP_PROJECT_ID` | **Your project ID from Step 1** |
| `GCP_REGION` | `us-central1` |

### ✅ Step 6: Test Deployment
```bash
git add .
git commit -m "Deploy to GCP"

# For security scan only
git push origin main

# For full deployment to GCP
git checkout -b production
git push origin production
```
**Watch GitHub Actions tab for deployment progress!**

---

## Detailed Setup Instructions

## Step 1: GCP Project Setup

### 1.1 Create or Select Project
```bash
# List existing projects
gcloud projects list

# Create new project (optional)
gcloud projects create bookshelf-mvp-[RANDOM-ID]

# Set your project ID
export PROJECT_ID="your-project-id-here"
gcloud config set project $PROJECT_ID
```

### 1.2 Enable Required APIs
```bash
gcloud services enable container.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 2: Create Service Account for GitHub Actions

### 2.1 Create Service Account
```bash
gcloud iam service-accounts create github-actions \
    --description="Service account for GitHub Actions deployment" \
    --display-name="GitHub Actions"
```

### 2.2 Grant Required Permissions
```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/container.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

### 2.3 Create and Download Key
```bash
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# View the key content (you'll need this for GitHub)
cat github-actions-key.json
```

## Step 3: Deploy GCP Infrastructure

### 3.1 Deploy Infrastructure
```bash
# From your project root directory
export PROJECT_ID="your-project-id-here"
./scripts/deploy-infrastructure.sh
```

This creates:
- GKE cluster
- Artifact Registry repository
- VPC network
- Required IAM roles

### 3.2 Verify Infrastructure
```bash
# Check cluster
gcloud container clusters list

# Check Artifact Registry
gcloud artifacts repositories list

# Get cluster credentials
gcloud container clusters get-credentials bookshelf-mvp-cluster \
    --region us-central1 \
    --project $PROJECT_ID
```

## Step 4: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### 4.1 Add Snyk Secret
- **Name:** `SNYK_TOKEN`
- **Value:** Your Snyk API token from [snyk.io](https://snyk.io)

### 4.2 Add GCP Secrets
- **Name:** `GCP_SA_KEY`
- **Value:** Entire content of `github-actions-key.json` file

- **Name:** `GCP_PROJECT_ID`
- **Value:** Your GCP project ID (e.g., `bookshelf-mvp-123456`)

- **Name:** `GCP_REGION`
- **Value:** `us-central1` (or your preferred region)

## Step 5: Test the Deployment

### 5.1 Trigger Deployment
```bash
# Make a small change and push to main branch
git add .
git commit -m "Test automated deployment"
git push origin main
```

### 5.2 Monitor Progress
1. Go to GitHub Actions tab in your repository
2. Watch the workflow progress
3. Check for any errors in the logs

### 5.3 Verify Deployment
```bash
# Check if pods are running
kubectl get pods -n bookshelf-mvp

# Get application URL
kubectl get service ingress-nginx-controller -n ingress-nginx
```

## Step 6: Access Your Application

### 6.1 Get LoadBalancer IP
```bash
INGRESS_IP=$(kubectl get service ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "LoadBalancer IP: $INGRESS_IP"
```

### 6.2 Configure Local Access
Add to your `/etc/hosts` file:
```
[LOADBALANCER_IP] bookshelf-mvp.local
```

### 6.3 Access Application
Open browser: `http://bookshelf-mvp.local`

## Required Values Summary

Fill in these values in your setup:

| Item | Replace With | Example |
|------|-------------|---------|
| `PROJECT_ID` | Your GCP project ID | `bookshelf-mvp-123456` |
| `SNYK_TOKEN` | Your Snyk API token | `abc123...` |
| `GCP_SA_KEY` | Service account JSON | `{"type": "service_account"...}` |
| `GCP_REGION` | Your deployment region | `us-central1` |

## Troubleshooting

### Common Issues:
1. **Permission Errors:** Verify service account has all required roles
2. **Quota Errors:** Check GCP quotas for your region
3. **Network Issues:** Ensure APIs are enabled
4. **Build Failures:** Check GitHub Actions logs for details

### Useful Commands:
```bash
# Check cluster status
kubectl cluster-info

# View pod logs
kubectl logs -f deployment/bookshelf-backend -n bookshelf-mvp

# Check ingress status
kubectl get ingress -n bookshelf-mvp

# Restart deployment
kubectl rollout restart deployment/bookshelf-backend -n bookshelf-mvp
```

## Cost Considerations
- GKE cluster runs 24/7 (consider preemptible nodes for dev)
- LoadBalancer has hourly cost
- Artifact Registry storage costs
- Consider cleanup for non-production environments

## Cleanup (Optional)
To remove all resources:
```bash
./scripts/cleanup.sh
```