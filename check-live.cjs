const https = require('https');

https.get('https://vitenest.com/', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('--- HTML ---');
    console.log(data);
    
    // Find the script src
    const match = data.match(/src="(\/assets\/[^"]+)"/);
    if (match) {
      console.log('\nFound script:', match[1]);
      https.get('https://vitenest.com' + match[1], (res2) => {
        console.log('Script Status:', res2.statusCode);
        console.log('Script Headers:', res2.headers);
      }).on('error', e => console.error(e));
    }
  });
}).on('error', e => console.error(e));
