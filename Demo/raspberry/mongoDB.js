const mqtt = require('mqtt');
const dotenv = require('dotenv').load();
const mqttClient = mqtt.connect(process.env.MQTT);
const MongoLabClient = require('mongodb').MongoClient;
const co = require('co');
const request = require('request-promise');
var mLabDB;
var findData = {};
var relay1 = 'false',relay2 = 'false';
var D0,D1,D2;

MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }
  console.log("connect MongoLabClient on 27017 port");
  mLabDB = db;
  setInterval(() => {
    lineBotControl();
  },1000);
});

//MQTT connect
mqttClient.on('connect',() => {
  mqttClient.subscribe('power-meter-control');
});

async function lineBotControl(){
    let collectionControl = mLabDB.collection('arduinoControl');

    await co(function * (){
        yield function(done){
            collectionControl.findOne(
                {},
                function (err, data) {
                    if (err) {
                        return console.log(err);
                    }else{
                        if(data != null){
                            findData = data;
                        }
                        // console.log(findData);
                        done();
                    }
                }
            );
        }
    });

    //ET7044 status translate
    function getStatus(status){
      if(status){
        return '開啟';
      }else{
        return '關閉';
      }
    }

    //line bot push message api on heroku
    let options = {
      method: 'POST',
      uri: 'https://smart-factory-robot.herokuapp.com/message',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        message : "",
      },
      json: true
    };

    if(JSON.stringify(findData) != '{}'){
        if(findData.relay1 != relay1 || findData.relay2 != relay2){
            if(JSON.parse(findData.relay1)){
              mqttClient.publish('power-meter-control','A');   
              console.log('A');
            }else{
              mqttClient.publish('power-meter-control','Y');
              console.log('Y');   
            }
            if(JSON.parse(findData.relay2)){
              mqttClient.publish('power-meter-control','B');
              console.log('B');
            }else{
              mqttClient.publish('power-meter-control','Z');
              console.log('Z');
            }
            options.body.message = `arduino relay1 狀態：${getStatus(JSON.parse(findData.relay1))} \narduino relay2 狀態：${getStatus(JSON.parse(findData.relay2))}`;
            request(options);
            relay1 = findData.relay1;
            relay2 = findData.relay2;
        }
    }
}