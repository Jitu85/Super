/**
 * Automated Render Deployment Trigger
 * Pings the private Render Deploy Hook to immediately deploy the latest commit.
 */
const https = require('https');

const DEPLOY_HOOK = 'https://api.render.com/deploy/srv-dbe5a4i9lscs73a149tg?key=fCbpiJ_6fVE';

console.log('🚀 Triggering Render Deployment via private deploy hook...');

const req = https.request(DEPLOY_HOOK, { method: 'POST' }, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Render deploy triggered successfully!');
      try {
        const data = JSON.parse(body);
        console.log(`📦 Deploy ID: ${data.deploy?.id || 'Active'}`);
      } catch {
        console.log('Response:', body);
      }
    } else {
      console.error(`❌ Render returned HTTP ${res.statusCode}:`, body);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Failed to trigger Render deploy hook:', err.message);
});

req.end();
