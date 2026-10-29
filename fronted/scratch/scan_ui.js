import fs from 'fs';
import path from 'path';

function searchDir(dir, filterFn, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        searchDir(full, filterFn, list);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(full, 'utf8');
      if (filterFn(content, entry.name)) {
        list.push({ path: full, rel: path.relative('d:/vmovexa/frontend', full) });
      }
    }
  }
  return list;
}

console.log('=== SEARCHING FOR VIEW MODE TOGGLES ===');
const viewModeFiles = searchDir('d:/vmovexa/frontend/src', (content) => {
  return (
    content.includes('TableView') ||
    content.includes('CardView') ||
    content.includes('setViewMode') ||
    /viewMode\s*===/i.test(content) ||
    /title=["'](Table View|Card View|Grid View|List View)["']/i.test(content) ||
    (content.includes('viewMode') && (content.includes('table') || content.includes('grid') || content.includes('card') || content.includes('list')))
  );
});

viewModeFiles.forEach(f => console.log('VIEW_MODE: ' + f.rel));

console.log('\n=== SEARCHING FOR REFRESH BUTTONS ===');
const refreshFiles = searchDir('d:/vmovexa/frontend/src', (content) => {
  return (
    /<button[^>]*>[^<]*Refresh[^<]*<\/button>/i.test(content) ||
    (content.includes('handleRefresh') && content.includes('<button')) ||
    (content.includes('onRefresh') && content.includes('<button')) ||
    /title=["'][^"']*Refresh[^"']*["']/i.test(content) ||
    (content.includes('FleetIcons.Refresh') && content.includes('<button')) ||
    (content.includes('FleetIcons.RefreshCw') && content.includes('<button'))
  );
});

refreshFiles.forEach(f => console.log('REFRESH: ' + f.rel));
