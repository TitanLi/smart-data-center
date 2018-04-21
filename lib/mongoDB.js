const MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    db = client.db("smart-factory");
});
module.exports = function(io,co){
  this.io = io;
  this.co = co;
  this.date;
  this.lastHours;
  this.lastestHours;
  this.sum;
  this.powerMeterPower;
  this.upsPower_A;
  this.upsPower_B;
  this.collectionPowerMeterPower;
  this.piePercent;

  this.aggregateLastHoursAvgPieData = () => {
    return co(function * (){
      this.date = (new Date().getMonth()+1)+" "+new Date().getDate()+", "+new Date().getUTCFullYear()+" ";
      this.lastHours = new Date(date+(new Date().getHours()) +":00:00");
      this.lastestHours = new Date(date+(new Date().getHours()) +":59:59");
      this.sum,this.powerMeterPower = 0,this.upsPower_A = 0,this.upsPower_B = 0;
      console.log(this.lastHours,this.lastestHours);

      yield function(done){
        this.collectionPowerMeterPower = db.collection('powerMeterPower');
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
                  this.powerMeterPower = data[0].powerMeterPower;
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
                  upsPower_A = data[0].upsPower_A;
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
}
