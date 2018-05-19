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
const mongoLab = require('./lib/mongoLab.js');

const app = new koa();
const router = Router();

const linebot = new Linebot(process.env.channelSecret,process.env.lineBotToken);

var test = "Hello Koa";

app.use(json());
app.use(logger());
app.use(bodyParser());

router.get('/',async (ctx) => {
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
  let resMsg = '';
  let mLabData = "";
  let useMsg = "";
  let events = linebot.requestHandle(ctx);
  if (events) {
      test = JSON.stringify(events);
      let messageText = events.messageText;
      if(/電流/.test(messageText)){
        // 回覆給 User 的訊息
        if(/冷氣/.test(messageText)){
          mLabData = await co(mongoLab.findData('冷氣電流'));
          events.messageText = '冷氣電流';
          await linebot.responseText(events,{
            '冷氣電流':mLabData
          });
        }else if (/ups_A/.test(messageText)) {
          mLabData = await co(mongoLab.findData('ups_A電流'));
          events.messageText = 'ups_A電流';
          await linebot.responseText(events,{
            'ups_A電流':mLabData
          });
        }else if (/ups_B/.test(messageText)) {
          mLabData = await co(mongoLab.findData('ups_B電流'));
          events.messageText = 'ups_B電流';
          await linebot.responseText(events,{
            'ups_B電流':mLabData
          });
        }else{
          mLabData = await co(mongoLab.findData('冷氣電流'));
          resMsg = resMsg + mLabData + '\n';
          mLabData = await co(mongoLab.findData('ups_A電流'));
          resMsg = resMsg + mLabData + '\n';
          mLabData = await co(mongoLab.findData('ups_B電流'));
          resMsg = resMsg + mLabData;
          events.messageText = '電流';
          await linebot.responseText(events,{
            '電流':resMsg
          });
        }
      }else if (/濕度/.test(messageText)) {
        // 回覆給 User 的訊息
        mLabData = await co(mongoLab.findData('濕度'));
        events.messageText = '濕度';
        await linebot.responseText(events,{
          '濕度':mLabData
        });
      }else if (/溫度/.test(messageText)) {
        // 回覆給 User 的訊息
        mLabData = await co(mongoLab.findData('溫度'));
        events.messageText = '溫度';
        await linebot.responseText(events,{
          '溫度':mLabData
        });
      }
      ctx.status = 200;
    } else {
      ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
      ctx.status = 401;
    }
});

router.post("/push",async function(ctx,next){
  let requestData = ctx.request.body;
  let imacGroupID = process.env.imacGroupID;
  let messageText = '昨日冷氣消耗度數：'+requestData.powerMeterPower+'度\n'+'昨日ups_A消耗度數：'+requestData.upsPower_A+'度\n'+'昨日ups_B消耗度數：'+requestData.upsPower_B+'度';
  // 發送給imac group
  let data = await linebot.sendText(imacGroupID,messageText);
  ctx.status = 200;
  ctx.body = data;
});

app
  .use(linebot.middleware())
  .use(router.routes());

// //因為 koa 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
var port = server.address().port;
  console.log("App now running on port", port);
});
