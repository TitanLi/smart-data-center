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

### 1. 自製電源及環境監測裝置（[安裝教學](https://github.com/TitanLi/smart-data-center/tree/master/power-meter)）

MQTT Topic    | Description  | Message |
--------------|--------------|---------|
current       |溫度、濕度、電流 |{<br>"Humidity":26,<br>"Temperature":36,<br>"currents":12<br>}|

### 2.工業級數位訊號輸入控制器ET7044（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/ET7044)）

MQTT Topic      | Description        | Message |
----------------|--------------------|---------|
ET7044/DOstatus |ET7044 D0~D7 status |[false, false, false, false, false, false, false, false]|

### 3.工業級環境監控設備DL303([測試程式](https://github.com/TitanLi/smart-data-center/tree/master/DL303))
`內建MQTT功能可將資料直接推送到指定Broker`

MQTT Topic    | Description  | Message |
--------------|--------------|---------|
DL303/CO2     |CO2測量        |0 to 9999 ppm (NDIR) |
DL303/RH      |相對溼度測量    |0 to 100% RH|
DL303/TC      |溫度測量       |-10 to +50°C|  
DL303/DC      |露點溫度       |由溫度與相對溼度計算而得|

### 4.工業級電源監控設備PM3133（[安裝教學](https://github.com/TitanLi/smart-data-center/tree/master/PM3133)）

MQTT Topic    | Description  | Message    |
--------------|--------------|------------|
PM3133/A      |比流器1        | true/false |
PM3133/B      |比流器2        | true/false |
PM3133/C      |比流器3        | true/false |

### 5.UPS 監控程式（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/Delta_UPS)）

MQTT Topic    | Description  | Message    |
--------------|--------------|------------|
UPS_Monitor   |UPS監測        | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/ups.bson) |

### 6.web service & socket.io service（[範例程式](https://github.com/TitanLi/smart-data-center/blob/master/app.js)）

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

### 7.database（[範例程式](https://github.com/TitanLi/smart-data-center/blob/master/mongoDB.js)）

（1）Localhost MongoDB Database
> Database name smart-data-center

Database          | Collection     | Description          | Data example |
------------------|----------------|----------------------|--------------|
smart-data-center |powerMeter      | power-meter logs     | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/powerMeter.bson)|
smart-data-center |powerMeterPower | power-meter watt logs| [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/powerMeterPower.bson)|
smart-data-center |ups             | delta ups logs       | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/ups.bson)|
smart-data-center |upsPower_A      | delta ups watt logs  | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/upsPower_A.bson)|
smart-data-center |upsPower_B      | delta ups watt logs  |[example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/local/upsPower_B.bson)|

（2）Public Cloud MongoDB Database(mLab)
> mLab for linebot use

> Database name smart-data-center

Database          | Collection     | Description                    | Data example |
------------------|----------------|--------------------------------|--------------|
smart-data-center |powerMeter      | Latest power-meter information | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/mLab/powerMeter.json)|
smart-data-center |ups_A           | Latest delta ups(A) information | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/mLab/ups_A.json)|
smart-data-center |ups_B           | Latest delta ups(B) information | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/mLab/ups_B.json)|
smart-data-center |control         | Latest ET7044 control information | [example](https://github.com/TitanLi/smart-data-center/blob/master/doc/database/mLab/control.json)|

### 7.linebot service on HEROKU（[範例程式](https://github.com/TitanLi/smart-data-center/tree/master/heroku/smart-factory-robot)）
> Service for linebot use

Method    | API                  | Description         | Body Example |
----------|----------------------|---------------------|--------------|
GET       |/                     | test heroku service ||
GET       |/test                 | test connect mLab   ||
POST      |/webhooks             | for linebot use     ||
POST      |/post/push            | notify power consumption|{<br>powerMeterPower: 123,<br>upsPower_A: 456,<br>upsPower_B: 789<br>}|
POST      |/post/control/message | ET7044 control|{<br>message: "進風風扇：開啟"<br>}|
POST      |/message              | icinga2 alert notification| {<br>message: "需要維修"<br>}|

## 部署

（1）Git clone project
```
$ git clone https://github.com/TitanLi/smart-data-center.git
```

（2) Switch directory
```
$ cd smart-data-center
```

（3）Install modules
```
$ npm install
```

（4）Install pm2 project management tool
```
$ npm install pm2 -g
```

（5）Edit build.json 留下需要的服務
```json
{
  "apps": [
    {
      "name": "smart-data-center",
      "script": "./app.js"
    },
    {
      "name": "smart-data-center-mongodb",
      "script": "./mongoDB.js"
    },
    {
      "name": "smart-data-center-icinga2",
      "script": "./icinga2/icinga2.js"
    },
    {
      "name": "smart-data-center-ET7044",
      "script": "./ET7044/ET7044_finish.js"
    }
  ]
}
```

（6）更新.env參數
```
PORT = 3006
ICINGA2_PORT = 3001
MQTT = 'mqtt://127.0.0.1:1883'
MONGO_URL = 'mongodb://USER-NAME:PASSWORD@PROJECT-ID.mlab.com:37922/smart-data-center'
MONGODB = 'mongodb://127.0.0.1:27017/'
```

（7）run service
```
$ npm start
```