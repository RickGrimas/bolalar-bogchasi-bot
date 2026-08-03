const fs = require('fs');
const path = require('path');
const logFile = 'C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/.system_generated/logs/transcript_full.jsonl';
const fileStr = fs.readFileSync(logFile, 'utf-8');

const lines = fileStr.split('\n');
let longestCode = '';

for (let line of lines) {
  if (!line.trim()) continue;
  
  if (line.includes('defaultHomeData') && line.includes('initialDemoLeads')) {
      const match = line.match(/"CodeContent":"((?:[^"\\]|\\.)*)"/);
      if (match) {
          try {
              const code = JSON.parse('"' + match[1] + '"');
              if (code.length > longestCode.length) {
                  longestCode = code;
              }
          } catch(e) {}
      }
  }
}

if (longestCode) {
    const destPath = 'C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/scratch/monolithic_admin_panel_recovered.tsx';
    fs.writeFileSync(destPath, longestCode);
    console.log('Successfully found monolithic CodeContent! Size:', longestCode.length);
} else {
    console.log('No monolithic CodeContent found');
}
