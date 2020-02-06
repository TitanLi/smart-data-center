const MongoLocalClient = require('mongodb').MongoClient;
const mqtt = require('mqtt');
const dotenv = require('dotenv').load();
const mqttClient = mqtt.connect(process.env.MQTT);
const MongoLabClient = require('mongodb').MongoClient;
const co = require('co');
const request = require('request-promise');
let localDB, mLabDB;
let findData = {};
let outputFan = 'false', inputFan = 'false', humidity = 'false';
let D0, D1, D2;

MongoLocalClient.connect(process.env.MONGODB, (err, client) => {
    // localDB = client.db("smart-factory");
    localDB = client.db("smart-data-center");
    console.log("connect mongodb on 27017 port");
    localInsert();
});

MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
    if (err) {
        return console.log(err);
    }
    console.log("connect MongoLabClient on 27017 port");
    mLabDB = db;
    mLabInsert();
    mLabContronUpdate();
    setInterval(() => {
        lineBotControl();
    }, 1000);
});

//MQTT connect
mqttClient.on('connect', () => {
    mqttClient.subscribe('UPS_Monitor');
    mqttClient.subscribe('current');
    mqttClient.subscribe('ET7044/DOstatus');
    mqttClient.subscribe('ET7044/write');
});

function localInsert() {
    mqttClient.on('message', (topic, message) => {
        // console.log(topic,JSON.parse(message));
        switch (topic) {
            case "current":
                powerMeterMqttData = JSON.parse(message);
                powerMeterMqttData.time = new Date();
                var collectionPowerMeterLogs = localDB.collection('powerMeter');
                var collectionPowerMeterPower = localDB.collection('powerMeterPower');
                if (powerMeterMqttData) {
                    collectionPowerMeterLogs.insert(powerMeterMqttData, (err, data) => {
                        if (err) {
                            // console.log('collectionPowerMeterLogs data insert failed');
                        } else {
                            // console.log('collectionPowerMeterLogs data insert successfully');
                        }
                    });
                    collectionPowerMeterPower.insert({ "power": powerMeterMqttData.currents * 220 / 1000, "time": new Date() }, (err, data) => {
                        if (err) {
                            // console.log('collectionPowerMeterPower data insert failed');
                        } else {
                            // console.log('collectionPowerMeterPower data insert successfully');
                        }
                    });
                }
                break;
            case "UPS_Monitor":
                upsMqttData = JSON.parse(message);
                upsMqttData.time = new Date();
                var collectionUpsLogs = localDB.collection('ups');
                var collectionUpsPower_A = localDB.collection('upsPower_A');
                var collectionUpsPower_B = localDB.collection('upsPower_B');
                if (upsMqttData) {
                    collectionUpsLogs.insert(upsMqttData, (err, data) => {
                        if (err) {
                            // console.log('collectionUpsLogs data insert failed');
                        } else {
                            // console.log('collectionUpsLogs data insert successfully');
                        }
                    });
                    collectionUpsPower_A.insert({ "power": Number(upsMqttData.output_A.outputWatt_A), "time": new Date() }, (err, data) => {
                        if (err) {
                            // console.log('collectionUpsPower_A data insert failed');
                        } else {
                            // console.log('collectionUpsPower_A data insert successfully');
                        }
                    });
                    collectionUpsPower_B.insert({ "power": Number(upsMqttData.output_B.outputWatt_B), "time": new Date() }, (err, data) => {
                        if (err) {
                            // console.log('collectionUpsPower_B data insert failed');
                        } else {
                            // console.log('collectionUpsPower_B data insert successfully');
                        }
                    });
                }
                break;
            default:
            // console.log('pass');
        }
    });
}

