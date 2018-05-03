const MongoClient = require('mongodb').MongoClient;
const co = require('co');

MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    db = client.db("smart-factory");
});
module.exports = function(io){
  this.io = io;
  //過去一小時消耗Power
  this.date;
  this.lastHours;
  this.lastestHours;
  this.lastHoursSum;
  this.lastHoursPowerMeterPower;
  this.lastHoursUpsPower_A;
  this.lastHoursUpsPower_B;
  this.lastHoursPiePercent;
  //過去消耗Power
  this.sum;
  this.powerMeterPower;
  this.upsPower_A;
  this.upsPower_B;
  this.piePercent;
  //昨天消耗Power
  this.yesterday;
  this.yesterdayStart;
  this.yesterdayEnd;
  this.yesterdayPowerMeterPower;
  this.yesterdayUpsPower_A;
  this.yesterdayUpsPower_B;
  this.yesterdayPower;

  this.aggregateLastHoursAvgPieData = () => {
    return co(function * (){
      this.date = (new Date().getMonth()+1)+" "+new Date().getDate()+", "+new Date().getUTCFullYear()+" ";
      this.lastHours = new Date(this.date+(new Date().getHours()-1) +":00:00");
      this.lastestHours = new Date(this.date+(new Date().getHours()-1) +":59:59");
      this.lastHoursSum,this.lastHoursPowerMeterPower = 0,this.lastHoursUpsPower_A = 0,this.lastHoursUpsPower_B = 0;
      console.log(this.lastHours,this.lastestHours);

      yield function(done){
        var collectionPowerMeterPower = db.collection('powerMeterPower');
        collectionPowerMeterPower.aggregate(
              [ { $match : {"time":{"$gte":this.lastHours,"$lte":this.lastestHours}}},
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            powerMeterPower:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.lastHoursPowerMeterPower = data[0].powerMeterPower;
                  done()
                }
              });
      };

      yield function(done){
        var collectionUpsPower_A = db.collection('upsPower_A');
        collectionUpsPower_A.aggregate(
              [ { $match : {"time":{"$gte":lastHours,"$lte":lastestHours}}},
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            upsPower_A:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.lastHoursUpsPower_A = data[0].upsPower_A;
                  done()
                }
              });
      }

      yield function(done){
        var collectionUpsPower_B = db.collection('upsPower_B');
        collectionUpsPower_B.aggregate(
              [ { $match : {"time":{"$gte":lastHours,"$lte":lastestHours}}},
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            upsPower_B:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.lastHoursUpsPower_B = data[0].upsPower_B;
                  done()
                }
              });
      }

      this.lastHoursSum = this.lastHoursPowerMeterPower + this.lastHoursUpsPower_A + this.lastHoursUpsPower_B;
      // console.log(sum);
      this.lastHoursPiePercent = [
                  { name: '冷氣', y: lastHoursPowerMeterPower/lastHoursSum*100 },
                  { name: 'UPS1', y: lastHoursUpsPower_A/lastHoursSum*100 },
                  { name: 'UPS2', y: lastHoursUpsPower_B/lastHoursSum*100 }
                ];
      // console.log(piePercent);
      io.emit('piePercent',this.lastHoursPiePercent);
      return this.lastHoursPiePercent;
    });
  }

  this.aggregateAvgPieData = () => {
    return co(function * (){
      this.sum,this.powerMeterPower = 0,this.upsPower_A = 0,this.upsPower_B = 0;

      yield function(done){
        var collectionPowerMeterPower = db.collection('powerMeterPower');
        collectionPowerMeterPower.aggregate(
              [
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            powerMeterPower:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.powerMeterPower = data[0].powerMeterPower;
                  done()
                }
              });
      };

      yield function(done){
        var collectionUpsPower_A = db.collection('upsPower_A');
        collectionUpsPower_A.aggregate(
              [
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            upsPower_A:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  upsPower_A = data[0].upsPower_A;
                  done()
                }
              });
      }

      yield function(done){
        var collectionUpsPower_B = db.collection('upsPower_B');
        collectionUpsPower_B.aggregate(
              [
                { $group: {
                            _id: {
                              $hour: {
                                date: "$time",
                                timezone: "Asia/Taipei"
                              }
                            },
                            upsPower_B:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  upsPower_B = data[0].upsPower_B;
                  done()
                }
              });
      }

      this.sum = this.powerMeterPower + this.upsPower_A + this.upsPower_B;
      // console.log(sum);
      this.piePercent = [
                  { name: '冷氣', y: powerMeterPower/sum*100 },
                  { name: 'UPS1', y: upsPower_A/sum*100 },
                  { name: 'UPS2', y: upsPower_B/sum*100 }
                ];
      // console.log(piePercent);
      io.emit('piePercent',this.piePercent);
      return this.piePercent;
    });
  }

  this.aggregateYesterdayAvgPowerRobot = () => {
    return co(function * (){
      this.yesterday = (new Date().getMonth()+1)+" "+(new Date().getDate())+", "+new Date().getUTCFullYear()+" ";
      this.yesterdayStart = new Date(this.yesterday+(new Date().getHours()) +":00:00");
      this.yesterdayEnd = new Date(this.yesterday+(new Date().getHours()) +":59:59");
      this.yesterdayPowerMeterPower = 0,this.yesterdayUpsPower_A = 0,this.yesterdayUpsPower_B = 0;
      console.log(this.yesterdayStart,this.yesterdayEnd);

      yield function(done){
        var collectionPowerMeterPower = db.collection('powerMeterPower');
        collectionPowerMeterPower.aggregate(
              [ { $match : {"time":{"$gte":this.yesterdayStart,"$lte":this.yesterdayEnd}}},
                { $group: {
                            _id : null,
                            powerMeterPower:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.yesterdayPowerMeterPower = data[0].powerMeterPower;
                  done()
                }
              });
      };

      yield function(done){
        var collectionUpsPower_A = db.collection('upsPower_A');
        collectionUpsPower_A.aggregate(
              [ { $match : {"time":{"$gte":this.yesterdayStart,"$lte":this.yesterdayEnd}}},
                { $group: {
                            _id : null,
                            upsPower_A:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.yesterdayUpsPower_A = data[0].upsPower_A;
                  done()
                }
              });
      }

      yield function(done){
        var collectionUpsPower_B = db.collection('upsPower_B');
        collectionUpsPower_B.aggregate(
              [ { $match : {"time":{"$gte":this.yesterdayStart,"$lte":this.yesterdayEnd}}},
                { $group: {
                            _id : null,
                            upsPower_B:{$avg:"$power"}
                          }
                }
              ],(err,data) => {
                if(err){
                  console.log(err);
                }else{
                  console.log(data);
                  this.yesterdayUpsPower_B = data[0].upsPower_B;
                  done()
                }
              });
      }

      this.yesterdayPower = {
                              'powerMeterPower':(yesterdayPowerMeterPower*24).toFixed(2),
                              'upsPower_A':(yesterdayUpsPower_A*24).toFixed(2),
                              'upsPower_B':(yesterdayUpsPower_B*24).toFixed(2)
                            };
      // console.log(piePercent);
      console.log(yesterdayPower);
      io.emit('yesterdayPower',this.yesterdayPower);
      return this.yesterdayPower;
    });
  }
}
