require('dotenv').config();
const https = require('https');

const key = process.env.GEMINI_API_KEY;

const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.models) {
        console.log("Supported Gemini models for this key:");
        parsed.models.forEach(m => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log("-", m.name.replace("models/", ""));
          }
        });
      } else {
        console.log("Error or No Models:", JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.log("Failed to parse response:", data.substring(0, 500));
    }
  });
});

req.on('error', (e) => console.error(e));
req.end();
