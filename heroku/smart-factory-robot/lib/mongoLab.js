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
        switch (msgText) {
          case '冷氣電流':
            collectionPowerMeter.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '冷氣目前電流：' + data.currents.toFixed(2) + '(A)';
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
                findData = 'ups_A目前電流：' + Number(data.output_A.outputAmp_A).toFixed(2) + '(A)';
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
                findData = 'ups_B目前電流：' + Number(data.output_B.outputAmp_B).toFixed(2) + '(A)';
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '機房濕度':
            collectionPowerMeter.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前機房濕度：' + data.Humidity.toFixed(2) + '(%)';
                console.log(findData);
                done();
              }
            }
            );
            break;
          case '機房溫度':
            collectionPowerMeter.findOne({}, (err, data) => {
              if (err) {
                return console.log(err);
              } else {
                findData = '目前機房溫度：' + data.Temperature.toFixed(2) + '(°C)';
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
  })
}