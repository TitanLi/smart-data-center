# Smart-data-center

## 環境
1. nodeJS環境:
`node v10`
`npm v5.6`
2. nodeJS套件:
`serialport`
 `mqtt`
### 程式說明
（1）引用設定檔
 ```javascript
 const Readline = require('@serialport/parser-readline')
 const parser = new Readline()
 var SerialPort = require("serialport"); 
 ```
 (2)利用mqtt接收訊息在送至arduino
 ```javascript
 client.on('message', function (topic, message){
    arduinoport.write(message, (err) => {n
      if (err) {
          return console.log('written error:',err.message);
        }
      console.log('message written')
        });
      });
arduinoport.pipe(parser)
client.on('connect', function () {
  client.subscribe('arduino');
}); 
```
 (3)接收arduino傳來的訊息在用mqtt發送至broker
```javascript
parser.on('data', line =>{
  console.log(line)
  var Arduno_data = JSON.parse(line);
  // var data = Object.keys(Arduno_data) 
  var data_value = Object.values(Arduno_data)
  data = data_value;
  asyncCall();
  },100)
async function asyncCall() {
  const client  = mqtt.connect('mqtt://127.0.0.1')
  client.on('connect', function () {
    console.log(data);
    client.publish('7F_FAN',JSON.stringify(data))
    client.end()
  },100); 
} 
```
