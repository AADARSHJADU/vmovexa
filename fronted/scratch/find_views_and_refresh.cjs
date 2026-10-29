const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (full.endsWith('.jsx') || full.endsWith('.js')) files.push(full);
  }
  return files;
}

const allFiles = walk('d:/vmovexa/frontend/src/pages');

console.log('--- SCANNING FILES ---');
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/').replace('d:/vmovexa/frontend/src/pages/', '');
  
  const hasRefreshButtonComponent = content.includes('<RefreshButton');
  const hasViewModeToggleComponent = content.includes('<ViewModeToggle');
  
  const hasManualRefresh = (
    (/<button[^>]*>[\s\S]*?(Refresh|refresh)[\s\S]*?<\/button>/.test(content) ||
     content.includes('FleetIcons.Refresh') ||
     content.includes('IconRefresh') ||
     content.includes('RotateCw') ||
     content.includes('RefreshCw')
    ) && !hasRefreshButtonComponent
  );
  
  const hasManualViewMode = (
    (content.includes('viewMode') ||
     content.includes('TableView') ||
     content.includes('CardView') ||
     content.includes('IconGrid') ||
     content.includes('IconList')
    ) && !hasViewModeToggleComponent
  );
  
  if (hasManualRefresh || hasManualViewMode) {
    console.log(`FILE: ${rel}`);
    if (hasManualRefresh) console.log(`  -> Needs RefreshButton standard`);
    if (hasManualViewMode) console.log(`  -> Needs ViewModeToggle standard`);
  }
});
