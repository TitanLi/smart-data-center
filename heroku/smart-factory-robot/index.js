const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const render = require('koa-swig');
const co = require('co');
const dotenv = require('dotenv').load();
// 送 Request 用 ( 也要安裝 request package )
const request = require('request-promise');
// 載入 crypto ，等下要加密
const crypto = require('crypto');
const Linebot = require('./lib/linebot.js');

const app = new koa();
const router = Router();

const linebot = new Linebot(process.env.channelSecret,process.env.lineBotToken);

var test = "Hello Koa";
var userMessages;
var dbMsg;

// var mongoLab = function * (msgText){
//   console.log(msgText);
//   yield function(done){
//     MongoLabClient.connect(process.env.MONGO_URL, (err, db) => {
//       if (err) {
//         return console.log(err);
//       }
//       console.log("connect MongoLabClient on 27017 port");
//       var collectionPowerMeter = db.collection('powerMeter');
//       var collectionUps_A = db.collection('ups_A');
//       var collectionUps_B = db.collection('ups_B');
//       switch (msgText) {
//         case '冷氣電流':
//           collectionPowerMeter.findOne({},(err,data) => {
//               if (err) {
//                 return console.log(err);
//               }else{
//                 dbMsg='冷氣目前電流：' + data.currents.toFixed(2) + '(A)';
//                 console.log(dbMsg);
//                 done();
//               }
//             }
//           );
//           break;
//         case 'ups_A電流':
//           collectionUps_A.findOne({},(err,data) => {
//               if (err) {
//                 return console.log(err);
//               }else{
//                 dbMsg='ups_A目前電流：' + Number(data.output_A.outputAmp_A).toFixed(2) + '(A)';
//                 console.log(dbMsg);
//                 done();
//               }
//             }
//           );
//           break;
//         case 'ups_B電流':
//           collectionUps_B.findOne({},(err,data) => {
//               if (err) {
//                 return console.log(err);
//               }else{
//                 dbMsg='ups_B目前電流：' + Number(data.output_B.outputAmp_B).toFixed(2) + '(A)';
//                 console.log(dbMsg);
//                 done();
//               }
//             }
//           );
//           break;
//         case '濕度':
//           collectionPowerMeter.findOne({},(err,data) => {
//               if (err) {
//                 return console.log(err);
//               }else{
//                 dbMsg='目前濕度：' + data.Humidity.toFixed(2) + '(%)';
//                 console.log(dbMsg);
//                 done();
//               }
//             }
//           );
//           break;
//         case '溫度':
//           collectionPowerMeter.findOne({},(err,data) => {
//               if (err) {
//                 return console.log(err);
//               }else{
//                 dbMsg='目前溫度：' + data.Temperature.toFixed(2) + '(°C)';
//                 console.log(dbMsg);
//                 done();
//               }
//             }
//           );
//           break;
//         default:
//           console.log('pass');
//       }
//     });
//   }
// }

app.use(json());
app.use(logger());
app.use(bodyParser());

router.get('/',async (ctx) => {
  // await co(mongoLab('溫度'));
  ctx.body = test;
});

// {
//   "events":[
//   {
//     "type":"message",
//     "replyToken":"d6cd336f934547e2a255d2d515ad862d",
//     "source":{
//       "userId":"U6ac46864e9646bd5bd954471f0060194",
//       "type":"user"
//     },
//     "timestamp":1525163147449,
//     "message":{
//       "type":"text",
//       "id":"7884652587754",
//       "text":"哈囉"
//     }
//   }
// ]}
router.post('/webhooks', async (ctx, next) => {
  // const koaRequest = ctx.request;
  // const hash = crypto
  //                   .createHmac('sha256', process.env.channelSecret)
  //                   .update(JSON.stringify(koaRequest.body))
  //                   .digest('base64');
  var resMsg = "";
  dbMsg = "";
  if ( ctx.status == 200 ) {
      // User 送來的訊息
      userMessages = ctx.request.body.events[0];
      test = JSON.stringify(ctx.request.body);
      var messageText = userMessages.message.text;
      if(/電流/.test(messageText)){
        // 回覆給 User 的訊息
        if(/冷氣/.test(messageText)){
          await co(mongoLab('冷氣電流'));
          resMsg = dbMsg;
        }else if (/ups_A/.test(messageText)) {
          await co(mongoLab('ups_A電流'));
          resMsg = dbMsg;
        }else if (/ups_B/.test(messageText)) {
          await co(mongoLab('ups_B電流'));
          resMsg = dbMsg;
        }else{
          await co(mongoLab('冷氣電流'));
          resMsg = resMsg + dbMsg + '\n';
          await co(mongoLab('ups_A電流'));
          resMsg = resMsg + dbMsg + '\n';
          await co(mongoLab('ups_B電流'));
          resMsg = resMsg + dbMsg;
        }

        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: resMsg
              }]
          },
          json: true
        }
        await request(options);
      }else if (/濕度/.test(messageText)) {
        // 回覆給 User 的訊息
        await co(mongoLab('濕度'));
        resMsg = dbMsg;
        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: resMsg
              }]
          },
          json: true
        }
        await request(options);
      }else if (/溫度/.test(messageText)) {
        // 回覆給 User 的訊息
        await co(mongoLab('溫度'));
        resMsg = dbMsg;
        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: resMsg
              }]
          },
          json: true
        }
        await request(options);
      }
      ctx.status = 200;
  //
    } else {
      ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
      ctx.status = 401;
    }
});

router.post("/push",async function(ctx,next){
  var data = ctx.request.body;
  // 回覆給 User 的訊息
  let options = {
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/push',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.lineBotToken}`
    },
    body: {
      to: "C6ea16291a849fb2c591598bd47e06da9",
      messages: [{
          type: "text",
          text: "昨日冷氣消耗度數："+data.powerMeterPower+"度\n"+"昨日ups_A消耗度數："+data.upsPower_A+"度\n"+"昨日ups_B消耗度數："+data.upsPower_B+"度"
        }]
    },
    json: true
  }

  await request(options);
  ctx.status = 200;
});

app
  .use(linebot.middleware())
  .use(router.routes());

// //因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
var port = server.address().port;
  console.log("App now running on port", port);
});
