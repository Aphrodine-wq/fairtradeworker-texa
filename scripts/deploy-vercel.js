#!/usr/bin/env node

/**
 * Vercel Deployment Script (Cross-platform)
 * This script triggers a production deployment to Vercel
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function deploy() {
  try {
    console.log('🚀 Starting Vercel deployment...\n');

    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Vercel CLI is not installed.');
      console.log('📦 Installing Vercel CLI...\n');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Check if user is logged in
    try {
      execSync('vercel whoami', { stdio: 'ignore' });
    } catch (error) {
      console.log('⚠️  Not logged in to Vercel. Please log in...\n');
      execSync('vercel login', { stdio: 'inherit' });
    }

    // Confirm deployment
    const answer = await question('⚠️  Deploy to production? (y/N) ');
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Deployment cancelled.');
      rl.close();
      process.exit(1);
    }

    // Deploy to production
    console.log('\n📦 Building and deploying to Vercel...\n');
    execSync('vercel --prod', { stdio: 'inherit' });

    console.log('\n✅ Deployment complete!');
    console.log('🔗 Check your Vercel dashboard for deployment status.\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

deploy();
