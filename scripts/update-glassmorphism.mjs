#!/usr/bin/env node
/**
 * Batch update components to use Glassmorphism
 * Adds glass prop to Card components in Pro features
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Files that should use glass for Pro users
const proComponentFiles = [
  'src/components/contractor/EnhancedCRMDashboard.tsx',
  'src/components/contractor/InvoiceManager.tsx',
  'src/components/contractor/CompanyRevenueDashboard.tsx',
  'src/components/contractor/FeeSavingsDashboard.tsx',
  'src/components/contractor/BidIntelligence.tsx',
  'src/components/contractor/DailyBriefing.tsx',
  'src/components/contractor/EnhancedDailyBriefing.tsx',
  'src/components/contractor/AutomationRunner.tsx',
  'src/components/contractor/FollowUpSequences.tsx',
  'src/components/contractor/ReportingSuite.tsx',
  'src/components/contractor/EnhancedExpenseTracking.tsx',
  'src/components/contractor/RouteBuilder.tsx',
];

// Patterns to update
const patterns = [
  // Update Card components in Pro files to add glass={isPro}
  {
    // Find: <Card className="..." or <Card>
    // When in Pro component, add glass={isPro}
    find: /<Card(\s+className="[^"]*")?\s*(?:glass=\{isPro\})?>/g,
    replace: (match, className = '') => {
      // If glass prop already exists, don't duplicate
      if (match.includes('glass={isPro}')) return match;
      // Otherwise add it
      return className 
        ? `<Card${className} glass={isPro}>`
        : `<Card glass={isPro}>`;
    },
    condition: (filePath) => proComponentFiles.some(f => filePath.includes(f))
  },
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file is a Pro component
    const isProFile = proComponentFiles.some(f => filePath.includes(f));
    
    if (isProFile) {
      // Ensure isPro variable exists
      if (!content.includes('const isPro') && !content.includes('user.isPro')) {
        // Find component function and add isPro after user destructuring
        const userMatch = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:memo\()?function\s*\w*)\s*\([^)]*\{[^}]*user[^}]*\}/);
        if (userMatch) {
          // Try to add isPro variable after user usage
          const lines = content.split('\n');
          let userLineIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('user:') || lines[i].includes('user }')) {
              userLineIndex = i;
              break;
            }
          }
          if (userLineIndex >= 0) {
            // Find next line after component start
            const componentStart = content.indexOf('export') || content.indexOf('function');
            const afterStart = content.indexOf('\n', componentStart) + 1;
            const beforeProps = content.substring(0, afterStart);
            const afterProps = content.substring(afterStart);
            
            // Find where state hooks start (after component declaration)
            const hookMatch = afterProps.match(/(const|let)\s+\[/);
            if (hookMatch) {
              const insertPos = afterProps.indexOf(hookMatch[0]);
              const newContent = afterProps.substring(0, insertPos) +
                '  const isPro = user.isPro || false\n' +
                afterProps.substring(insertPos);
              content = beforeProps + newContent;
              modified = true;
            }
          }
        }
      }

      // Update Card components to include glass={isPro}
      // Only if isPro variable exists in the file
      if (content.includes('const isPro') || content.includes('user.isPro')) {
        // Replace Card components that don't have glass prop
        const cardPattern = /<Card(\s+(?:key|className)="[^"]*")?\s*(?![^>]*glass=)(\s*\/>|\s*>)/g;
        const newContent = content.replace(cardPattern, (match) => {
          if (match.includes('glass=')) return match; // Already has glass
          if (match.includes('/>')) {
            return match.replace('/>', ' glass={isPro} />');
          }
          return match.replace('>', ' glass={isPro}>');
        });
        
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔄 Updating components for Glassmorphism...\n');

let updatedCount = 0;
for (const file of proComponentFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      updatedCount++;
    }
  }
}

console.log(`\n✅ Updated ${updatedCount} files`);
