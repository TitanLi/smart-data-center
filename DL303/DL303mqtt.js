const mqtt = require('mqtt');
const dotenv = require('dotenv').load();
const client = mqtt.connect(process.env.MQTT);
const MongoLabClient = require('mongodb').MongoClient;
let DL303_co2;
let DL303_humi;
let DL303_temp;
let DL303_dewp;
// let mLab; 

MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
    if (err) {
        return console.log(err);
    }
    // mLab = db;
    console.log("connect MongoLabClient on 27017 port");
    setInterval(() => {
        let collectionDL303 = db.collection('dl303');
        collectionDL303.update(
            {},
            {
                $set: {
                    'DL303_co2': DL303_co2,
                    'DL303_humi': DL303_humi,
                    'DL303_temp': DL303_temp,
                    'DL303_dewp': DL303_dewp
                }
            },
            { upsert: true },
            function (err, res) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log('mLab DL303 data insert successfully');
                }
            }
        );
    }, 1000);
});

//MQTT connect
client.on('connect', function () {
    console.log('connect');
    //subscribe DL303 MQTT topic
    client.subscribe('DL303/#');
    // client.subscribe('DL303/CO2') //co2
    // client.subscribe('DL303/RH') // humidity
    // client.subscribe('DL303/TC') // temperature *c
    // client.subscribe('DL303/DC') // dew point *c
});

//MQTT message
client.on('message', function (topic, message) {
    console.log(topic);
    switch (topic) {
        case 'DL303/CO2':
            DL303_co2 = Number(message);
            console.log('get DL303/CO2 message: %s', message)
            break;
        case 'DL303/RH':
            DL303_humi = Number(message);
            console.log('get DL303/RH message: %s', message)
            break;
        case 'DL303/TC':
            DL303_temp = Number(message);
            console.log('get DL303/TF message: %s', message)
            break;
        case 'DL303/DC':
            DL303_dewp = Number(message);
            console.log('get DL303/DC message: %s', message)
            break;
    }
    topic = ""; //目前topic歸零
    console.log('----------------------');
});

//MQTT error
client.on('error', function (err) {
    console.log('MQTT on error', err);
});

//MQTT offline
client.on('offline', function () {
    console.log('on offline');
});

//MQTT reconnect
client.on('reconnect', function () {
    console.log('on reconnect');
});

//MQTT offline
client.on('offline', function () {
    console.log('on offline');
});
