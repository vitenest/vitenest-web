const https = require('https');

https.get('https://vitenest.com/', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const hasSrcMainJsx = data.includes('/src/main.jsx');
    const hasAssets = data.includes('/assets/');
    const hasTitle = (data.match(/<title>(.*?)<\/title>/) || [])[1] || 'unknown';

    console.log('Title:', hasTitle);
    console.log('Has /src/main.jsx (BAD):', hasSrcMainJsx);
    console.log('Has /assets/ (GOOD):', hasAssets);
    console.log('Status:', hasSrcMainJsx ? '❌ BROKEN - still old HTML' : hasAssets ? '✅ FIXED - serving dist' : '⚠️  Unknown');

    if (hasAssets) {
      const match = data.match(/src="(\/assets\/[^"]+)"/);
      if (match) {
        console.log('\nFound script:', match[1]);
        https.get('https://vitenest.com' + match[1], (res2) => {
          console.log('Script Status:', res2.statusCode, res2.statusCode === 200 ? '✅' : '❌');
        }).on('error', e => console.error(e));
      }
    }
  });
}).on('error', e => console.error('Request error:', e));
