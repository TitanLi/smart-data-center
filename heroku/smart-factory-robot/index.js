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
const linebotUse = require('./lib/linebotUse.js');

const app = new koa();
const router = Router();

const linebot = new Linebot(process.env.channelSecret, process.env.lineBotToken);

var test = "Hello Koa";
// var userId = '';

app.use(json());
app.use(logger());
app.use(bodyParser());

router.get('/', async (ctx) => {
    ctx.body = test;
});

// {
//   "events":[
//   {
//     "type": "message",
//     "replyToken": "567feb1e12d644c2a5aa49d35aeab618",
//     "source": {
//       "userId": "U6ac46864e9646bd5bd954471f0060194",
//       "type": "user"
//     },
//     "timestamp": 1526787595580,
//     "message": {
//       "type": "text",
//       "id": "7986854301445",
//       "text": "哈囉"
//     }
//   }]
// }

// [
//   {
//     "type": "postback",
//     "replyToken": "8ac478901b044eb586060e1e84c53cef",
//     "source": {
//       "userId": "U6ac46864e9646bd5bd954471f0060194",
//       "type": "user"
//     },
//     "timestamp": 1526787216000,
//     "postback": {
//       "data": "action=buy&itemid=111"
//     }
//   }
// ]
router.post('/webhooks', async (ctx, next) => {
    let resMsg = '';
    let mLabData = "";
    let useMsg = "";
    // test = ctx.request.body.events;
    let events = linebot.requestHandle(ctx);
    if (events) {
        if (events.type == 'message') {
            test = JSON.stringify(events);
            let messageText = events.messageText;
            if (/電流/.test(messageText)) {
                // 回覆給 User 的訊息
                if (/冷氣/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    events.messageText = '冷氣電流';
                    await linebot.responseText(events, {
                        '冷氣電流': mLabData
                    });
                } else if (/ups_A/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    events.messageText = 'ups_A電流';
                    await linebot.responseText(events, {
                        'ups_A電流': mLabData
                    });
                } else if (/ups_B/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    events.messageText = 'ups_B電流';
                    await linebot.responseText(events, {
                        'ups_B電流': mLabData
                    });
                } else {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    resMsg = resMsg + mLabData;
                    events.messageText = '電流';
                    await linebot.responseText(events, {
                        '電流': resMsg
                    });
                }
            } else if (/濕度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo濕度'));
                    events.messageText = 'demo濕度';
                    await linebot.responseText(events, {
                        'demo濕度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房濕度'));
                    events.messageText = '機房濕度';
                    await linebot.responseText(events, {
                        '機房濕度': mLabData
                    });
                }
            } else if (/溫度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo溫度'));
                    events.messageText = 'demo溫度';
                    await linebot.responseText(events, {
                        'demo溫度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房溫度'));
                    events.messageText = '機房溫度';
                    await linebot.responseText(events, {
                        '機房溫度': mLabData
                    });
                }
            } else if (/控制/.test(messageText)) {
                if (/arduino/.test(messageText)) {
                    let controlStatus = await co(mongoLab.arduinoControlFind());
                    await linebotUse.arduinoCarouselTemplateControl(linebot, events, `狀態：${controlStatus.relay1}`, `狀態：${controlStatus.relay2}`);
                } else {
                    let controlStatus = await co(mongoLab.controlFind());
                    await linebotUse.carouselTemplateControl(linebot, events, `狀態：${controlStatus.outputFan}`, `狀態：${controlStatus.inputFan}`, `狀態：${controlStatus.humidity}`);
                }
            }
        } else if (events.type == 'postback') {
            //postback 控制資訊         
            let controlET7044 = events.postbackData.split('#');
            let value = controlET7044[1];
            if (controlET7044[0] == 'outputFan') {
                let data = await co(mongoLab.controlUpdate({ 'outputFan': value }));
            } else if (controlET7044[0] == 'inputFan') {
                let data = await co(mongoLab.controlUpdate({ 'inputFan': value }));
            } else if (controlET7044[0] == 'humidity') {
                let data = await co(mongoLab.controlUpdate({ 'humidity': value }));
            } else if (controlET7044[0] == 'relay1') {
                let data = await co(mongoLab.arduinoControlUpdate({ 'relay1': value }));
            } else if (controlET7044[0] == 'relay2') {
                let data = await co(mongoLab.arduinoControlUpdate({ 'relay2': value }));
            }
            test = JSON.stringify(events);
            test = data;
        }
        ctx.status = 200;
    } else {
        ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
        ctx.status = 401;
    }
});

router.post('/post/push', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = '昨日冷氣消耗度數：' + requestData.powerMeterPower + '度\n' + '昨日ups_A消耗度數：' + requestData.upsPower_A + '度\n' + '昨日ups_B消耗度數：' + requestData.upsPower_B + '度';
    // 發送給imac group
    let data = await linebot.sendText(imacGroupID, messageText);
    ctx.status = 200;
    ctx.body = data;
});

router.post('/post/control/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = requestData.message;
    // 發送給imac group
    let data = await linebot.sendText(imacGroupID, messageText);
    ctx.status = 200;
    ctx.body = data;
});

router.post('/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = requestData.message;
    // 發送給imac group
    let data = await linebot.sendText(imacGroupID, messageText);
    ctx.status = 200;
    ctx.body = data;
});

router.get('/test', async function (ctx, next) {
    let data = await co(mongoLab.controlFind());
    ctx.status = 200;
    ctx.body = data;
});

app
    .use(linebot.middleware())
    .use(router.routes());

// //因為 koa 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
