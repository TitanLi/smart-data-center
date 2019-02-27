# Power Meter

## 概述
透過Arduino結合DHT11及非侵入式比流器，讀取環境溫溼度和即時電流值，並透過Serial方式將資料傳送給Raspberry pi3，在利用MQTT Protocol將資料送出

## 環境
1. nodeJS環境:
`node v6`
`npm v5.6`
2. MQTT Protocol broker:
`mosquitto`

## Arduino

* Arduino電路圖
![](https://github.com/TitanLi/smart-data-center/blob/master/picture/power-meter.png)

* Arduino code(220V)
```c
#include "DHT.h"
#include "EmonLib.h" 
DHT dht;
EnergyMonitor emon1; 
void setup() 
{
    Serial.begin(9600); 
    dht.setup(10);
    emon1.current(2, 20);  //Current: input pin, calibration.
}

void loop() 
{   
    float humidity = dht.getHumidity();
    float temperature = dht.getTemperature();
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only
    if(humidity>=0){
      Serial.print("{\"Humidity\":"); 
      Serial.print(humidity, 1);
      Serial.print(",\"Temperature\":"); 
      Serial.print(temperature, 1);
      Serial.print(",\"currents\":");
      Serial.print(Irms);
      Serial.println("}");// Irms
    }
    delay(1000);
}
```

## Raspberry pi3
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

## 部署
（1）將電路製作完成與Arduino接上指定接腳

（2）將Arduino程式燒入晶片

（3）將[MQTT publish project](https://github.com/TitanLi/smart-data-center/blob/master/power-meter/raspberry)載入raspberry pi3

（4）切換至專案目錄

（5）安裝函式庫
```
$ npm install
```
（6）開啟服務
```
$ node app.js
```