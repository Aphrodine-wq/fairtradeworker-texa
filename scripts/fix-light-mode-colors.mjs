/**
 * Fix Light Mode Color Issues - Comprehensive Script
 * 
 * Replaces text-foreground and text-muted-foreground with explicit colors
 * Fixes border transparency issues
 * Ensures all text is visible in light mode
 * 
 * Run with: node scripts/fix-light-mode-colors.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Patterns to find and replace
const patterns = [
  // Text colors - replace CSS variables with explicit colors
  { find: /\btext-foreground\b/g, replace: 'text-black dark:text-white' },
  { find: /\btext-muted-foreground\b/g, replace: 'text-black dark:text-white' },
  
  // Border transparency - convert to solid borders
  { find: /border border-black\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border border-white\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border-2 border-black\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border-2 border-white\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border.*border-black\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border.*border-white\/10/g, replace: 'border-2 border-black dark:border-white' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;
    
    patterns.forEach(({ find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        modified = true;
      }
    });
    
    // Clean up multiple spaces BUT preserve newlines
    // Don't remove newlines - they're important for code formatting
    // Only clean up extra spaces on the same line
    
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Main execution
console.log('🎨 Fix Light Mode Colors Script');
console.log('================================\n');

const srcDir = path.join(__dirname, '..', 'src');
const files = walkDir(srcDir);

console.log(`Found ${files.length} files to check...\n`);

let updatedCount = 0;
files.forEach(file => {
  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Updated ${updatedCount} files.`);
console.log('⚠️  Please review changes and test before committing.');
