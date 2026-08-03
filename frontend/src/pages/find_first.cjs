const fs = require('fs');
const logFile = 'C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/.system_generated/logs/transcript_full.jsonl';
const fileStr = fs.readFileSync(logFile, 'utf-8');
const lines = fileStr.split('\n');

let firstCode = null;

for (let line of lines) {
  if (!line.trim()) continue;
  
  if (line.includes('export const AdminPanel: React.FC = () => {') && line.includes('AdminDashboard') && !line.includes('FIXED TELEGRAM MINI APP BOTTOM CONTROL NAVIGATION BAR')) {
      const match = line.match(/"CodeContent":"((?:[^"\\]|\\.)*)"/);
      if (match) {
          try {
              const code = JSON.parse('"' + match[1] + '"');
              firstCode = code;
              break; // get the first one!
          } catch(e) {}
      }
  }
}

if (firstCode) {
    fs.writeFileSync('C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/scratch/first_admin_panel.tsx', firstCode);
    console.log('Successfully found FIRST CodeContent! Size:', firstCode.length);
} else {
    console.log('No FIRST CodeContent found');
}
