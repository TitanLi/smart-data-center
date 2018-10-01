# Smart-data-center

## 作品展示

1.mobile demo:[https://www.youtube.com/watch?v=frStPQSN2lY](https://www.youtube.com/watch?v=frStPQSN2lY)

2.linebot demo:[https://www.youtube.com/watch?v=kMMYxFdER4M](https://www.youtube.com/watch?v=kMMYxFdER4M)

3.raspberry pi3 touch panel demo:[https://www.youtube.com/watch?v=LIEXDQloP2w](https://www.youtube.com/watch?v=LIEXDQloP2w)

## 實作環境

### nodeJS執行環境

`npm v5.6+`
`node v8+`

### Database環境需求

`mongoDB v3.6+`

### MQTT Protocol broker

`mosquitto`

## 架構圖

![](https://github.com/TitanLi/smart-data-center/blob/master/picture/%E6%9E%B6%E6%A7%8B%E5%9C%96.png)

## 終端監控設備控制程式

### 1. 自製電源及環境監測裝置（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/power-meter)）

* Arduino電路圖
![](https://github.com/TitanLi/smart-data-center/blob/master/picture/power-meter.png)
* Raspberry pi3 service push data to MQTT broker

（1）引用設定檔
```javascript
const config = require('./config.js');
```
（2）MQTT connect
```javascript
const client = mqtt.connect(config.MQTT);
client.on('connect', function () {
    console.log('on connect');
    client.subscribe('current');
});
```
（3） Opening a port and publish the message to MQTT broker
```javascript
const port = new SerialPort(config.serialport, {
    parser: SerialPort.parsers.readline('\n')
});
port.on('open', function () {
    port.on('data', function (data) {
        console.log(data);
        client.publish('current', data.toString());
    });
});
```

### 2.工業級數位訊號輸入控制器ET7044（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/ET7044)）
（1）引用設定檔
```javascript
const config = require('./config.js');
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

### 3.工業級環境監控設備DL303([測試程式](https://github.com/TitanLi/smart-data-center/tree/master/DL303))
`內建MQTT功能可將資料直接推送到指定Broker`

MQTT Topic    | Description  | Message |
--------------|--------------|---------|
DL303/CO2     |CO2測量        |0 to 9999 ppm (NDIR) |
DL303/RH      |相對溼度測量    |0 to 100% RH|
DL303/TC      |溫度測量       |-10 to +50°C|  
DL303/DC      |露點溫度       |由溫度與相對溼度計算而得|

### 4.工業級電源監控設備PM3133（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/PM3133)）

MQTT Topic    | Description  | Message |
--------------|--------------|---------|
PM3133/A      |比流器1        | |
PM3133/B      |比流器2        | |
PM3133/C      |比流器3        | |

### 5.web service & socket.io service（[範例程式](https://github.com/TitanLi/smart-data-center/blob/master/app.js)）

（1）web service

Method    | API          | Description   |
----------|--------------|---------------|
GET       |/             | web dashboard |
POST      |/ET7044       | ET7044 control|

（2）socket.io

> current data structure：[https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/current.json](https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/current.json)

> UPS_Monitor data structure：[https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/UPS_Monitor.json](https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/UPS_Monitor.json)

> ET7044/DOstatus data structure：[https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/ET7044-DOstatus.js](https://github.com/TitanLi/smart-data-center/blob/master/doc/MQTT/ET7044-DOstatus.js)

Event                  | Source                 | JSON KEY    |
-----------------------|------------------------|-------------|
humidity               | MQTT topic current     | Humidity    |
temperature            | MQTT topic current     | Temperature |
current                | MQTT topic current     | currents    |
inputVolt_A            | MQTT topic UPS_Monitor | input_A.inputVolt_A |
inputFreq_A            | MQTT topic UPS_Monitor | input_A.inputFreq_A |
outputVolt_A           | MQTT topic UPS_Monitor | output_A.outputVolt_A|
outputFreq_A           | MQTT topic UPS_Monitor | output_A.outputFreq_A|
outputAmp_A            | MQTT topic UPS_Monitor | output_A.outputAmp_A|
outputWatt_A           | MQTT topic UPS_Monitor | output_A.outputWatt_A|
systemMode_A           | MQTT topic UPS_Monitor | output_A.systemMode_A|
outputPercent_A        | MQTT topic UPS_Monitor | output_A.outputPercent_A|
batteryHealth_A        | MQTT topic UPS_Monitor | battery_A.status.batteryHealth_A|
batteryCharge_Mode_A   | MQTT topic UPS_Monitor | battery_A.status.batteryCharge_Mode_A|
batteryTemp_A          | MQTT topic UPS_Monitor | battery_A.status.batteryTemp_A|
batteryRemain_A        | MQTT topic UPS_Monitor | battery_A.status.batteryRemain_Min_A<br>battery_A.status.batteryRemain_Sec_A|
batteryRemain_Percent_A| MQTT topic UPS_Monitor | battery_A.status.batteryRemain_Percent_A|
inputVolt_B            | MQTT topic UPS_Monitor | input_B.inputVolt_B|
inputFreq_B            | MQTT topic UPS_Monitor | input_B.inputFreq_B|
outputVolt_B           | MQTT topic UPS_Monitor | output_B.outputVolt_B|
outputFreq_B           | MQTT topic UPS_Monitor | output_B.outputFreq_B|
outputAmp_B            | MQTT topic UPS_Monitor | output_B.outputAmp_B|
outputWatt_B           | MQTT topic UPS_Monitor | output_B.outputWatt_B|
systemMode_B           | MQTT topic UPS_Monitor | output_B.systemMode_B|
outputPercent_B        | MQTT topic UPS_Monitor | output_B.outputPercent_B|
batteryHealth_B        | MQTT topic UPS_Monitor | battery_B.status.batteryHealth_B|
batteryCharge_Mode_B   | MQTT topic UPS_Monitor | battery_B.status.batteryCharge_Mode_B|
batteryTemp_B          | MQTT topic UPS_Monitor | battery_B.status.batteryTemp_B|
batteryRemain_B        | MQTT topic UPS_Monitor | battery_B.status.batteryRemain_Min_B<br>battery_B.status.batteryRemain_Sec_B|
batteryRemain_Percent_B| MQTT topic UPS_Monitor | battery_B.status.batteryRemain_Percent_B|
D0                     | MQTT topic ET7044/DOstatus | Array[0] |
D1                     | MQTT topic ET7044/DOstatus | Array[1] |
D2                     | MQTT topic ET7044/DOstatus | Array[2] |




