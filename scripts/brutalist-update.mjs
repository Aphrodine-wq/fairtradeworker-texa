/**
 * Brutalist Design Update Script (ES Module)
 * 
 * This script helps identify and update components to follow brutalist design principles.
 * Run with: node scripts/brutalist-update.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Patterns to find and replace
const patterns = [
  // Rounded corners
  { find: /rounded-xl/g, replace: 'rounded-none' },
  { find: /rounded-2xl/g, replace: 'rounded-none' },
  { find: /rounded-lg/g, replace: 'rounded-none' },
  { find: /rounded-md/g, replace: 'rounded-none' },
  { find: /rounded-sm/g, replace: 'rounded-none' },
  { find: /rounded-full/g, replace: 'rounded-none' },
  
  // Soft shadows - replace with brutalist hard shadows
  { find: /shadow-sm/g, replace: 'shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_#fff]' },
  { find: /shadow-md/g, replace: 'shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]' },
  { find: /shadow-lg/g, replace: 'shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#fff]' },
  { find: /shadow-xl/g, replace: 'shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_#fff]' },
  { find: /hover:shadow-md/g, replace: 'hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff]' },
  { find: /hover:shadow-lg/g, replace: 'hover:shadow-[6px_6px_0_#000] dark:hover:shadow-[6px_6px_0_#fff]' },
  { find: /hover:shadow-xl/g, replace: 'hover:shadow-[8px_8px_0_#000] dark:hover:shadow-[8px_8px_0_#fff]' },
  
  // Transparency in borders
  { find: /border border-black\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border border-white\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border-2 border-black\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border-2 border-white\/10/g, replace: 'border-2 border-black dark:border-white' },
  { find: /border border-border/g, replace: 'border-2 border-black dark:border-white' },
  
  // Transparency in backgrounds - be careful with these
  // Only replace common patterns, manual review needed for complex cases
  { find: /bg-muted\/50/g, replace: 'bg-muted' },
  { find: /bg-accent\/5/g, replace: 'bg-white dark:bg-black' },
  { find: /bg-accent\/10/g, replace: 'bg-white dark:bg-black' },
  { find: /bg-accent\/20/g, replace: 'bg-white dark:bg-black' },
  { find: /bg-background\/50/g, replace: 'bg-white dark:bg-black' },
  { find: /bg-background\/95/g, replace: 'bg-white dark:bg-black' },
  
  // Backdrop blur - remove for brutalist
  { find: /backdrop-blur-sm/g, replace: '' },
  { find: /backdrop-blur-md/g, replace: '' },
  { find: /backdrop-blur-lg/g, replace: '' },
  { find: /backdrop-blur-xl/g, replace: '' },
  
  // Opacity - make fully opaque
  { find: /opacity-70/g, replace: 'opacity-100' },
  { find: /opacity-90/g, replace: 'opacity-100' },
  { find: /opacity-50/g, replace: 'opacity-100' },
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
    
    // Clean up multiple spaces that might result from removals
    content = content.replace(/\s{2,}/g, ' ');
    
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
console.log('🔨 Brutalist Design Update Script');
console.log('==================================\n');

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
