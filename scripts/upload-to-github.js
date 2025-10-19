#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_EMAIL = process.env.GITHUB_EMAIL || `${process.env.GITHUB_USERNAME}@users.noreply.github.com`;
const REPO_NAME = process.argv[2] || 'ProposalBox';

if (!GITHUB_PAT || !GITHUB_USERNAME) {
  console.error('❌ Error: GITHUB_PAT and GITHUB_USERNAME must be set in .env file');
  process.exit(1);
}

const exec = (cmd, silent = false) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (err) {
    if (!silent) throw err;
    return null;
  }
};

async function createGitHubRepo() {
  console.log('📝 Creating GitHub repository...');

  const checkCmd = `curl -s -H "Authorization: token ${GITHUB_PAT}" "https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}"`;
  const checkResult = exec(checkCmd, true);

  if (checkResult && checkResult.includes('"name"')) {
    console.log(`✅ Repository already exists: ${GITHUB_USERNAME}/${REPO_NAME}`);
    return true;
  }

  const createCmd = `curl -s -X POST "https://api.github.com/user/repos" \
    -H "Authorization: token ${GITHUB_PAT}" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"name":"${REPO_NAME}","description":"Privacy-preserving governance platform with FHE encryption using Zama FHEVM","private":false,"auto_init":false}'`;

  const createResult = exec(createCmd, true);

  if (createResult && createResult.includes('"name"')) {
    console.log(`✅ GitHub repository created: ${GITHUB_USERNAME}/${REPO_NAME}`);
    return true;
  } else {
    console.error('❌ Failed to create repository');
    console.error('Response:', createResult);
    return false;
  }
}

async function pushToGitHub() {
  console.log('\n📤 Pushing code to GitHub...');

  const gitUrl = `https://${GITHUB_PAT}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git`;

  // Configure Git user identity
  console.log('👤 Configuring Git identity...');
  exec(`git config user.name "${GITHUB_USERNAME}"`);
  exec(`git config user.email "${GITHUB_EMAIL}"`);

  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    console.log('🔧 Initializing git repository...');
    exec('git init');
    exec('git branch -M main');
  }

  // Remove existing origin
  exec('git remote remove origin 2>/dev/null || true', true);

  // Add new origin with PAT
  console.log('🔗 Setting up remote origin...');
  exec(`git remote add origin ${gitUrl}`);

  // Remove .env file before committing
  if (fs.existsSync('.env')) {
    console.log('🗑️  Removing .env file...');
    fs.unlinkSync('.env');
  }

  // Add all files
  console.log('📦 Adding files...');
  exec('git add .');

  // Check if there are changes to commit
  const status = exec('git status --porcelain', true);
  if (status && status.trim()) {
    console.log('💾 Committing changes...');
    exec('git commit -m "Upload ProposalBox - Privacy-preserving governance with FHE encryption"');
  } else {
    console.log('ℹ️  No changes to commit');
  }

  // Push to GitHub
  console.log('🚀 Pushing to GitHub...');
  exec('git push -u origin main --force');

  console.log(`\n✅ Successfully pushed to: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}`);
}

async function main() {
  console.log('🚀 GitHub Upload Script');
  console.log('=' .repeat(50));
  console.log(`Repository: ${GITHUB_USERNAME}/${REPO_NAME}\n`);

  try {
    const created = await createGitHubRepo();
    if (!created) {
      console.error('❌ Repository creation failed');
      process.exit(1);
    }

    await pushToGitHub();
    console.log('\n✨ Upload completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
