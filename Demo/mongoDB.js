const mqtt = require('mqtt');
const dotenv = require('dotenv').load();
const mqttClient = mqtt.connect(process.env.MQTT);
const MongoLabClient = require('mongodb').MongoClient;
const co = require('co');
const request = require('request-promise');
var mLabDB;
var findData = {};
var outputFan = 'false',inputFan = 'false',humidity = 'false';
var D0,D1,D2;

MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }
  console.log("connect MongoLabClient on 27017 port");
  mLabDB = db;
  mLabContronUpdate();
  setInterval(() => {
    lineBotControl();
  },1000);
});

//MQTT connect
mqttClient.on('connect',() => {
  mqttClient.subscribe('ET7044/DOstatus');
  mqttClient.subscribe('ET7044/write');
});

async function lineBotControl(){
    let collectionControl = mLabDB.collection('control');

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

    if(JSON.stringify(findData) != '{}'){
        if(findData.outputFan != outputFan || findData.inputFan != inputFan || findData.humidity != humidity){
            let et7044Status = [JSON.parse(findData.inputFan),JSON.parse(findData.humidity),JSON.parse(findData.outputFan),false,false,false,false,false];
            mqttClient.publish('ET7044/write',JSON.stringify(et7044Status));          
            outputFan = findData.outputFan;
            inputFan = findData.inputFan;
            humidity = findData.humidity;
        }
    }
}

function mLabContronUpdate(){
  mqttClient.on('message',(topic,message) => {
    switch (topic) {
      case 'ET7044/DOstatus':
        let et7044Status = JSON.parse(message);
        let collectionControl = mLabDB.collection('control');
        if (et7044Status) {
          collectionControl.update(
            {},
            {
              $set : {
                      'inputFan' : et7044Status[0],
                      'humidity' : et7044Status[1],
                      'outputFan' : et7044Status[2]
                    }
            },
            {upsert : true },
            function (err, res) {
              if (err) {
                return console.log(err);
              }else{
                // console.log('mLab control data update successfully');
              }
            }
          );

          //當line開啟裝置，web關閉裝置時驅動
          if(JSON.parse(outputFan) != et7044Status[0] || JSON.parse(inputFan) != et7044Status[1] || JSON.parse(humidity) != et7044Status[2]){        
            inputFan = et7044Status[0];
            humidity = et7044Status[1];
            outputFan = et7044Status[2];
          }

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

          //D0狀態被改變時驅動
          if(D0 != et7044Status[0]){
            options.body.message = `進風風扇：${getStatus(et7044Status[0])}`;
            console.log(`進風風扇：${getStatus(et7044Status[0])}`);
            request(options);
          }

          //D1狀態被改變時驅動
          if(D1 != et7044Status[1]){
            options.body.message = `加溼器：${getStatus(et7044Status[1])}`;
            console.log(`加溼器：${getStatus(et7044Status[1])}`);
            request(options);
          }

          //D2狀態被改變時驅動
          if(D2 != et7044Status[2]){
            options.body.message = `排風風扇：${getStatus(et7044Status[2])}`;
            console.log(`排風風扇：${getStatus(et7044Status[2])}`);
            request(options);
          }

          //更新ET7044 D0~D3狀態
          D0 = et7044Status[0];
          D1 = et7044Status[1];
          D2 = et7044Status[2];
        }
        break;
      default:
        console.log('pass');
    }
  });
}