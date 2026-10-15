const fs = require('fs');

const filePath = 'd:/vmovexa/frontend/src/pages/advertiser/CampaignsListPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports if not present
if (!content.includes('RefreshButton')) {
  content = content.replace(
    /import { Pagination } from '\.\.\/\.\.\/components\/ui\/Pagination';/,
    "import { Pagination } from '../../components/ui/Pagination';\nimport { RefreshButton } from '../../components/ui/RefreshButton';\nimport { ViewModeToggle } from '../../components/ui/ViewModeToggle';"
  );
}

// 2. Replace Header Refresh Button
content = content.replace(
  /<button[\s\S]*?onClick=\{handleRefresh\}[\s\S]*?title="Refresh Campaigns"[\s\S]*?<\/button>/,
  `<RefreshButton onClick={handleRefresh} loading={refreshing} />`
);

// 3. Replace View Mode Toggle
content = content.replace(
  /<div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200\/80 shrink-0">[\s\S]*?<\/div>/,
  `<ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />`
);

// 4. Replace Empty State Refresh Button
content = content.replace(
  /<button[\s\S]*?onClick=\{handleRefresh\}[\s\S]*?disabled=\{refreshing\}[\s\S]*?<span>\{refreshing \? t\('common\.refreshing', 'Refreshing\.\.\.'\) : t\('campaigns_list\.refresh_list', 'Refresh List'\)\}<\/span>[\s\S]*?<\/button>/,
  `<RefreshButton onClick={handleRefresh} loading={refreshing} label={t('campaigns_list.refresh_list', 'Refresh List')} />`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('CampaignsListPage.jsx updated successfully!');
