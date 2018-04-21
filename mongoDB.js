const MongoClient = require('mongodb').MongoClient;
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://10.20.0.90:1883');
var db;

MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    db = client.db("smart-factory");
    console.log("connect mongodb on 27017 port");
    mqttConnect();
});

function mqttConnect(){
  mqttClient.on('connect',() => {
    mqttClient.subscribe('UPS_Monitor');
    mqttClient.subscribe('current');
  });

  mqttClient.on('message',(topic,message) => {
    console.log(topic,JSON.parse(message));
    switch (topic) {
      case "current":
        powerMeterMqttData = JSON.parse(message);
        powerMeterMqttData.time = new Date();
        var collectionPowerMeterLogs = db.collection('powerMeter');
        var collectionPowerMeterPower = db.collection('powerMeterPower');
        if (powerMeterMqttData) {
          collectionPowerMeterLogs.insert(powerMeterMqttData,(err, data) => {
            if (err) {
              console.log('collectionPowerMeterLogs data insert failed');
            } else {
              console.log('collectionPowerMeterLogs data insert successfully');
            }
          });
          collectionPowerMeterPower.insert({"power":powerMeterMqttData.currents*220/1000,"time":new Date()},(err, data) => {
            if (err) {
              console.log('collectionPowerMeterPower data insert failed');
            } else {
              console.log('collectionPowerMeterPower data insert successfully');
            }
          });
        }
        break;
      case "UPS_Monitor":
        upsMqttData = JSON.parse(message);
        upsMqttData.time = new Date();
        var collectionUpsLogs = db.collection('ups');
        var collectionUpsPower_A = db.collection('upsPower_A');
        var collectionUpsPower_B = db.collection('upsPower_B');
        if (upsMqttData) {
          collectionUpsLogs.insert(upsMqttData,(err, data) => {
                  if (err) {
                      console.log('collectionUpsLogs data insert failed');
                  } else {
                      console.log('collectionUpsLogs data insert successfully');
                  }
              });
          collectionUpsPower_A.insert({"power":parseInt(upsMqttData.output_A.outputWatt_A),"time":new Date()},(err, data) => {
            if (err) {
              console.log('collectionUpsPower_A data insert failed');
            } else {
              console.log('collectionUpsPower_A data insert successfully');
            }
          });
          collectionUpsPower_B.insert({"power":parseInt(upsMqttData.output_B.outputWatt_B),"time":new Date()},(err, data) => {
            if (err) {
              console.log('collectionUpsPower_B data insert failed');
            } else {
              console.log('collectionUpsPower_B data insert successfully');
            }
          });
        }
        break;
      default:
        console.log('pass');
    }
  });
}
