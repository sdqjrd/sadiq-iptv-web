exports.handler = async function(event) {
  const target = event.queryStringParameters && event.queryStringParameters.url;
  if (!target) {
    return { statusCode: 400, body: 'missing url param' };
  }
  try {
    const https = require('https');
    const http = require('http');
    const url = new URL(target);
    const lib = url.protocol === 'https:' ? https : http;
    const data = await new Promise((resolve, reject) => {
      const req = lib.get(target, { timeout: 15000 }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: data,
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: e.message }) };
  }
};
