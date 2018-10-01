const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const render = require('koa-swig');
const co = require('co');
const mqtt = require('mqtt');
const http = require('http');
const socket = require('socket.io');
const dotenv = require('dotenv').load();
const request = require('request-promise');
const MongoClient = require('mongodb').MongoClient;
const mongoDB = require('./lib/mongoDB.js');

const app = new koa();
const router = Router();
const server = http.createServer(app.callback());
const io = socket(server);
//database
let mongodb;
let piePercent = [
  { name: '冷氣', y: 100 },
  { name: 'UPS1', y: 100 },
  { name: 'UPS2', y: 100 }
];
MongoClient.connect(process.env.MONGODB, (err, client) => {
  db = client.db("smart-data-center");
  mongodb = new mongoDB(db, io);
  new Promise(function (resolve, reject) {
    resolve(mongodb.aggregateAvgPieData());
  }).then(function (value) {
    console.log(new Date() + JSON.stringify(value));
    piePercent = value;
  });
});
// io.emit('news',{url:url});

const mqttClient = mqtt.connect(process.env.MQTT);

//ET7044 status
let et7044Status, D0, D1, D2;
//power-meter data
// var humidity,temperature,powerMeterCurrent;
//UPS1 data
// var inputVolt_A,inputFreq_A,outputVolt_A,outputFreq_A,outputAmp_A,outputWatt_A,systemMode_A,outputPercent_A,batteryHealth_A,batteryCharge_Mode_A,batteryTemp_A,batteryRemain_A;
//UPS2 data
// var inputVolt_B,inputFreq_B,outputVolt_B,outputFreq_B,outputAmp_B,outputWatt_B,systemMode_B,outputPercent_B,batteryHealth_B,batteryCharge_Mode_B,batteryTemp_B,batteryRemain_B;

mqttClient.on('connect', () => {
  mqttClient.subscribe('UPS_Monitor');
  mqttClient.subscribe('current');
  mqttClient.subscribe('ET7044/DOstatus');
});

mqttClient.on('message', (topic, message) => {
  // console.log(topic,JSON.parse(message));
  switch (topic) {
    //power-meter MQTT input data
    case 'current':
      let powerMeterMqttData = JSON.parse(message);
      io.emit('humidity', powerMeterMqttData.Humidity);
      io.emit('temperature', powerMeterMqttData.Temperature);
      io.emit('current', powerMeterMqttData.currents);
      break;
    //UPS MQTT input data
    case 'UPS_Monitor':
      let upsMqttData = JSON.parse(message);
      io.emit('inputVolt_A', upsMqttData.input_A.inputVolt_A);
      io.emit('inputFreq_A', upsMqttData.input_A.inputFreq_A);
      io.emit('outputVolt_A', upsMqttData.output_A.outputVolt_A);
      io.emit('outputFreq_A', upsMqttData.output_A.outputFreq_A);
      io.emit('outputAmp_A', upsMqttData.output_A.outputAmp_A);
      io.emit('outputWatt_A', upsMqttData.output_A.outputWatt_A);
      io.emit('systemMode_A', upsMqttData.output_A.systemMode_A);
      io.emit('outputPercent_A', upsMqttData.output_A.outputPercent_A);
      io.emit('batteryHealth_A', upsMqttData.battery_A.status.batteryHealth_A);
      io.emit('batteryCharge_Mode_A', upsMqttData.battery_A.status.batteryCharge_Mode_A.split("(")[0]);
      io.emit('batteryTemp_A', upsMqttData.battery_A.status.batteryTemp_A);
      io.emit('batteryRemain_A', upsMqttData.battery_A.status.batteryRemain_Min_A == "None By Charging (充電中)" || upsMqttData.battery_A.status.batteryRemain_Sec_A == "None By Charging (充電中)" ?
        "充電中" : upsMqttData.battery_A.status.batteryRemain_Min_A + ":" + upsMqttData.battery_A.status.batteryRemain_Sec_A);
      io.emit('batteryRemain_Percent_A', upsMqttData.battery_A.status.batteryRemain_Percent_A);
      io.emit('inputVolt_B', upsMqttData.input_B.inputVolt_B);
      io.emit('inputFreq_B', upsMqttData.input_B.inputFreq_B);
      io.emit('outputVolt_B', upsMqttData.output_B.outputVolt_B);
      io.emit('outputFreq_B', upsMqttData.output_B.outputFreq_B);
      io.emit('outputAmp_B', upsMqttData.output_B.outputAmp_B);
      io.emit('outputWatt_B', upsMqttData.output_B.outputWatt_B);
      io.emit('systemMode_B', upsMqttData.output_B.systemMode_B);
      io.emit('outputPercent_B', upsMqttData.output_B.outputPercent_B);
      io.emit('batteryHealth_B', upsMqttData.battery_B.status.batteryHealth_B);
      io.emit('batteryCharge_Mode_B', upsMqttData.battery_B.status.batteryCharge_Mode_B.split("(")[0]);
      io.emit('batteryTemp_B', upsMqttData.battery_B.status.batteryTemp_B);
      io.emit('batteryRemain_B', upsMqttData.battery_B.status.batteryRemain_Min_B == "None By Charging (充電中)" || upsMqttData.battery_B.status.batteryRemain_Sec_B == "None By Charging (充電中)" ?
        "充電中" : upsMqttData.battery_B.status.batteryRemain_Min_B + ":" + upsMqttData.battery_B.status.batteryRemain_Sec_B);
      io.emit('batteryRemain_Percent_B', upsMqttData.battery_B.status.batteryRemain_Percent_B);
      break;
    case 'ET7044/DOstatus':
      et7044Status = JSON.parse(message);
      io.emit('D0', et7044Status[0]);
      io.emit('D1', et7044Status[1]);
      io.emit('D2', et7044Status[2]);
      //ET7044 status translate
      function getStatus(status) {
        if (status) {
          return '開啟';
        } else {
          return '關閉';
        }
      }
      //D0狀態被改變時驅動
      if (D0 != et7044Status[0]) {
        io.emit('ET7044', `${new Date().toLocaleString('zh-tw')} 進風風扇：${getStatus(et7044Status[0])}\n`);
      }

      //D1狀態被改變時驅動
      if (D1 != et7044Status[1]) {
        io.emit('ET7044', `${new Date().toLocaleString('zh-tw')} 加溼器：${getStatus(et7044Status[1])}\n`);
      }

      //D2狀態被改變時驅動
      if (D2 != et7044Status[2]) {
        io.emit('ET7044', `${new Date().toLocaleString('zh-tw')} 排風風扇：${getStatus(et7044Status[2])}\n`);
      }

      //更新ET7044 D0~D3狀態
      D0 = et7044Status[0];
      D1 = et7044Status[1];
      D2 = et7044Status[2];
      break;
    default:
      console.log('pass');
  }
});

