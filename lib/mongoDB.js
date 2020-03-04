class MongoDB {
    constructor(db) {
        this.db = db;
        this.avgPower = function (col) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                let sumPower = 0
                collection.aggregate(
                    [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%G/%m/%d",
                                        date: "$time",
                                        timezone: "Asia/Taipei"
                                    }
                                },
                                avgPower: { $avg: "$power" }
                            }
                        },
                        { $sort: { _id: -1 } }
                    ], (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(data);
                            if (data.length != 0) {
                                data.map((obj) => {
                                    // 將平均功耗 * 24 hr
                                    sumPower += obj.avgPower * 24
                                })
                            }
                            console.log(`${col}:${sumPower}`)
                            resolve(sumPower);
                        }
                    });
            });
        }

        this.yesterdayAvgPower = function (col, Start, End) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                let sumPower = 0
                collection.aggregate(
                    [{ $match: { "time": { "$gte": Start, "$lte": End } } },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%G/%m/%d",
                                    date: "$time",
                                    timezone: "Asia/Taipei"
                                }
                            },
                            power: { $avg: "$power" }
                        }
                    }
                    ], (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(data);
                            if (data.length != 0) {
                                sumPower = data[0].power;
                            }
                            console.log(`${col}:${sumPower}`)
                            resolve(sumPower);
                        }
                    });
            });
        }

        this.cameraPower = function (col) {
            return new Promise(function (resolve, reject) {
                let collection = db.collection(col);
                collection.find().sort({ datetime: -1 }).limit(2).toArray(function (err, items) {
                    if (items.length == 0) {
                        let cameraPowerData = {
                            cameraPowerConsumption: 0,
                            cameraPower: 0,
                            startTime: new Date().toLocaleString(),
                            endTime: new Date().toLocaleString()
                        }
                        resolve(cameraPowerData);
                    } else if (items.length == 1) {
                        let cameraPowerData = {
                            cameraPowerConsumption: Number(items[0].camera_power_consumption),
                            cameraPower: Number(items[0].camera_power_consumption),
                            startTime: new Date(items[0].datetime).toLocaleString(),
                            endTime: '第一筆資料'
                        }
                        resolve(cameraPowerData);
                    } else {
                        let cameraPowerData = {
                            cameraPowerConsumption: Number(items[0].camera_power_consumption - items[1].camera_power_consumption),
                            cameraPower: Number(items[0].camera_power_consumption),
                            startTime: new Date(items[1].datetime).toLocaleString(),
                            endTime: new Date(items[0].datetime).toLocaleString()
                        }
                        resolve(cameraPowerData);
                    }
                });
            });
        }
    }

    // 提供圓餅提資料
    async aggregateAvgPieData() {
        // 將Power以一天為一個group計算平均消耗功率
        let sum = 0, powerMeterPower = 0, upsPower_A = 0, upsPower_B = 0;
        powerMeterPower = await this.avgPower('powerMeterPower');
        upsPower_A = await this.avgPower('upsPower_A');
        upsPower_B = await this.avgPower('upsPower_B');
        sum = powerMeterPower + upsPower_A + upsPower_B;
        let piePercent = [
            { name: '冷氣', y: powerMeterPower / sum * 100 },
            { name: 'UPS1', y: upsPower_A / sum * 100 },
            { name: 'UPS2', y: upsPower_B / sum * 100 }
        ];
        return piePercent;
    }

    // 計算昨日各設備消耗功率
    async yesterdayAvgPowerRobot() {
        let yesterdayStart = new Date(new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString() + " 00:00:00");
        let yesterdayEnd = new Date(new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString() + " 23:59:59");
        console.log(`start time:${new Date(yesterdayStart).toLocaleString({ timeZone: "Asia/Taipei" })} , end time:${new Date(yesterdayEnd).toLocaleString({ timeZone: "Asia/Taipei" })}`);
        let yesterdayPowerMeterPower = await this.yesterdayAvgPower('powerMeterPower', yesterdayStart, yesterdayEnd);
        let yesterdayUpsPower_A = await this.yesterdayAvgPower('upsPower_A', yesterdayStart, yesterdayEnd);
        let yesterdayUpsPower_B = await this.yesterdayAvgPower('upsPower_B', yesterdayStart, yesterdayEnd);
        let cameraPowerLog = await this.cameraPower('cameraPowerLog');
        console.log(cameraPowerLog);
        let yesterdayPower = {
            'powerMeterPower': (yesterdayPowerMeterPower * 24).toFixed(2),
            // UPS補償電流
            'upsPower_A': (yesterdayUpsPower_A * 24 + 1.5 * 220 * 24 / 1000).toFixed(2),
            'upsPower_B': (yesterdayUpsPower_B * 24 + 2 * 220 * 24 / 1000).toFixed(2),
            'cameraPowerConsumption': (cameraPowerLog.cameraPowerConsumption).toFixed(2),
            'cameraPower': (cameraPowerLog.cameraPower).toFixed(2),
            'cameraStartTime': cameraPowerLog.startTime,
            'cameraEndTime': cameraPowerLog.endTime,
            // 水塔馬達預估
            'waterTank': (5 * 220 * 1.732 * 24 / 1000).toFixed(2),
            'time': new Date().toLocaleString()
        };
        console.log(yesterdayPower);
        return yesterdayPower;
    }

    insertCameraPower(cameraPowerData) {
        return new Promise(function (resolve, reject) {
            let cameraPowerLog = this.db.collection('cameraPowerLog');
            let insertData = {
                "datetime": new Date(),
                "camera_power_consumption": Number(cameraPowerData)
            };
            cameraPowerLog.insert(insertData, function (err, records) {
                if (err) {
                    reject(err);
                }
                console.log(records);
                resolve();
            });
        }.bind(this));
    }
}
module.exports = MongoDB;
