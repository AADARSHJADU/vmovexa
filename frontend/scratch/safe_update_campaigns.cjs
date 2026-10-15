const fs = require('fs');

const filePath = 'd:/vmovexa/frontend/src/pages/advertiser/CampaignsListPage.jsx';
const raw = fs.readFileSync(filePath, 'utf8');
const isCRLF = raw.includes('\r\n');
const lines = raw.split(/\r?\n/);

// Find and replace header refresh button (starts with <button and has title="Refresh Campaigns")
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title="Refresh Campaigns"')) {
    // Find enclosing button start and end
    let start = i;
    while (start >= 0 && !lines[start].includes('<button')) start--;
    let end = i;
    while (end < lines.length && !lines[end].includes('</button>')) end++;
    lines.splice(start, end - start + 1, "          <RefreshButton onClick={handleRefresh} loading={refreshing} />");
    console.log('Header refresh replaced at line', start);
    break;
  }
}

// Find and replace empty state refresh button (has Refresh List)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("t('campaigns_list.refresh_list'")) {
    let start = i;
    while (start >= 0 && !lines[start].includes('<button')) start--;
    let end = i;
    while (end < lines.length && !lines[end].includes('</button>')) end++;
    lines.splice(start, end - start + 1, "            <RefreshButton onClick={handleRefresh} loading={refreshing} label={t('campaigns_list.refresh_list', 'Refresh List')} />");
    console.log('Empty state refresh replaced at line', start);
    break;
  }
}

const newline = isCRLF ? '\r\n' : '\n';
fs.writeFileSync(filePath, lines.join(newline), 'utf8');
console.log('Done!');
