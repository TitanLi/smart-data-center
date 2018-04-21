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
const mongoDB = require('./lib/mongoDB.js');

const app = new koa();
const router = Router();
const server = http.createServer(app.callback());
const io = socket(server);
// io.emit('news',{url:url});

const mqttClient = mqtt.connect('mqtt://10.20.0.90:1883');

//power-meter MQTT input data
var powerMeterMqttData;
//power-meter data
var humidity,temperature,powerMeterCurrent;
//UPS MQTT input data
var upsMqttData;
//UPS1 data
var inputVolt_A,inputFreq_A,outputVolt_A,outputFreq_A,outputAmp_A,outputWatt_A,systemMode_A,outputPercent_A,batteryHealth_A,batteryCharge_Mode_A,batteryTemp_A,batteryRemain_A;
//UPS2 data
var inputVolt_B,inputFreq_B,outputVolt_B,outputFreq_B,outputAmp_B,outputWatt_B,systemMode_B,outputPercent_B,batteryHealth_B,batteryCharge_Mode_B,batteryTemp_B,batteryRemain_B;
//database
var db;

var mongodb = new mongoDB(io,co);

mqttClient.on('connect',() => {
  mqttClient.subscribe('UPS_Monitor');
  mqttClient.subscribe('current');
});

mqttClient.on('message',(topic,message) => {
  // console.log(topic,JSON.parse(message));
  switch (topic) {
    case "current":
      powerMeterMqttData = JSON.parse(message);
      io.emit('humidity',powerMeterMqttData.Humidity);
      io.emit('temperature',powerMeterMqttData.Temperature);
      io.emit('current',powerMeterMqttData.currents);
      break;
    case "UPS_Monitor":
      upsMqttData = JSON.parse(message);
      io.emit('inputVolt_A',upsMqttData.input_A.inputVolt_A);
      io.emit('inputFreq_A',upsMqttData.input_A.inputFreq_A);
      io.emit('outputVolt_A',upsMqttData.output_A.outputVolt_A);
      io.emit('outputFreq_A',upsMqttData.output_A.outputFreq_A);
      io.emit('outputAmp_A',upsMqttData.output_A.outputAmp_A);
      io.emit('outputWatt_A',upsMqttData.output_A.outputWatt_A);
      io.emit('systemMode_A',upsMqttData.output_A.systemMode_A);
      io.emit('outputPercent_A',upsMqttData.output_A.outputPercent_A);
      io.emit('batteryHealth_A',upsMqttData.battery_A.status.batteryHealth_A);
      io.emit('batteryCharge_Mode_A',upsMqttData.battery_A.status.batteryCharge_Mode_A.split("(")[0]);
      io.emit('batteryTemp_A',upsMqttData.battery_A.status.batteryTemp_A);
      io.emit('batteryRemain_A',upsMqttData.battery_A.status.batteryRemain_Min_A == "None By Charging (充電中)" || upsMqttData.battery_A.status.batteryRemain_Sec_A == "None By Charging (充電中)" ?
                                "充電中" : upsMqttData.battery_A.status.batteryRemain_Min_A + ":" + upsMqttData.battery_A.status.batteryRemain_Sec_A);
      io.emit('batteryRemain_Percent_A',upsMqttData.battery_A.status.batteryRemain_Percent_A);
      io.emit('inputVolt_B',upsMqttData.input_B.inputVolt_B);
      io.emit('inputFreq_B',upsMqttData.input_B.inputFreq_B);
      io.emit('outputVolt_B',upsMqttData.output_B.outputVolt_B);
      io.emit('outputFreq_B',upsMqttData.output_B.outputFreq_B);
      io.emit('outputAmp_B',upsMqttData.output_B.outputAmp_B);
      io.emit('outputWatt_B',upsMqttData.output_B.outputWatt_B);
      io.emit('systemMode_B',upsMqttData.output_B.systemMode_B);
      io.emit('outputPercent_B',upsMqttData.output_B.outputPercent_B);
      io.emit('batteryHealth_B',upsMqttData.battery_B.status.batteryHealth_B);
      io.emit('batteryCharge_Mode_B',upsMqttData.battery_B.status.batteryCharge_Mode_B.split("(")[0]);
      io.emit('batteryTemp_B',upsMqttData.battery_B.status.batteryTemp_B);
      io.emit('batteryRemain_B',upsMqttData.battery_B.status.batteryRemain_Min_B == "None By Charging (充電中)" || upsMqttData.battery_B.status.batteryRemain_Sec_B == "None By Charging (充電中)" ?
                                "充電中" : upsMqttData.battery_B.status.batteryRemain_Min_B + ":" + upsMqttData.battery_B.status.batteryRemain_Sec_B);
      io.emit('batteryRemain_Percent_B',upsMqttData.battery_B.status.batteryRemain_Percent_B);
      break;
    default:
      console.log('pass');
  }
});

//UPS MQTT Topic
//mosquitto_sub -h 10.20.0.90 -t UPS_Monitor

//每小時更新圓餅圖
setInterval(() => {
  mongodb.aggregateLastHoursAvgPieData();
},3600000);

app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(serve(__dirname+'/public/img'));
app.use(serve(__dirname+'/public/css'));
app.use(serve(__dirname+'/public/script'));
app.use(serve(__dirname+'/lib'));
app.use(router.routes());

app.context.render = co.wrap(render({
  root: __dirname + '/public/views',
  autoescape: true,
  cache: 'memory',
  ext: 'html',
}));

router.get('/',index);
router.get('/test',test);
router.get('/pie',pie);
router.get('/temperature',temperature);

async function index(ctx){
  var piePercent = await mongodb.aggregateLastHoursAvgPieData();
  ctx.body = await ctx.render('smart',{
                                       "powerMeterPower":piePercent[0].y,
                                       "upsPower_A":piePercent[1].y,
                                       "upsPower_B":piePercent[2].y
                                     });
}

async function test(ctx){
  ctx.body = await ctx.render('test');
}

async function pie(ctx){
  ctx.body = await ctx.render('pie');
}

async function temperature(ctx){
  ctx.body = await ctx.render('temperature');
}

server.listen(3000,function(){
  console.log('listening on port 3000');
});
