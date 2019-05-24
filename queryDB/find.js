const MongoLocalClient = require('mongodb').MongoClient;
const fs = require('fs');

MongoLocalClient.connect('mongodb://10.20.0.19:27017/', (err, client) => {
    localDB = client.db("smart-data-center");
    console.log("connect mongodb on 27017 port");

    let upsPower_A = localDB.collection('upsPower_A');
    
    upsPower_A.aggregate(
            [{
                $project:{
                    _id:false,
                    power:true,
                    time:{
                        $dateFromString:{
                            dateString:{
                                $dateToString:{
                                    format:"%Y-%m-%d %H:%M:%S",
                                    date:{
                                        $add:["$time",8 * 3600000]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $match:{
                    time:{
                        "$gte":new Date("2019-05-23T17:00:00.000Z"),
                        "$lt" :new Date("2019-05-24T00:00:00.000Z")
                    }
                }
            }
        ]).toArray(function(err, result){
            console.log(result)
            fs.writeFile('./upsPower_A.json',JSON.stringify(result),function(err){
                if(!err){
                  console.log('ok');
                }else{
                  console.log('Failed to write');
                }
              });
        })
});