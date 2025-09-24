#!/usr/bin/env node
/**
 * Development/Production Data Switcher
 * Usage: node scripts/dev-switch.js [dev|prod]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const mode = args[0] || 'dev';

const dataDir = path.join(__dirname, '../src/app/data');
const publicDataDir = path.join(__dirname, '../public/data');

function copyData(source, dest) {
  try {
    const data = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(dest, data);
    console.log(`✅ Copied ${path.basename(source)} to ${path.basename(dest)}`);
  } catch (error) {
    console.error(`❌ Failed to copy ${source}:`, error.message);
  }
}

function switchToMode(targetMode) {
  if (targetMode === 'dev') {
    console.log('🚀 Switching to DEVELOPMENT mode...');
    console.log('- Development data will be used');
    console.log('- DevIndicator will show');
    console.log('- Console logs enabled');
  } else {
    console.log('📱 Switching to PRODUCTION mode...');
    console.log('- Production data will be used');
    console.log('- DevIndicator hidden');
    console.log('- Console logs minimized');
  }

  // Ensure public data directory exists
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  // Copy current data files to public directory
  copyData(
    path.join(dataDir, 'ode-islands.json'),
    path.join(publicDataDir, 'ode-islands.json')
  );

  copyData(
    path.join(dataDir, 'ode-islands.dev.json'),
    path.join(publicDataDir, 'ode-islands.dev.json')
  );

  console.log(`\n🎉 Switched to ${targetMode.toUpperCase()} mode!`);

  if (targetMode === 'dev') {
    console.log('\n💡 Tips:');
    console.log('- Edit src/app/data/ode-islands.dev.json for dev changes');
    console.log('- Add ?dev=true to any URL to force dev mode');
    console.log('- Look for 🚀 indicator in top-left corner');
  }
}

if (mode === 'dev' || mode === 'development') {
  switchToMode('dev');
} else if (mode === 'prod' || mode === 'production') {
  switchToMode('prod');
} else {
  console.log('Usage: node scripts/dev-switch.js [dev|prod]');
  process.exit(1);
}