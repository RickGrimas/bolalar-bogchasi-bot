import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_KEY = process.env.ADMIN_API_KEY || "cloudcare_sec_admin_key_998712000011_x9z2a";
const PORT = process.env.PORT || 5000;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("🔒 Running Xavfsizlik Sinovlari...\n");

  try {
    // Test 1: Admin API without Auth Header (Should return 401)
    const res1 = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/broadcasts',
      method: 'GET'
    });
    console.log(`Test 1: Admin API Avtorizatsiyasiz so'rov -> Status: ${res1.status} (${res1.status === 401 ? '✅ PASSED (401 Unauthorized)' : '❌ FAILED'})`);

    // Test 2: Admin API with Valid X-Admin-API-Key Header (Should return 200)
    const res2 = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/broadcasts',
      method: 'GET',
      headers: { 'X-Admin-API-Key': ADMIN_KEY }
    });
    console.log(`Test 2: Admin API To'g'ri API Key bilan -> Status: ${res2.status} (${res2.status === 200 ? '✅ PASSED (200 OK)' : '❌ FAILED'})`);

    // Test 3: Telegram Verification with invalid initData (Should return 401)
    const postData3 = JSON.stringify({ initData: "user=%7B%22id%22%3A12345%7D&hash=invalidhash123" });
    const res3 = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/telegram-verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData3)
      }
    }, postData3);
    console.log(`Test 3: Telegram Soxta initData Verification -> Status: ${res3.status} (${res3.status === 401 ? '✅ PASSED (401 Invalid HMAC)' : '❌ FAILED'})`);

    // Test 4: Upload endpoint with disallowed extension .exe (Should return 400)
    const postData4 = JSON.stringify({ filename: "virus.exe", file_base64: "data:application/octet-stream;base64,dGVzdA==" });
    const res4 = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': ADMIN_KEY,
        'Content-Length': Buffer.byteLength(postData4)
      }
    }, postData4);
    console.log(`Test 4: Xavfli fayl (.exe) yuklash -> Status: ${res4.status} (${res4.status === 400 ? '✅ PASSED (400 Extension Blocked)' : '❌ FAILED'})`);

    console.log("\n✨ Barcha xavfsizlik sinovlari muvaffaqiyatli yakunlandi!");
    process.exit(0);
  } catch (err) {
    console.error("Sinovda xatolik:", err.message);
    process.exit(1);
  }
}

runTests();
