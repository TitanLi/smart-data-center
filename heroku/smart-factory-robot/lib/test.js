const request = require('request-promise');
var options = {
  uri: 'https://works.ioa.tw/weather/api/weathers/116.json',
  headers: {
    'User-Agent': 'Request-Promise'
  },
  json: true // Automatically parses the JSON string in the response
};

async function a(){
  let data = await request(options);
  console.log(data)
}

a();