//UPS MQTT Topic
//mosquitto_sub -h 10.20.0.90 -t UPS_Monitor

//更新圓餅圖
setInterval(() => {
  new Promise(function (resolve, reject) {
    resolve(mongodb.aggregateAvgPieData());
  }).then(function (value) {
    console.log(new Date() + JSON.stringify(value));
    piePercent = value;
  });
}, 600000);

// setInterval(() => {
//   mongodb.aggregateYesterdayAvgPowerRobot();
// },10000);

setInterval(() => {
  if (new Date().toLocaleString('zh-tw').split(' ')[1] == "08:01:00") {
    let push = async () => {
      let data = await mongodb.aggregateYesterdayAvgPowerRobot();
      let options = {
        method: 'POST',
        uri: 'https://smart-factory-robot.herokuapp.com/post/push',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          powerMeterPower: data.powerMeterPower,
          upsPower_A: data.upsPower_A,
          upsPower_B: data.upsPower_B
        },
        json: true
      }
      await request(options).then(function (parsedBody) {
        console.log(parsedBody);
        console.log('aggregateYesterdayAvgPowerRobot post success')
      }).catch(function (err) {
        console.error(err);
        push();
      });
    }
    push();
  }
}, 1000);

app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(serve(__dirname + '/public/img'));
app.use(serve(__dirname + '/public/css'));
app.use(serve(__dirname + '/public/script'));
app.use(serve(__dirname + '/lib'));
app.use(router.routes());

app.context.render = co.wrap(render({
  root: __dirname + '/public/views',
  autoescape: true,
  cache: 'memory',
  ext: 'html',
}));

router.get('/', index);
router.get('/test', test);
router.get('/pie', pie);
router.get('/temperature', temperature);
router.post('/ET7044', et7044);

async function index(ctx) {
  ctx.body = await ctx.render('smart', {
    "powerMeterPower": piePercent[0].y,
    "upsPower_A": piePercent[1].y,
    "upsPower_B": piePercent[2].y,
    "socket": process.env.SOCKET
  });
}

async function test(ctx) {
  ctx.body = await ctx.render('test');
}

async function pie(ctx) {
  ctx.body = await ctx.render('pie');
}

async function temperature(ctx) {
  ctx.body = await ctx.render('temperature');
}

async function et7044(ctx) {
  let et7044 = ctx.request.body.data;
  switch (et7044) {
    case 'D0':
      et7044Status[0] = !et7044Status[0];
      mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
      break;
    case 'D1':
      et7044Status[1] = !et7044Status[1];
      mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
      break;
    case 'D2':
      et7044Status[2] = !et7044Status[2];
      mqttClient.publish('ET7044/write', JSON.stringify(et7044Status));
      break;
    default:
      console.log('pass');
      break;
  }
  console.log(et7044);
  ctx.body = et7044;
}

server.listen(process.env.PORT, function () {
  let port = server.address().port;
  console.log("App now running on port", port);
});
