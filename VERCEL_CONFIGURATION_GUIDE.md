# Vercel Configuration Guide - Main Branch Only Deployment

## Overview

This repository is now configured to deploy **ONLY from the main branch** to Vercel. All other branches are disabled to maintain focus on the MVP (Minimum Viable Product) and ensure production stability.

## Changes Made

### 1. Repository Configuration Files

#### `vercel.json`
Added Git deployment configuration to restrict deployments:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

This configuration tells Vercel to:
- ✅ Deploy from `main` branch
- ❌ Ignore all other branches

#### `.github/workflows/deploy-vercel.yml`
Streamlined GitHub Actions workflow to:
- Only trigger on pushes to `main` branch
- Removed pull request triggers
- Removed manual workflow dispatch
- Always deploy with `--prod` flag

### 2. Vercel Dashboard Configuration (Manual Steps Required)

To ensure complete enforcement, you may need to verify/update settings in the Vercel Dashboard:

#### Step 1: Access Project Settings
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: `fairtradeworker-texa`
3. Go to **Settings** → **Git**

#### Step 2: Configure Production Branch
1. Under **Production Branch**, ensure it is set to: `main`
2. This ensures only commits to `main` trigger production deployments

#### Step 3: Disable Preview Deployments (Optional but Recommended)
1. Under **Git** settings, look for **Preview Deployments**
2. You can optionally disable preview deployments for all branches except `main`
3. This prevents accidental deployments from feature branches

#### Step 4: Ignored Build Step (Optional)
If you want to add an additional safety layer, you can configure the "Ignored Build Step" in Settings → Git:

```bash
# Only build from main branch
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
```

This command will:
- Build if on `main` branch
- Skip build for all other branches

### 3. Environment Variables
Ensure all production environment variables are set in Vercel Dashboard:

**Required Secrets:**
- `VERCEL_TOKEN` - Vercel authentication token (already in GitHub Secrets)
- `VERCEL_ORG_ID` - Vercel organization ID (already in GitHub Secrets)
- `VERCEL_PROJECT_ID` - Vercel project ID (already in GitHub Secrets)

**Application Environment Variables (Set in Vercel Dashboard):**
- Stripe API keys (when ready)
- OpenAI API keys (when ready)
- Twilio configuration (when ready)
- SendGrid API key (when ready)
- Supabase connection strings

## Deployment Flow

### Current Flow (Main Branch Only)

```
Code Push to 'main'
    ↓
GitHub Actions Triggered
    ↓
Install Vercel CLI
    ↓
Pull Vercel Environment (production)
    ↓
Build with --prod flag
    ↓
Deploy to Production
    ↓
Live on Production URL
```

### Disabled Flows

❌ **Pull Request Deployments** - No longer trigger preview deployments  
❌ **Manual Workflow Dispatch** - No manual trigger available  
❌ **Feature Branch Deployments** - No deployments from non-main branches

## Testing Changes Before Main

Since preview deployments are disabled, follow this workflow for testing:

1. **Local Development**
   ```bash
   npm run dev
   ```
   Test thoroughly on `localhost:5173`

2. **Local Production Build**
   ```bash
   npm run build
   npm run preview
   ```
   Test production build locally

3. **Merge to Main**
   Only after thorough local testing, merge to `main` to trigger deployment

## VOID System - Deprioritization

The VOID Desktop System (advanced UI interface) has been deprioritized to focus on core marketplace MVP features:

- VOID features remain in the codebase but are not actively developed
- All development resources focused on:
  - Job posting system
  - Contractor CRM
  - Payment processing
  - Core marketplace functionality

## Troubleshooting

### Issue: Other branches are still deploying

**Solution:**
1. Check Vercel Dashboard → Settings → Git
2. Verify Production Branch is set to `main`
3. Verify `vercel.json` has the git configuration
4. Check if there are any legacy deployment hooks

### Issue: Deployments failing from main

**Solution:**
1. Check GitHub Actions logs: Actions → Deploy to Vercel
2. Verify secrets are correctly set in repository settings
3. Check Vercel dashboard for deployment logs
4. Ensure `vercel.json` syntax is valid (JSON validation)

### Issue: Need to test a feature before merging to main

**Solution:**
1. Test locally with `npm run dev`
2. Test production build locally with `npm run build && npm run preview`
3. Only merge to main after comprehensive local testing

## Benefits of Main-Only Deployment

✅ **Simplified Workflow** - One branch, one deployment path  
✅ **Production Stability** - No accidental deployments from feature branches  
✅ **MVP Focus** - Forces discipline to ship only production-ready code  
✅ **Cost Efficiency** - Reduces build minutes and deployment costs  
✅ **Clear Deployment History** - All production deploys are from main commits

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment overview and workflow
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current project status and MVP focus
- [README.md](./README.md) - Project overview
- [vercel.json](./vercel.json) - Vercel configuration file
- [.github/workflows/deploy-vercel.yml](./.github/workflows/deploy-vercel.yml) - GitHub Actions workflow

## Support

If you need to temporarily deploy from another branch for testing:
1. This is intentionally not supported to maintain MVP focus
2. Test locally instead using `npm run dev` or `npm run preview`
3. If absolutely necessary, temporarily modify `vercel.json` and workflow, but revert immediately after

---

**Last Updated:** December 19, 2025  
**Status:** Main-only deployment configured and active
