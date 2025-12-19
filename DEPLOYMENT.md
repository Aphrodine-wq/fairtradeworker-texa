# Vercel Auto-Deployment Configuration

This document describes the auto-deployment setup for FairTradeWorker to Vercel.

## Overview

The repository is now configured to automatically deploy to Vercel whenever changes are pushed to the main branch. The deployment workflow also supports manual triggers and preview deployments for pull requests.

## Deployment Triggers

### Automatic Deployments

1. **Push to `main` branch** → Production deployment
   - Every commit pushed to the main branch will automatically trigger a production deployment
   - No manual intervention required
   - Deployment happens automatically via GitHub Actions

2. **Pull Request to `main` branch** → Preview deployment
   - Every pull request targeting the main branch gets its own preview deployment
   - Allows testing changes before merging
   - Preview URL is unique for each PR

### Manual Deployments

You can also manually trigger deployments through the GitHub Actions UI:
- Go to Actions → Deploy to Vercel → Run workflow
- Choose between production or preview environment
- Useful for deploying from other branches or re-deploying

## How It Works

The deployment process uses GitHub Actions with the following steps:

1. **Checkout code** from the repository
2. **Setup Node.js 20** with npm caching for faster builds
3. **Install Vercel CLI** globally
4. **Pull Vercel environment configuration** for the target environment
5. **Build the project** using Vercel's build system
6. **Deploy** the pre-built artifacts to Vercel

## Required Secrets

The workflow requires the following GitHub secrets to be configured:

- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

These should already be configured in the repository settings.

## Deploy Button

A "Deploy with Vercel" button has been added to the README.md file, allowing one-click deployment setup for forks or new instances of the project.

## Workflow File

The deployment workflow is defined in `.github/workflows/deploy-vercel.yml` and includes:
- Automatic triggers for push and pull_request events
- Manual trigger via workflow_dispatch
- Intelligent environment selection based on trigger type
- Optimized build and deployment process

## Monitoring Deployments

To monitor deployments:

1. **GitHub Actions**: View workflow runs in the Actions tab
2. **Vercel Dashboard**: Check deployment status and logs at vercel.com
3. **Deployment URLs**: Each deployment gets a unique URL (found in workflow logs or Vercel dashboard)

## Benefits

✅ **Automatic Deployments** - No manual steps needed to deploy to production  
✅ **Preview Deployments** - Test changes before merging PRs  
✅ **Manual Control** - Option to manually trigger deployments when needed  
✅ **Fast Builds** - Optimized with npm caching and pre-built artifacts  
✅ **Secure** - Uses GitHub secrets for authentication  

## Troubleshooting

If deployments fail:

1. Check the GitHub Actions logs for error messages
2. Verify all required secrets are correctly configured
3. Ensure Vercel token has appropriate permissions
4. Check Vercel dashboard for deployment logs
5. Review the `.github/workflows/README.md` for detailed troubleshooting steps

## Further Documentation

- `.github/workflows/README.md` - Detailed workflow documentation
- `vercel.json` - Vercel project configuration
- GitHub Actions documentation: https://docs.github.com/actions
- Vercel CLI documentation: https://vercel.com/docs/cli
