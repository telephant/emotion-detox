#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps manage environment variables for different environments
 */

const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = {
  development: '.env.local',
  staging: '.env.staging',
  production: '.env.production',
};

function copyEnvFile(environment) {
  const envFile = ENVIRONMENTS[environment];
  
  if (!envFile) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(ENVIRONMENTS).join(', '));
    process.exit(1);
  }

  const sourcePath = path.join(__dirname, '..', envFile);
  const targetPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    process.exit(1);
  }

  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Environment set to: ${environment}`);
    console.log(`📁 Copied ${envFile} to .env`);
    
    // Show current configuration
    showCurrentConfig();
  } catch (error) {
    console.error(`❌ Failed to copy environment file:`, error.message);
    process.exit(1);
  }
}

function showCurrentConfig() {
  try {
    // Read the current .env file
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      );
      
      console.log('\n📋 Current Configuration:');
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          console.log(`  ${key.trim()}: ${value.trim()}`);
        }
      });
    }
  } catch (error) {
    console.warn('⚠️ Could not read current configuration:', error.message);
  }
}

function showHelp() {
  console.log(`
🌍 Environment Setup Script

Usage:
  node scripts/env-setup.js <environment>

Available environments:
  development  - Use .env.local (local development)
  staging      - Use .env.staging (staging environment)
  production   - Use .env.production (production environment)

Examples:
  node scripts/env-setup.js development
  node scripts/env-setup.js staging
  node scripts/env-setup.js production

This script will copy the specified environment file to .env
which will be used by Expo for environment variables.
`);
}

// Main execution
const environment = process.argv[2];

if (!environment || environment === '--help' || environment === '-h') {
  showHelp();
  process.exit(0);
}

copyEnvFile(environment);
