const request = require('request-promise');
const dotenv = require('dotenv').load();
const MongoClient = require('mongodb').MongoClient;
const MongoDB = require('./../lib/mongoDB.js');

setInterval(() => {
    let mongodb;
    if (new Date().toLocaleString('zh-tw').split(' ')[1] == "8:01:00" && new Date().toLocaleString('zh-tw').split(' ')[2] == "AM") {
      let push = async () => {
        await new Promise(function (resolve, reject) {
            MongoClient.connect(process.env.MONGODB, (err, client) => {
                db = client.db("smart-data-center");
                mongodb = new MongoDB(db, io);
                console.log('MongoDB connection');
                resolve();
            });
        });
        let data = await mongodb.yesterdayAvgPowerRobot();
        let options = {
          method: 'POST',
          uri: process.env.LINE_BOT_PUSH,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            powerMeterPower: data.powerMeterPower,
            upsPower_A: data.upsPower_A,
            upsPower_B: data.upsPower_B
          },
          json: true
        }
        console.log(options)
        await request(options).then(function (parsedBody) {
          console.log(parsedBody);
          console.log('yesterdayAvgPowerRobot post success')
        }).catch(function (err) {
          console.error(err);
          push();
        });
      }
      push();
    }
}, 1000);