function mLabInsert() {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case "current":
                powerMeterMqttData = JSON.parse(message);
                powerMeterMqttData.time = new Date().toLocaleString();
                var collectionPowerMeter = mLabDB.collection('powerMeter');
                if (powerMeterMqttData) {
                    collectionPowerMeter.update(
                        {},
                        {
                            $set: powerMeterMqttData
                        },
                        { upsert: true },
                        function (err, res) {
                            if (err) {
                                return console.log(err);
                            } else {
                                // console.log('mLab powerMeter data insert successfully');
                            }
                        }
                    );
                }
                break;
            case "UPS_Monitor":
                upsMqttData = JSON.parse(message);
                upsMqttData.time = new Date().toLocaleString();
                var collectionUps_A = mLabDB.collection('ups_A');
                var collectionUps_B = mLabDB.collection('ups_B');
                if (upsMqttData) {
                    collectionUps_A.update(
                        {},
                        {
                            $set: {
                                "connect_A": upsMqttData.connect_A,
                                "ups_Life_A": upsMqttData.ups_Life_A,
                                "input_A": upsMqttData.input_A,
                                "output_A": upsMqttData.output_A,
                                "battery_A": upsMqttData.battery_A,
                                "time": upsMqttData.time
                            }
                        },
                        { upsert: true },
                        function (err, res) {
                            if (err) {
                                return console.log(err);
                            } else {
                                // console.log('mLab ups_A data insert successfully');
                            }
                        }
                    );
                    collectionUps_B.update(
                        {},
                        {
                            $set: {
                                "connect_B": upsMqttData.connect_B,
                                "ups_Life_B": upsMqttData.ups_Life_B,
                                "input_B": upsMqttData.input_B,
                                "output_B": upsMqttData.output_B,
                                "battery_B": upsMqttData.battery_B,
                                "time": upsMqttData.time
                            }
                        },
                        { upsert: true },
                        function (err, res) {
                            if (err) {
                                return console.log(err);
                            } else {
                                // console.log('mLab ups_B data insert successfully');
                            }
                        }
                    );
                }
                break;
            default:
            // console.log('pass');
        }
    });
}

async function lineBotControl() {
    let collectionControl = mLabDB.collection('control');

    await co(function* () {
        yield function (done) {
            collectionControl.findOne(
                {},
                function (err, data) {
                    if (err) {
                        return console.log(err);
                    } else {
                        if (data != null) {
                            findData = data;
                        }
                        // console.log(findData);
                        done();
                    }
                }
            );
        }
    });

    if (JSON.stringify(findData) != '{}') {
        if (findData.inputFan != inputFan || findData.humidity != humidity || findData.outputFan != outputFan) {
            let et7044Status = [JSON.parse(findData.inputFan), JSON.parse(findData.humidity), JSON.parse(findData.outputFan), false, false, false, false, false];
            mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
            outputFan = findData.outputFan;
            inputFan = findData.inputFan;
            humidity = findData.humidity;
        }
    }
}

function mLabContronUpdate() {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case 'ET7044/DOstatus':
                let et7044Status = JSON.parse(message);
                let collectionControl = mLabDB.collection('control');
                if (et7044Status) {
                    collectionControl.update(
                        {},
                        {
                            $set: {
                                'inputFan': et7044Status[0],
                                'humidity': et7044Status[1],
                                'outputFan': et7044Status[2]
                            }
                        },
                        { upsert: true },
                        function (err, res) {
                            if (err) {
                                return console.log(err);
                            } else {
                                // console.log('mLab control data update successfully');
                            }
                        }
                    );

                    //當line開啟裝置，web關閉裝置時驅動
                    if (JSON.parse(outputFan) != et7044Status[0] || JSON.parse(inputFan) != et7044Status[1] || JSON.parse(humidity) != et7044Status[2]) {
                        inputFan = et7044Status[0];
                        humidity = et7044Status[1];
                        outputFan = et7044Status[2];
                    }

                    //ET7044 status translate
                    function getStatus(status) {
                        if (status) {
                            return '開啟';
                        } else {
                            return '關閉';
                        }
                    }

                    //line bot push message api on heroku
                    let options = {
                        method: 'POST',
                        uri: process.env.LINE_BOT_CONTROL,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: {
                            message: "",
                        },
                        json: true
                    };

                    //D0狀態被改變時驅動
                    if (D0 != et7044Status[0]) {
                        options.body.message = `進風風扇：${getStatus(et7044Status[0])}`;
                        console.log(`進風風扇：${getStatus(et7044Status[0])}`);
                        // request(options);
                    }

                    //D1狀態被改變時驅動
                    if (D1 != et7044Status[1]) {
                        options.body.message = `加溼器：${getStatus(et7044Status[1])}`;
                        console.log(`加溼器：${getStatus(et7044Status[1])}`);
                        // request(options);
                    }

                    //D2狀態被改變時驅動
                    if (D2 != et7044Status[2]) {
                        options.body.message = `排風風扇：${getStatus(et7044Status[2])}`;
                        console.log(`排風風扇：${getStatus(et7044Status[2])}`);
                        // request(options);
                    }

                    //更新ET7044 D0~D3狀態
                    D0 = et7044Status[0];
                    D1 = et7044Status[1];
                    D2 = et7044Status[2];
                }
                break;
            default:
                console.log('pass');
        }
    });
}