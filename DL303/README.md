# DL303 test
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
2. 指定MQTT Broker位置
```javascript
const client = mqtt.connect('mqtt://MQTT-BROKER-IP:PORT');
```
3. Run test
```
$ node DL303mqtt.js
```

