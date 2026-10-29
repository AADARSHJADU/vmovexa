const fs = require('fs');
let c = fs.readFileSync('src/components/IncidentManagementView.jsx', 'utf8');

const targetRegex = /<button\s+type="button"\s+onClick=\{\(\)\s*=>\s*loadIncidents\(\)\}[\s\S]*?<\/button>/;
if (targetRegex.test(c)) {
  c = c.replace(targetRegex, `<RefreshButton\n            onClick={() => loadIncidents()}\n            loading={loading}\n          />`);
  fs.writeFileSync('src/components/IncidentManagementView.jsx', c, 'utf8');
  console.log('SUCCESS: IncidentManagementView updated');
} else {
  console.log('NOT FOUND in IncidentManagementView');
}
