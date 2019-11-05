const MongoClient = require('mongodb').MongoClient;
const co = require('co');

MongoClient.connect("mongodb://10.20.0.19:27017/", (err, client) => {
    db = client.db("smart-factory");

    co(function* () {
        var date = new Date();
        let yesterday = new Date(date.setDate(date.getDate() - 1));
        let yesterdayStart = new Date((new Date(yesterday).getMonth() + 1) + " " + (new Date(yesterday).getDate()) + ", " + new Date(yesterday).getUTCFullYear() + " 00:00:00");
        let yesterdayEnd = new Date((new Date(yesterday).getMonth() + 1) + " " + (new Date(yesterday).getDate()) + ", " + new Date(yesterday).getUTCFullYear() + " 23:59:59");
        let yesterdayPowerMeterPower;
        console.log(yesterday, yesterdayStart, yesterdayEnd);

        yield function (done) {
            var collectionPowerMeterPower = db.collection('powerMeterPower');
            collectionPowerMeterPower.aggregate(
                [{ $match: { "time": { "$gte": yesterdayStart, "$lte": yesterdayEnd } } },
                {
                    $group: {
                        _id: null,
                        powerMeterPower: { $avg: "$power" }
                    }
                }
                ], (err, data) => {
                    if (err) {
                        console.log(err);
                        done();
                    } else {
                        console.log(data);
                        if (data.length != 0) {
                            yesterdayPowerMeterPower = data[0].powerMeterPower;
                        }
                        done();
                    }
                }
            )
        };
    });
});
