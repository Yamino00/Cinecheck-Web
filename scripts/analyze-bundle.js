#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔍 Analyzing Cinecheck bundle size and performance...\n')

// Install bundle analyzer if not present
try {
  require.resolve('@next/bundle-analyzer')
} catch {
  console.log('📦 Installing @next/bundle-analyzer...')
  execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' })
}

// Create next.config.js with bundle analyzer
const nextConfigPath = path.join(process.cwd(), 'next.config.js')
const originalConfig = fs.readFileSync(nextConfigPath, 'utf8')

const analyzerConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

${originalConfig.replace('module.exports = nextConfig', 'const nextConfig = ' + originalConfig.split('const nextConfig = ')[1])}

module.exports = withBundleAnalyzer(nextConfig)
`

// Backup original config
fs.writeFileSync(nextConfigPath + '.backup', originalConfig)
fs.writeFileSync(nextConfigPath, analyzerConfig)

console.log('🚀 Building with bundle analyzer...')
try {
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' })
} catch (error) {
  console.error('❌ Build failed:', error.message)
} finally {
  // Restore original config
  fs.writeFileSync(nextConfigPath, originalConfig)
  fs.unlinkSync(nextConfigPath + '.backup')
}

console.log('\n✅ Analysis complete! Check the opened browser tabs for detailed bundle analysis.')