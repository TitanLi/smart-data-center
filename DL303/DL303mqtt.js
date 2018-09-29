
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://10.20.0.19:1883');
let DL303_co2;
let DL303_humi;
let DL303_temp;
let DL303_dewp;

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
            DL303_co2 = message.toString();
            console.log('get DL303/CO2 message: %s', message)
            break;
        case 'DL303/RH':
            DL303_humi = message.toString();
            console.log('get DL303/RH message: %s', message)
            break;
        case 'DL303/TC':
            DL303_temp = message.toString();
            console.log('get DL303/TF message: %s', message)
            break;
        case 'DL303/DC':
            DL303_dewp = message.toString();
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
