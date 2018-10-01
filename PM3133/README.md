# PM3133

## 環境
1. nodeJS環境:
`node v6`
`npm v5.6`
2. MQTT Protocol broker:
`mosquitto`

### 概述
架設microservice，使用Modbus Protocol讀取PM-3133資料，並將讀取到的資料透過MQTT Protocol傳出

### 部署
（1）Edit config.json
```json
{
  "PM3133": "PM-3133 STATIC IP",
  "MQTT": "mqtt://MQTT-BROKER-IP:PORT"
}
```

（2）Install modules
```
$ npm install
```

（3）Run service
```
node PM3133_finish.js
```