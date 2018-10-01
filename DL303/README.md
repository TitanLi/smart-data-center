# DL303 test

## 概述
透過此測試程式可以取得DL303推送至MQTT Broker的資料

## 環境
1. nodeJS環境:
`node v8+`
`npm v5.6+`
2. MQTT Protocol broker:
`mosquitto`

## 執行步驟
1. install mqtt library
```
$ npm install mqtt
```
2. 編輯DL303mqtt.js，指定MQTT Broker位置
```javascript
const client = mqtt.connect('mqtt://MQTT-BROKER-IP:PORT');
```
3. Run test
```
$ node DL303mqtt.js
```