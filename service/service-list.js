const request = require('request-promise');
const dotenv = require('dotenv').load();
const MongoClient = require('mongodb').MongoClient;

setInterval(() => {
    // if (new Date().toLocaleString('zh-tw').split(' ')[1] == "08:01:00") {
        let push = async () => {
            let serviceList = [];
            var db;
            let dataUpdateCheck = 0;
            let options = {
              method: 'GET',
              uri: process.env.SERVICE_LIST,
              json: true
            }
            console.log(options)
            await request(options).then(function (resData) {
              console.log(resData);
              serviceList = resData.res
              console.log('Get service list success')
            }).catch(function (err) {
              console.error(err);
              push();
            });
            await new Promise(function (resolve, reject) {
                MongoClient.connect(process.env.MONGO_URL, (err, client) => {
                    db = client.db("smart-data-center");
                    console.log('connect');
                    resolve();
                });
            });
            collectionServiceList = db.collection('serviceList');
            for(let i = 0;i<serviceList.length;i++){
                let updateData = {
                    'name':serviceList[i].name,
                    'url':serviceList[i].url,
                    'enabled':serviceList[i].enabled,
                    'notice':serviceList[i].notice
                }
                await new Promise(function (resolve,reject){
                    collectionServiceList.update(
                        {'name':serviceList[i].name},
                        {
                          $set: updateData
                        },
                        { upsert: true },
                        function (err, res) {
                          if (err) {
                            return console.log(err);
                          } else {
                            dataUpdateCheck++;
                            console.log('mLab service list insert successfully');
                            resolve();
                          }
                        }
                      );
                });
            }
            db.close();
          }
          push();
    // }
  }, 10000);

