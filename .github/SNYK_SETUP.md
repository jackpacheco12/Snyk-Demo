# GitHub Actions Setup - Security & Deployment

## Overview
This repository uses GitHub Actions for:
- **Comprehensive Snyk Security Scanning**: Dependencies, code, infrastructure, and containers
- **Automated GCP Deployment**: Deploy to Google Kubernetes Engine after security validation

## What Gets Scanned
- **Dependencies:** Frontend/backend package.json vulnerabilities
- **Code Quality:** Static application security testing (SAST)
- **Infrastructure as Code:** Terraform, Kubernetes manifests, Dockerfiles
- **Container Images:** Base image vulnerabilities and misconfigurations

## Required GitHub Secrets

### 1. Snyk Configuration
1. Sign up at [snyk.io](https://snyk.io)
2. Get API token: Account Settings → API Token
3. Add secret: `SNYK_TOKEN`

### 2. GCP Configuration
1. Create GCP service account with these roles:
   - Artifact Registry Administrator
   - Kubernetes Engine Developer
   - Service Account User

2. Download service account JSON key

3. Add these GitHub secrets:
   - `GCP_SA_KEY`: Service account JSON (entire file content)
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `GCP_REGION`: Deployment region (e.g., us-central1)

## Prerequisites
- GCP infrastructure deployed (run `./scripts/deploy-infrastructure.sh` once)
- Artifact Registry repository exists
- GKE cluster exists

## Workflow Process
```
Push to production → Security Scan → Build → Docker Push → GKE Deploy
Push to main/master → Security Scan only (no deployment)
```

### Security Scan Job
- **Runs on:** All pushes and PRs to main, master, or production
- **Dependencies:** Frontend/backend package.json vulnerabilities
- **Code Quality:** Static code analysis for security issues
- **Infrastructure:** Terraform, Kubernetes, Docker configurations
- **Containers:** Docker image vulnerabilities and misconfigurations
- Must pass for deployment to proceed

### Build & Deploy Job (production branch only)
- **Runs on:** Only pushes to `production` branch
- Builds applications
- Pushes Docker images to Artifact Registry
- Deploys to GKE cluster
- Updates running application

## Manual Infrastructure Setup
Before first automated deployment:
```bash
export PROJECT_ID="your-project-id"
./scripts/deploy-infrastructure.sh
```

## Results
- Security: GitHub Security tab
- Deployment: Application accessible via LoadBalancer IP