#!/usr/bin/env node

/**
 * Build verification script for Campaign Profitability Tracker
 * Checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  '.env.example',
  'netlify.toml',
  'vercel.json',
  'database-schema.sql',
  'README.md',
  'DEPLOYMENT.md',
  'LICENSE',
  'src/app/page.tsx',
  'src/components/elegant-dashboard.tsx',
  'src/lib/supabase.ts',
  'src/lib/database.types.ts',
];

const requiredDirs = [
  'src',
  'src/app',
  'src/components',
  'src/components/ui',
  'src/lib',
  'public',
  '.github',
  '.github/workflows',
];

console.log('🔍 Checking build requirements...\n');

let allGood = true;

// Check required directories
console.log('📁 Checking directories:');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING`);
    allGood = false;
  }
});

console.log('\n📄 Checking files:');
// Check required files
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check package.json content
console.log('\n📦 Checking package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script: ${script}`);
    } else {
      console.log(`❌ Script: ${script} - MISSING`);
      allGood = false;
    }
  });

  const requiredDeps = ['next', 'react', '@supabase/supabase-js'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ Dependency: ${dep}`);
    } else {
      console.log(`❌ Dependency: ${dep} - MISSING`);
      allGood = false;
    }
  });

  const requiredDevDeps = ['tailwindcss', 'typescript'];
  requiredDevDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ Dev Dependency: ${dep}`);
    } else {
      console.log(`❌ Dev Dependency: ${dep} - MISSING`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  allGood = false;
}

// Check environment example
console.log('\n🔐 Checking environment configuration:');
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  if (envExample.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('✅ Supabase URL variable');
  } else {
    console.log('❌ Supabase URL variable - MISSING');
    allGood = false;
  }

  if (envExample.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase anon key variable');
  } else {
    console.log('❌ Supabase anon key variable - MISSING');
    allGood = false;
  }
} catch (error) {
  console.log('❌ Error reading .env.example');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Set up Supabase database (run database-schema.sql)');
  console.log('2. Create .env.local with your Supabase credentials');
  console.log('3. Test locally: npm run dev');
  console.log('4. Push to GitHub');
  console.log('5. Deploy to Netlify/Vercel');
  console.log('\n📖 See DEPLOYMENT.md for detailed instructions.');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}
