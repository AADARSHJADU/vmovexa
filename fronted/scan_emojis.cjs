const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/pages/superadmin/GlobalUsersPage.jsx',
  'src/pages/superadmin/SuperSubscriptionPlansPage.jsx',
  'src/pages/superadmin/GlobalCampaignsPage.jsx',
  'src/pages/admin/AdminCampaignMappingPage.jsx',
  'src/pages/superadmin/EmergencyBroadcastPage.jsx',
  'src/pages/advertiser/CampaignAnalyticsPage.jsx',
  'src/pages/advertiser/ReportsHubPage.jsx',
  'src/pages/advertiser/BillingPaymentsPage.jsx',
  'src/pages/government/GovCampaignsListPage.jsx',
  'src/pages/superadmin/SuperEmergencyApprovalsPage.jsx',
  'src/pages/government/GovEmergencyBroadcastPage.jsx',
  'src/pages/government/GovLiveTrackingPage.jsx',
  'src/pages/government/GovAnalyticsDashboardPage.jsx',
  'src/pages/superadmin/NotificationDeliveryLogsPage.jsx',
  'src/pages/government/GovReportsPage.jsx',
  'src/pages/superadmin/LiveServerLogsPage.jsx',
  'src/pages/superadmin/SuperLanguagesPage.jsx',
  'src/pages/superadmin/SuperPaymentGatewaysPage.jsx',
  'src/pages/superadmin/SuperGoogleApisPage.jsx',
  'src/pages/superadmin/SuperGoogleApisPlaygroundPage.jsx',
  'src/pages/superadmin/SuperChannelSettingsPage.jsx',
  'src/pages/superadmin/SuperNotificationRulesPage.jsx',
  'src/pages/superadmin/SuperSmtpSettingsPage.jsx',
  'src/pages/superadmin/SuperEmailTemplatesPage.jsx',
  'src/pages/superadmin/SuperSmsSettingsPage.jsx',
  'src/pages/superadmin/SuperPushSettingsPage.jsx',
  'src/pages/superadmin/SuperHelpSupportPage.jsx'
];

const superadminDir = path.resolve('src/pages/superadmin');
const allSuperAdminFiles = fs.readdirSync(superadminDir)
  .filter(f => f.endsWith('.jsx') && !f.includes('.test.'))
  .map(f => 'src/pages/superadmin/' + f);

const uniqueFiles = Array.from(new Set([...targetFiles, ...allSuperAdminFiles]));

// Unicode emoji regex
const emojiRegex = /\p{Extended_Pictographic}/u;

let results = [];

uniqueFiles.forEach(relPath => {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('File not found:', relPath);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const matchedLines = [];
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      matchedLines.push({ lineNum: idx + 1, content: line.trim() });
    }
  });
  if (matchedLines.length > 0) {
    results.push({ file: relPath, count: matchedLines.length, lines: matchedLines });
  }
});

fs.writeFileSync('emoji_results.json', JSON.stringify(results, null, 2));
console.log('Results written to emoji_results.json. Total files with emojis:', results.length);

