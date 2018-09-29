# Smart-data-center

## 作品展示

1.mobile:[https://www.youtube.com/watch?v=frStPQSN2lY](https://www.youtube.com/watch?v=frStPQSN2lY)

2.linebot demo:[https://www.youtube.com/watch?v=kMMYxFdER4M](https://www.youtube.com/watch?v=kMMYxFdER4M)

3.raspberry pi3 touch panel:[https://www.youtube.com/watch?v=LIEXDQloP2w](https://www.youtube.com/watch?v=LIEXDQloP2w)

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

### 1. 自製電源及環境監測裝置（[https://github.com/TitanLi/smart-data-center/tree/master/power-meter](https://github.com/TitanLi/smart-data-center/tree/master/power-meter)）

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