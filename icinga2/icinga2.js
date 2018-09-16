const koa = require('koa');
const Router = require('koa-router');
const mqtt = require('mqtt');
const logger = require('koa-logger');
const dotenv = require('dotenv').load();

const app = new koa();
const router = Router();

app.use(logger());

const mqttClient = mqtt.connect(process.env.MQTT);

let DL303_co2 = "", DL303_humi = "", DL303_temp = "", DL303_dewp = "";
let ET7044_status = "[false,false,false,false,false,false,false,false]";
let Humidity = "", Temperature = "", currents = "";
mqttClient.on('connect', () => {
    mqttClient.subscribe('current');
    mqttClient.subscribe('DL303/#')
    mqttClient.subscribe('ET7044/DOstatus');
});

mqttClient.on('message', function (topic, message) {
    //console.log(topic);
    switch (topic) {
        //co2
        case 'DL303/CO2':
            DL303_co2 = message.toString();
            break;
        //relative Humidity
        case 'DL303/RH':
            DL303_humi = message.toString();
            break;
        //temperature(°C)
        case 'DL303/TC':
            DL303_temp = message.toString();
            break;
        //dew point(°C)
        case 'DL303/DC':
            DL303_dewp = message.toString();
            break;
        case 'ET7044/write':
            ET7044_status = message.toString();
            break;
        case 'current':
            Humidity = JSON.parse(message).Humidity;
            Temperature = JSON.parse(message).Temperature;
            currents = JSON.parse(message).currents;
            break;

    }
    topic = ""; //目前topic歸零
})

router.get('/', async function (ctx) {
    ctx.body = {
        "DL303_co2": DL303_co2,
        "DL303_humi": DL303_humi,
        "DL303_temp": DL303_temp,
        "DL303_dewp": DL303_dewp,
        "ET7044_status": ET7044_status,
        "Humidity": Humidity,
        "Temperature": Temperature,
        "currents": currents
    }
});

app.use(router.routes());
app.listen(process.env.ICINGA2_PORT, function () {
    console.log("App now running on port", 3001);
});