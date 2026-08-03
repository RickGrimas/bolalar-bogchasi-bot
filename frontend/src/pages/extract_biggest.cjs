const fs = require('fs');
const path = require('path');
const logFile = 'C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/.system_generated/logs/transcript_full.jsonl';
const fileStr = fs.readFileSync(logFile, 'utf-8');

const lines = fileStr.split('\n');
let longestCode = '';

for (let line of lines) {
  if (!line.trim()) continue;
  
  // Also check if we can just extract from raw JSON parsing
  try {
     const obj = JSON.parse(line);
     
     // 1. Check if it was an explicit "write_to_file" or "replace_file_content" argument payload 
     if (obj.tool_calls && obj.tool_calls.length > 0) {
        for (let tc of obj.tool_calls) {
           if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
               if (tc.args && tc.args.CodeContent) {
                   const c = tc.args.CodeContent;
                   if (c.includes('export const AdminPanel: React.FC = () => {') && c.includes('AdminDashboard') && c.length > longestCode.length) {
                       longestCode = c;
                   }
               }
           }
        }
     }
  } catch(e) {}
}

if (longestCode) {
    const destPath = 'C:/Users/Smart Pc/.gemini/antigravity/brain/0dd307fe-3923-425e-b09b-222deb59fc20/scratch/best_admin_panel_recovered.tsx';
    fs.writeFileSync(destPath, longestCode);
    console.log('Successfully found biggest CodeContent! Size:', longestCode.length);
} else {
    console.log('No big CodeContent found');
}
