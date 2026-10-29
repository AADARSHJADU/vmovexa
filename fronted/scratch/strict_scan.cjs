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

console.log('--- STRICT SCANNING FOR UNMIGRATED BUTTONS ---');

const strictRefreshRegex = /<button[^>]*>(?:(?!<\/button>)[\s\S])*?(Refresh|refresh|RefreshCw|RotateCw)(?:(?!<\/button>)[\s\S])*?<\/button>/i;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/').replace('d:/vmovexa/frontend/src/pages/', '');
  
  const hasRefreshButtonComponent = content.includes('<RefreshButton');
  const hasViewModeToggleComponent = content.includes('<ViewModeToggle');
  
  const hasManualRefresh = strictRefreshRegex.test(content) && !hasRefreshButtonComponent;
  
  const hasManualViewMode = (
    (content.includes('viewMode') ||
     content.includes('TableView') ||
     content.includes('CardView')
    ) && !hasViewModeToggleComponent
  );
  
  if (hasManualRefresh || hasManualViewMode) {
    console.log(`FILE: ${rel}`);
    if (hasManualRefresh) console.log(`  -> Needs RefreshButton`);
    if (hasManualViewMode) console.log(`  -> Needs ViewModeToggle`);
  }
});
