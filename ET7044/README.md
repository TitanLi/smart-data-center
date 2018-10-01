# ET7044

## 環境
1. nodeJS環境:
`node v6`
`npm v5.6`
2. MQTT Protocol broker:
`mosquitto`

### 概述
架設microservice，使用Modbus Protocol讀寫ET-7044資料，並將讀取到的資料透過MQTT Protocol傳出達到狀態同步

### 程式說明
（1）引用設定檔
```javascript
const config = require('./config.json');
```
（2）Using ModbusRTU protocol control ET7044
```javascript
function checkError(e) {
    if (e.errno && networkErrors.includes(e.errno)) {
        console.log("we have to reconnect");
        // close port
        client.close();
        // re open client
        client = new ModbusRTU();
        timeoutConnectRef = setTimeout(connect, 1000);
    }
}
function connect() {
    // clear pending timeouts
    clearTimeout(timeoutConnectRef);
    // if client already open, just run
    if (client.isOpen()) {
        run();
    }
    client.connectTCP(config.ET7044, { port: 502 })
    .then(setClient)
    .then(function () {
        console.log("Connected");
    })
    .catch(function (e) {
        console.log(e.message);
    });
}
function setClient() {
    // set the client's unit id
    client.setID(1);
    // set a timout for requests default is null (no timeout)
    client.setTimeout(3000);
    // run program
    run();
}

function run() {
    // clear pending timeouts
    clearTimeout(timeoutRunRef);
    client.writeCoils(0, writeData);
    client.readCoils(0, 8)
    .then(function (d) {
        //DOstatus = d.data.toString();
        DOstatus = JSON.stringify(d.data);
        console.log(DOstatus);
        console.log("Receive:", d.data);
        mqttClient.publish('ET7044/DOstatus', DOstatus);
    })
    .then(function () {
        timeoutRunRef = setTimeout(run, 5000);
    })
    .catch(function (e) {
        checkError(e);
        console.log(e.message);
    });
}
// connect and start logging
connect();
```

（3）Using MQTT protocol sync ET-7044 status
```javascript
// Mqtt connecting and pub
const mqttClient = mqtt.connect(config.MQTT);
mqttClient.on('connect', function () {
    console.log('connect to MQTT server');
    mqttClient.subscribe('ET7044/write');
});

mqttClient.on('message', function (topic, message) {
    // message is Buffer
    writeData = JSON.parse(message);
    console.log(writeData);
});
```

### 部署
（1）Edit config.json
```json
{
  "ET7044": "ET-7044 STATIC IP",
  "MQTT": "mqtt://MQTT-BROKER-IP:PORT"
}
```

（2）Install modules
```
$ npm install
```

（3）Run service
```
node ET7044_finish.js
```