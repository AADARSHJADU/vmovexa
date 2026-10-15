const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'scratch'].includes(item)) {
        files.push(...walk(full));
      }
    } else if (full.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
}

const all = walk('d:/vmovexa/frontend/src');
console.log('Total JSX files scanned:', all.length);

const results = {
  hasRefreshIcon: [],
  hasViewToggleWords: [],
  rawRefreshEmoji: [],
  brokenImports: []
};

all.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = filePath.replace(/\\/g, '/').replace('d:/vmovexa/frontend/src/', '');

  if (rel.includes('components/ui/RefreshButton') || rel.includes('components/ui/ViewModeToggle')) return;

  // 1. Check for FleetIcons.Refresh usage outside of RefreshButton
  if (content.includes('FleetIcons.Refresh')) {
    // Check line by line
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('FleetIcons.Refresh')) {
        results.hasRefreshIcon.push({ file: rel, line: idx + 1, content: line.trim() });
      }
    });
  }

  // 2. Check for ViewMode toggles not using ViewModeToggle
  const mentionsViewMode = content.includes('viewMode') || content.includes('setViewMode');
  const mentionsCardOrGrid = content.includes("'grid'") || content.includes('"grid"') || content.includes("'card'") || content.includes('"card"');
  const mentionsTableOrList = content.includes("'table'") || content.includes('"table"') || content.includes("'list'") || content.includes('"list"');

  if (mentionsViewMode && mentionsCardOrGrid && mentionsTableOrList && !content.includes('ViewModeToggle')) {
    results.hasViewToggleWords.push(rel);
  }

  // 3. Raw emoji 🔄
  if (content.includes('🔄')) {
    results.rawRefreshEmoji.push(rel);
  }

  // 4. Broken imports
  if (content.includes('<RefreshButton') && !content.includes('RefreshButton')) {
    results.brokenImports.push({ file: rel, item: 'RefreshButton' });
  }
  if (content.includes('<ViewModeToggle') && !content.includes('ViewModeToggle')) {
    results.brokenImports.push({ file: rel, item: 'ViewModeToggle' });
  }
});

console.log('\n--- SCAN RESULTS ---');
console.log('1. Files with FleetIcons.Refresh outside of RefreshButton.jsx:');
results.hasRefreshIcon.forEach(r => console.log(`   ${r.file}:${r.line} -> ${r.content}`));

console.log('\n2. Unmigrated ViewMode Toggles:');
results.hasViewToggleWords.forEach(r => console.log(`   ${r}`));

console.log('\n3. Raw Refresh Emoji (🔄):');
results.rawRefreshEmoji.forEach(r => console.log(`   ${r}`));

console.log('\n4. Broken imports:');
results.brokenImports.forEach(r => console.log(`   ${r.file}: ${r.item}`));
