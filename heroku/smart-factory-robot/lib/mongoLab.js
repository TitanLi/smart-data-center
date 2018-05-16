const MongoLabClient = require('mongodb').MongoClient;

module.exports = {
    findData : () => (function * (msgText){
        console.log(msgText);
        yield function(done){
          MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
            if (err) {
              return console.log(err);
            }
            console.log("connect MongoLabClient on 27017 port");
            let collectionPowerMeter = db.collection('powerMeter');
            let collectionUps_A = db.collection('ups_A');
            let collectionUps_B = db.collection('ups_B');
            switch (msgText) {
              case '冷氣電流':
                collectionPowerMeter.findOne({},(err,data) => {
                    if (err) {
                      return console.log(err);
                    }else{
                      dbMsg='冷氣目前電流：' + data.currents.toFixed(2) + '(A)';
                      console.log(dbMsg);
                      db.close();
                      done();
                    }
                  }
                );
                break;
              case 'ups_A電流':
                collectionUps_A.findOne({},(err,data) => {
                    if (err) {
                      return console.log(err);
                    }else{
                      dbMsg='ups_A目前電流：' + Number(data.output_A.outputAmp_A).toFixed(2) + '(A)';
                      console.log(dbMsg);
                      db.close();
                      done();
                    }
                  }
                );
                break;
              case 'ups_B電流':
                collectionUps_B.findOne({},(err,data) => {
                    if (err) {
                      return console.log(err);
                    }else{
                      dbMsg='ups_B目前電流：' + Number(data.output_B.outputAmp_B).toFixed(2) + '(A)';
                      console.log(dbMsg);
                      db.close();
                      done();
                    }
                  }
                );
                break;
              case '濕度':
                collectionPowerMeter.findOne({},(err,data) => {
                    if (err) {
                      return console.log(err);
                    }else{
                      dbMsg='目前濕度：' + data.Humidity.toFixed(2) + '(%)';
                      console.log(dbMsg);
                      db.close();
                      done();
                    }
                  }
                );
                break;
              case '溫度':
                collectionPowerMeter.findOne({},(err,data) => {
                    if (err) {
                      return console.log(err);
                    }else{
                      dbMsg='目前溫度：' + data.Temperature.toFixed(2) + '(°C)';
                      console.log(dbMsg);
                      db.close();
                      done();
                    }
                  }
                );
                break;
              default:
                console.log('pass');
            }
          });
        }
      }) ,
    age : () => {
      console.log(20);
    } ,
    believe : () => {
      console.log('I can do it');
    }
  }