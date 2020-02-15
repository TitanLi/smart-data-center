const request = require('request-promise');
const dotenv = require('dotenv').load();
const MongoClient = require('mongodb').MongoClient;
const MongoDB = require('./../lib/mongoDB.js');

setInterval(() => {
    let mongodb;
    if (new Date().toLocaleString('zh-tw').split(' ')[1] == "8:01:00" && new Date().toLocaleString('zh-tw').split(' ')[2] == "AM") {
    // if (new Date().toLocaleString('zh-tw').split(' ')[1] == "8:01:00") {
        // heroku cold start
        let push = async () => {
            await new Promise(function (resolve, reject) {
                MongoClient.connect(process.env.MONGODB, (err, client) => {
                    db = client.db("smart-data-center");
                    mongodb = new MongoDB(db);
                    console.log('MongoDB connection');
                    resolve();
                });
            });
            let yesterdayAvgPowerData = await mongodb.yesterdayAvgPowerRobot();
            let herokuOptions = {
                method: 'POST',
                uri: process.env.LINE_BOT_PUSH,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    powerMeterPower: yesterdayAvgPowerData.powerMeterPower,
                    upsPower_A: yesterdayAvgPowerData.upsPower_A,
                    upsPower_B: yesterdayAvgPowerData.upsPower_B,
                    cameraPowerConsumption: yesterdayAvgPowerData.cameraPowerConsumption,
                    cameraPower: yesterdayAvgPowerData.cameraPower
                },
                json: true
            }
            console.log(herokuOptions)
            await request(herokuOptions).then(function (parsedBody) {
                console.log(parsedBody);
                console.log('yesterdayAvgPowerRobot post success')
                let webOptions = {
                    method: 'POST',
                    uri: process.env.PUSH_POWER_NOTIFICATION,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: yesterdayAvgPowerData,
                    json: true
                }
                request(webOptions).then(function (parsedBody) {
                    console.log(parsedBody);
                    console.log('Web yesterdayAvgPower success')
                }).catch(function (err) {
                    console.error(err);
                });
            }).catch(function (err) {
                console.error(err);
                push();
            });
        }
        push();
    }
}, 1000);