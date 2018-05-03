const MongoLocalClient = require('mongodb').MongoClient;
const mqtt = require('mqtt');
const mqttClient = mqtt.connect('mqtt://10.20.0.90:1883');
const MongoLabClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://nutc.iot:nutciot5891@ds161041.mlab.com:61041/smart-factory';
var localDB,mLabDB;

MongoLocalClient.connect("mongodb://localhost:27017/", (err, client) => {
    localDB = client.db("smart-factory");
    console.log("connect mongodb on 27017 port");
    localInsert();
});

MongoLabClient.connect(MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }
  console.log("connect MongoLabClient on 27017 port");
  mLabDB = db;
  mLabInsert();
});

//MQTT connect
mqttClient.on('connect',() => {
  mqttClient.subscribe('UPS_Monitor');
  mqttClient.subscribe('current');
});

function localInsert(){
  mqttClient.on('message',(topic,message) => {
    console.log(topic,JSON.parse(message));
    switch (topic) {
      case "current":
        powerMeterMqttData = JSON.parse(message);
        powerMeterMqttData.time = new Date();
        var collectionPowerMeterLogs = localDB.collection('powerMeter');
        var collectionPowerMeterPower = localDB.collection('powerMeterPower');
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
        var collectionUpsLogs = localDB.collection('ups');
        var collectionUpsPower_A = localDB.collection('upsPower_A');
        var collectionUpsPower_B = localDB.collection('upsPower_B');
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

function mLabInsert(){
  mqttClient.on('message',(topic,message) => {
    switch (topic) {
      case "current":
        powerMeterMqttData = JSON.parse(message);
        powerMeterMqttData.time = new Date();
        var collectionPowerMeter = mLabDB.collection('powerMeter');
        if (powerMeterMqttData) {
          collectionPowerMeter.update(
            {},
            {
              $set : powerMeterMqttData
            },
            {upsert : true },
            function (err, res) {
              if (err) {
                return console.log(err);
              }else{
                console.log('mLab powerMeter data insert successfully');
              }
            }
          );
        }
        break;
      case "UPS_Monitor":
        upsMqttData = JSON.parse(message);
        upsMqttData.time = new Date();
        var collectionUps_A = mLabDB.collection('ups_A');
        var collectionUps_B = mLabDB.collection('ups_B');
        if (upsMqttData) {
          collectionUps_A.update(
            {},
            {
              $set : {
                "connect_A" : upsMqttData.connect_A,
                "ups_Life_A" : upsMqttData.ups_Life_A,
                "input_A" : upsMqttData.input_A,
                "output_A" : upsMqttData.output_A,
                "battery_A" : upsMqttData.battery_A,
                "time" : upsMqttData.time
              }
            },
            {upsert : true },
            function (err, res) {
              if (err) {
                return console.log(err);
              }else{
                console.log('mLab ups_A data insert successfully');
              }
            }
          );
          collectionUps_B.update(
            {},
            {
              $set : {
                "connect_B" : upsMqttData.connect_B,
                "ups_Life_B" : upsMqttData.ups_Life_B,
                "input_B" : upsMqttData.input_B,
                "output_B" : upsMqttData.output_B,
                "battery_B" : upsMqttData.battery_B,
                "time" : upsMqttData.time
              }
            },
            {upsert : true },
            function (err, res) {
              if (err) {
                return console.log(err);
              }else{
                console.log('mLab ups_B data insert successfully');
              }
            }
          );
        }
        break;
      default:
        console.log('pass');
    }
  });
}
