#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
  } catch (error) {
    log(`Error executing command: ${command}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Error: Please provide S3 bucket name', 'red');
    log('Usage: node scripts/deploy-mobile.js <bucket-name> [aws-profile]');
    log('Example: node scripts/deploy-mobile.js my-mobile-app default');
    process.exit(1);
  }

  const bucketName = args[0];
  const awsProfile = args[1] || 'default';
  const projectRoot = process.cwd();
  const mobileDir = path.join(projectRoot, 'apps', 'mobile');
  const buildDir = path.join(mobileDir, 'dist');

  log('Starting mobile app deployment to S3...', 'yellow');
  log(`Bucket: ${bucketName}`);
  log(`AWS Profile: ${awsProfile}`);
  log('');

  // Check if AWS CLI is installed
  try {
    execCommand('aws --version', { stdio: 'pipe' });
  } catch (error) {
    log('Error: AWS CLI is not installed. Please install AWS CLI first.', 'red');
    process.exit(1);
  }

  // Check AWS configuration
  try {
    execCommand(`aws configure list --profile ${awsProfile}`, { stdio: 'pipe' });
  } catch (error) {
    log(`Error: AWS profile '${awsProfile}' is not configured.`, 'red');
    log(`Please run: aws configure --profile ${awsProfile}`);
    process.exit(1);
  }

  // Enter mobile directory
  process.chdir(mobileDir);

  // Check dependencies
  log('Checking dependencies...', 'yellow');
  if (!fs.existsSync('node_modules')) {
    log('Installing dependencies...');
    execCommand('pnpm install');
  }

  // Build application
  log('Building mobile application...', 'yellow');
  execCommand('pnpm run build:web');

  // Check if build was successful
  if (!fs.existsSync(buildDir)) {
    log('Error: Build failed, dist directory not found', 'red');
    process.exit(1);
  }

  // Sync to S3
  log('Uploading to S3...', 'yellow');
  
  // Upload static assets (set long-term cache)
  execCommand(`aws s3 sync "${buildDir}" "s3://${bucketName}" --profile ${awsProfile} --delete --cache-control "public, max-age=31536000" --exclude "*.html" --exclude "*.json"`);
  
  // Upload HTML and JSON files (set short-term cache)
  execCommand(`aws s3 sync "${buildDir}" "s3://${bucketName}" --profile ${awsProfile} --cache-control "public, max-age=0, must-revalidate" --include "*.html" --include "*.json"`);

  // Configure bucket for static website hosting
  log('Configuring S3 static website hosting...', 'yellow');
  execCommand(`aws s3 website "s3://${bucketName}" --profile ${awsProfile} --index-document index.html --error-document index.html`);

  // Get region information
  let region;
  try {
    region = execSync(`aws configure get region --profile ${awsProfile}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    region = 'us-east-1'; // Default region
  }

  log('Deployment successful!', 'green');
  log(`Website URL: http://${bucketName}.s3-website-${region}.amazonaws.com`);
  log('');
  log('Important notes:', 'yellow');
  log('1. Ensure S3 bucket public access permissions are correctly configured');
  log('2. If you need a custom domain, please configure CloudFront distribution');
  log('3. Production environments should use HTTPS');
}

if (require.main === module) {
  main();
} 