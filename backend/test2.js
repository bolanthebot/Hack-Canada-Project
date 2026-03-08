require('dotenv').config({ path: '../.env' });
const axios = require('axios');

axios.post('https://api.anthropic.com/v1/messages', {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 500,
  tools: [{ type: 'web_search_20250305', name: 'web_search' }],
  messages: [{ role: 'user', content: 'What is the current price of oil?' }]
}, {
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  timeout: 60000
}).then(r => console.log('SUCCESS:', JSON.stringify(r.data).slice(0, 300)))
  .catch(e => {
    console.error('FAIL:', e.message);
    console.error('Code:', e.code);
    console.error('Cause:', e.cause);
    console.error('Response:', JSON.stringify(e.response?.data));
  });
