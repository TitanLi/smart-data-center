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
// 放 Line Bot 的 Channel Secret
// const channelSecret = '54695245827351a6d0ca224daaf8290a';

// Line Bot 的 Channel Token
const lineBotToken = 'KGxb2GR2KBfc9QaUUq7kws9wHWWr47IzEpm4rzN4YqWNQKFwghMAVuZST8U/lzhuYiCiriNMs6TgOhNdkj2mf34Qb6eS+SMX7hiTkkOxaKS4x7BwGtU4+snfITPFoFkX74jhZjhYcw5sGvXcOi5jkAdB04t89/1O/w1cDnyilFU=';

const app = new koa();
const router = Router();

var test = "Hello Koa";
var userMessages;

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
  const channelSecret = "54695245827351a6d0ca224daaf8290a";
  const koaRequest = ctx.request;
  const hash = crypto
                    .createHmac('sha256', channelSecret)
                    .update(JSON.stringify(koaRequest.body))
                    .digest('base64');
  if ( koaRequest.headers['x-line-signature'] === hash ) {
      // User 送來的訊息
      userMessages = ctx.request.body.events[0];
      test = JSON.stringify(ctx.request.body);
      var messageText = userMessages.message.text;
      if(/電流/.test(messageText)){
        // 回覆給 User 的訊息
        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: "現在電流是"+Math.random()*100
              }]
          },
          json: true
        }
        await request(options);
      }else if (/濕度/.test(messageText)) {
        // 回覆給 User 的訊息
        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: "現在濕度是"+Math.random()*100
              }]
          },
          json: true
        }
        await request(options);
      }else if (/溫度/.test(messageText)) {
        // 回覆給 User 的訊息
        let options = {
          method: 'POST',
          uri: 'https://api.line.me/v2/bot/message/reply',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineBotToken}`
          },
          body: {
            replyToken: userMessages.replyToken,
            messages: [{
                type: "text",
                text: "現在溫度是"+Math.random()*100
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

router.get("/push",async function(ctx,next){
  // 回覆給 User 的訊息
  let options = {
    method: 'POST',
    uri: 'https://api.line.me/v2/bot/message/push',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lineBotToken}`
    },
    body: {
      to: "C6ea16291a849fb2c591598bd47e06da9",
      messages: [{
          type: "text",
          text: "是文字"
        }]
    },
    json: true
  }

  await request(options);
  ctx.status = 200;
});

app.use(router.routes());

// //因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
var port = server.address().port;
  console.log("App now running on port", port);
});
