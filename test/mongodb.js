const MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/", (err, client) => {
    db = client.db("smart-factory");

    // 2018-04-20T09:00:00.000Z 2018-04-20T09:59:59.000Z
    //test

    // { $group: {
    //             _id: {
    //               $hour: {
    //                 date: "$time",
    //                 timezone: "Asia/Taipei"
    //               }
    //             },
    //             upsPower_A:{$avg:"$power"}
    //           }
    // }
    var collection = db.collection('upsPower_A');
    collection.aggregate(
          [ { $match : {"time":{"$gte":new Date("2018-04-20T09:00:00.000Z"),"$lte":new Date("2018-04-20T09:59:59.000Z")}}},

          ],(err,data) => {
            console.log(data);
          });
    console.log(123);
});
