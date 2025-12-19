# Vercel Deployment Workflow

This GitHub Actions workflow provides both automatic and manual deployment to Vercel.

## Prerequisites

Before you can use this workflow, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **VERCEL_TOKEN** - Your Vercel authentication token
   - Go to https://vercel.com/account/tokens
   - Create a new token with appropriate permissions
   - Add it to GitHub Secrets: Settings → Secrets and variables → Actions → New repository secret

2. **VERCEL_ORG_ID** - Your Vercel organization ID (optional but recommended)
   - Run `vercel link` in your local project
   - Find the org ID in `.vercel/project.json`

3. **VERCEL_PROJECT_ID** - Your Vercel project ID (optional but recommended)
   - Run `vercel link` in your local project
   - Find the project ID in `.vercel/project.json`

## How to Use

### Automatic Deployments

The workflow automatically triggers on:

1. **Push to main branch** → Deploys to production
2. **Pull requests to main** → Deploys to preview environment

No manual intervention required! Every push to main will automatically deploy to production on Vercel.

### Manual Deployments

You can also trigger deployments manually:

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Select "Deploy to Vercel" from the workflows list
4. Click "Run workflow" button
5. Select the deployment environment:
   - **production** - Deploy to production environment
   - **preview** - Deploy to preview environment
6. Click "Run workflow" to start the deployment

### Workflow Steps

The workflow performs the following steps:

1. **Checkout code** - Checks out the repository code
2. **Setup Node.js** - Sets up Node.js 20 with npm caching
3. **Install Vercel CLI** - Installs the latest Vercel CLI
4. **Pull Vercel Environment** - Pulls environment configuration from Vercel
5. **Build Project** - Builds the project artifacts using Vercel
6. **Deploy** - Deploys the built artifacts to Vercel

## Deployment Behavior

| Trigger Type | Branch | Environment |
|-------------|--------|-------------|
| Push | main | production |
| Pull Request | main | preview |
| Manual | any | user-selected |

## Environment Variables

The workflow intelligently selects the deployment environment:

- **Manual trigger**: Uses the selected environment input
- **Push to main**: Automatically uses production
- **Pull request**: Automatically uses preview

## Notes

- The workflow uses Vercel CLI's `--prebuilt` flag for faster deployments
- Production deployments use the `--prod` flag
- Preview deployments create a unique preview URL
- Build artifacts are cached between workflow runs for faster execution

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
