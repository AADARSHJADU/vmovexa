const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
        files.push(...walk(full));
      }
    } else if (full.endsWith('.jsx') || full.endsWith('.tsx') || (full.endsWith('.js') && !full.includes('.config.'))) {
      files.push(full);
    }
  }
  return files;
}

const allSrcFiles = walk('d:/vmovexa/frontend/src');

console.log(`Total files scanned: ${allSrcFiles.length}`);

const strictRefreshRegex = /<button[^>]*>(?:(?!<\/button>)[\s\S])*?(Refresh|refresh|RefreshCw|RotateCw|🔄)(?:(?!<\/button>)[\s\S])*?<\/button>/i;

const potentialRefreshFiles = [];
const potentialViewModeFiles = [];

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/').replace('d:/vmovexa/frontend/src/', '');

  // Skip the standardized components themselves
  if (rel.includes('RefreshButton.jsx') || rel.includes('ViewModeToggle.jsx')) return;

  // Check refresh buttons
  const match = content.match(strictRefreshRegex);
  if (match) {
    // Check if it's already using RefreshButton
    const buttonStr = match[0];
    // Filter out obvious false positives like reset form / cancel
    if (!buttonStr.toLowerCase().includes('reset') && !buttonStr.toLowerCase().includes('restore')) {
      potentialRefreshFiles.push({ file: rel, match: buttonStr.replace(/\s+/g, ' ').substring(0, 120) });
    }
  }

  // Check viewMode toggle
  if ((content.includes('setViewMode') || content.includes('viewMode === \'grid\'') || content.includes('viewMode === \'card\'')) && !content.includes('<ViewModeToggle')) {
    potentialViewModeFiles.push(rel);
  }
});

console.log('\n--- POTENTIAL MANUAL REFRESH BUTTONS ---');
potentialRefreshFiles.forEach(p => console.log(`${p.file}: ${p.match}`));

console.log('\n--- POTENTIAL MANUAL VIEW MODE TOGGLES ---');
potentialViewModeFiles.forEach(p => console.log(p));
