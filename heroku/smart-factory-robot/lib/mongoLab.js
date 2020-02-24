const MongoLabClient = require('mongodb').MongoClient;

module.exports = {
  findData: (msgText) => (function* () {
    console.log(msgText);
    let findData = "";
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionPowerMeter = db.collection('powerMeter');
        let collectionUps_A = db.collection('ups_A');
        let collectionUps_B = db.collection('ups_B');
        let collectionDL303 = db.collection('dl303');
        let collectionCamera_Power = db.collection('computerRoomPower');
        switch (msgText) {
          case '電錶今日度數':
            collectionCamera_Power.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '電錶今日度數' + data.cameraPower.toFixed(2) + '(度)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '電錶昨日消耗度數':
            collectionCamera_Power.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '電錶昨日消耗度數' + data.cameraPowerConsumption.toFixed(2) + '(度)\n';
                findData = findData + '機房電錶消耗計算起始時間：' + new Date(data.cameraStartTime).toLocaleString();
                findData = findData + '機房電錶消耗計算終止時間：' + new Date(data.cameraEndTime).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '冷氣電流':
            collectionPowerMeter.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '冷氣目前電流：' + data.currents.toFixed(2) + '(A)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case 'ups_A電流':
            collectionUps_A.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = 'ups_A目前電流：' + Number(data.output_A.outputAmp_A).toFixed(2) + '(A)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case 'ups_B電流':
            collectionUps_B.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = 'ups_B目前電流：' + Number(data.output_B.outputAmp_B).toFixed(2) + '(A)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '機房濕度':
            collectionDL303.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前機房濕度：' + data.DL303_humi.toFixed(2) + '(%)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '機房溫度':
            collectionDL303.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前機房溫度：' + data.DL303_temp.toFixed(2) + '(°C)\n';
                findData = findData + '最後更新時間：' + new Date(data.time).toLocaleString();
                console.log(findData);
                done();
              }
            }
            );
            break;
          case 'demo濕度':
            collectionDL303.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前demo濕度：' + data.DL303_humi.toFixed(2) + '(%)';
                console.log(findData);
                done();
              }
            }
            );
            break;
          case 'demo溫度':
            collectionDL303.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前demo溫度：' + data.DL303_temp.toFixed(2) + '(°C)';
                console.log(findData);
                done();
              }
            }
            );
            break;
          default:
            console.log('pass');
            done();
        }
      });
    }
    return findData;
  }),
  controlUpdate: (controlET7044) => (function* () {
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionControl = db.collection('control');
        collectionControl.update(
          {},
          {
            $set: controlET7044
          },
          { upsert: true },
          function (err, res) {
            if (err) {
              return console.log(err);
            } else {
              console.log('mLab control data insert successfully');
            }
            done();
          }
        );
      });
    }
    return 'mLab control data insert successfully';
  }),
  controlFind: () => (function* () {
    let findData = {};
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionControl = db.collection('control');
        collectionControl.findOne(
          {},
          function (err, data) {
            if (err) {
              return console.log(err);
            } else {
              if (data != null) {
                findData = data;
              }
            }
            done();
          }
        );
      });
    }
    return findData;
  }),
  arduinoControlUpdate: (controlArduino) => (function* () {
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionControl = db.collection('arduinoControl');
        collectionControl.update(
          {},
          {
            $set: controlArduino
          },
          { upsert: true },
          function (err, res) {
            if (err) {
              return console.log(err);
            } else {
              console.log('mLab arduino control data insert successfully');
            }
            done();
          }
        );
      });
    }
    return 'mLab control data insert successfully';
  }),
  arduinoControlFind: () => (function* () {
    let findData = {};
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionControl = db.collection('arduinoControl');
        collectionControl.findOne(
          {},
          function (err, data) {
            if (err) {
              return console.log(err);
            } else {
              if (data != null) {
                findData = data;
              }
            }
            done();
          }
        );
      });
    }
    return findData;
  }),
  computerRoomInformationUpdate: (cacheData) => (function* () {
    let updateData = {
      'vcpu': cacheData[0],
      'ram': cacheData[1],
      'disk': cacheData[2],
      'switch': cacheData[3],
      'sdnSwitch': cacheData[4],
      'pc': cacheData[5],
      'server': cacheData[6]
    };
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionComputerRoomInformation = db.collection('computerRoomInformation');
        collectionComputerRoomInformation.update(
          {},
          {
            $set: updateData
          },
          { upsert: true },
          function (err, res) {
            if (err) {
              return console.log(err);
            } else {
              console.log('mLab computer room information update successfully');
            }
            done();
          }
        );
      });
    }
    return 'mLab computer room information update successfully';
  }),
  computerRoomInformationFind: () => (function* () {
    let findData = '';
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionComputerRoomInformation = db.collection('computerRoomInformation');
        collectionComputerRoomInformation.findOne({}, (err, data) => {
          if (err) {
            return console.log(err);
          } else {
            findData = `VCPU數量(顆):${data.vcpu}\nRAM數量(GB):${data.ram}\n機房儲存空間(TB):${data.disk}\n機房Switch數量(台):${data.switch}\n機房SDN Switch數量(台):${data.sdnSwitch}\n機房一般主機數量(台):${data.pc}\n機房伺服器數量(台):${data.server}`;
            console.log(findData);
            done();
          }
        });
      });
    }
    return findData;
  }),
  powerUpdate: (requestData) => (function* () {
    let updateData = {
      'airConditioning': Number(requestData.powerMeterPower),
      'upsA': Number(requestData.upsPower_A),
      'upsB': Number(requestData.upsPower_B),
      'cameraPowerConsumption': Number(requestData.cameraPowerConsumption),
      'cameraPower': Number(requestData.cameraPower),
      'cameraStartTime':requestData.cameraStartTime,
      'cameraEndTime':requestData.cameraEndTime,
      'time': requestData.time
    };
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionComputerRoomPower = db.collection('computerRoomPower');
        collectionComputerRoomPower.update(
          {},
          {
            $set: updateData
          },
          { upsert: true },
          function (err, res) {
            if (err) {
              return console.log(err);
            } else {
              console.log('mLab computer room power update successfully');
            }
            done();
          }
        );
      });
    }
    return 'mLab computer room power update update successfully';
  }),
  powerFind: () => (function* () {
    let findData = '';
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionComputerRoomPower = db.collection('computerRoomPower');
        collectionComputerRoomPower.findOne({}, (err, data) => {
          if (err) {
            return console.log(err);
          } else {
            findData = data;
            console.log(findData);
            done();
          }
        });
      });
    }
    return findData;
  }),
  serviceListFind: () => (function* () {
    let findData = '';
    yield function (done) {
      MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
        if (err) {
          return console.log(err);
        }
        console.log("connect MongoLabClient on 27017 port");
        let collectionServiceList = db.collection('serviceList');
        collectionServiceList.find().toArray((err, data) => {
          if (err) {
            return console.log(err);
          } else {
            findData = data;
          }
          done();
        });
      });
    }
    return findData;
  })
}