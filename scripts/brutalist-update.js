/**
 * Brutalist Design Update Script
 * 
 * This script helps identify and update components to follow brutalist design principles.
 * Run with: node scripts/brutalist-update.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to find and replace
const patterns = [
  // Rounded corners
  { find: /rounded-xl/g, replace: 'rounded-none' },
  { find: /rounded-2xl/g, replace: 'rounded-none' },
  { find: /rounded-lg/g, replace: 'rounded-none' },
  { find: /rounded-md/g, replace: 'rounded-none' },
  { find: /rounded-full/g, replace: 'rounded-none' },
  
  // Soft shadows
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
  
  // Transparency in backgrounds
  { find: /bg-black\/\d+/g, replace: 'bg-black' },
  { find: /bg-white\/\d+/g, replace: 'bg-white dark:bg-black' },
  { find: /bg-background\/\d+/g, replace: 'bg-white dark:bg-black' },
  { find: /backdrop-blur-\w+/g, replace: '' },
  
  // Opacity
  { find: /opacity-70/g, replace: 'opacity-100' },
  { find: /opacity-90/g, replace: 'opacity-100' },
  { find: /opacity-50/g, replace: 'opacity-100' },
  
  // Text opacity
  { find: /text-black\/\d+/g, replace: 'text-black dark:text-white' },
  { find: /text-white\/\d+/g, replace: 'text-white dark:text-black' },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    patterns.forEach(({ find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Main execution
if (require.main === module) {
  console.log('Brutalist Design Update Script');
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
  
  console.log(`\nUpdated ${updatedCount} files.`);
}

module.exports = { updateFile, patterns };
