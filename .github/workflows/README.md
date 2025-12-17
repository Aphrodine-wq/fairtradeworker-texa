# Manual Vercel Deployment Workflow

[![Deploy to Vercel](https://github.com/Aphrodine-wq/fairtradeworker-texa/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/Aphrodine-wq/fairtradeworker-texa/actions/workflows/deploy-vercel.yml)

This GitHub Actions workflow allows you to manually trigger a deployment to Vercel with a single click.

## Prerequisites

Before you can use this workflow, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **VERCEL_TOKEN** - Your Vercel authentication token
   - Go to https://vercel.com/account/tokens
   - Create a new token with appropriate permissions
   - Add it to GitHub Secrets: Settings → Secrets and variables → Actions → New repository secret

2. **VERCEL_ORG_ID** - Your Vercel organization ID
   - Run `vercel link` in your local project
   - Find the org ID in `.vercel/project.json`
   - Alternatively, run `vercel teams ls` to see your organization ID

3. **VERCEL_PROJECT_ID** - Your Vercel project ID
   - Run `vercel link` in your local project
   - Find the project ID in `.vercel/project.json`
   - Alternatively, check your Vercel dashboard project settings

## How to Use

### Triggering a Manual Deployment

1. Go to your GitHub repository: https://github.com/Aphrodine-wq/fairtradeworker-texa
2. Click on the **"Actions"** tab
3. Select **"Deploy to Vercel"** from the workflows list on the left
4. Click the **"Run workflow"** button (top right)
5. Select the deployment environment:
   - **production** - Deploy to your production domain
   - **preview** - Deploy to a unique preview URL
6. Click **"Run workflow"** to start the deployment
7. Monitor the deployment progress in real-time
8. Once complete, the deployment URL will be displayed in the workflow summary

### Workflow Steps

The workflow performs the following steps:

1. **Checkout code** - Checks out the repository code at the current commit
2. **Setup Node.js** - Sets up Node.js 20 with npm caching for faster runs
3. **Install Vercel CLI** - Installs the latest Vercel CLI globally
4. **Pull Vercel Environment** - Downloads environment configuration from Vercel
5. **Build Project** - Builds the project artifacts using Vercel's build system
6. **Deploy** - Deploys the pre-built artifacts to Vercel
7. **Create Summary** - Generates a detailed deployment summary with the URL

### Deployment Output

After a successful deployment, the workflow provides:
- ✅ Deployment status (success/failure)
- 🔗 Live deployment URL
- 👤 User who triggered the deployment
- 📝 Commit SHA that was deployed
- 🌍 Target environment (production/preview)

## Environment Variables

The workflow uses the `workflow_dispatch` trigger which allows manual execution with inputs:

- **environment**: Choose between `production` or `preview` deployment
  - `production`: Deploys to your main production domain (e.g., yourapp.vercel.app)
  - `preview`: Creates a unique preview URL for testing (e.g., yourapp-git-branch.vercel.app)

## Features

- ✨ **One-Click Deployment** - Deploy with a single button click
- 🔄 **Environment Selection** - Choose production or preview environments
- 📊 **Deployment Summary** - View detailed deployment information
- 🔗 **Direct URL Access** - Get the deployment URL immediately after deploy
- ⚡ **Optimized Build** - Uses Vercel's prebuilt deployment for speed
- 💾 **Smart Caching** - Caches Node modules for faster subsequent runs

## Notes

- The workflow uses Vercel CLI's `--prebuilt` flag for faster deployments
- Production deployments use the `--prod` flag to deploy to your production domain
- Preview deployments create a unique preview URL for each deployment
- Build artifacts are cached between workflow runs for improved performance
- The workflow runs on `ubuntu-latest` for consistency and reliability

## Troubleshooting

If the deployment fails:

1. Verify all required secrets are correctly set
2. Check that the Vercel token has appropriate permissions
3. Ensure the project is properly linked to Vercel
4. Review the workflow logs for specific error messages

## Local Testing

To test the deployment process locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```
