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
var updateData = 0;
var updateDataArray = [
    'VCPU數量(顆)',
    'RAM數量(GB)',
    '機房儲存空間(TB)',
    '機房Switch數量(台)',
    '機房SDN Switch數量(台)',
    '機房一般主機數量(台)',
    '機房伺服器數量(台)',
    '查看設定結果'
];
var updateStatus = false;
var cacheData = [0, 0, 0, 0, 0, 0, 0];

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
    let mLabData = '';
    test = ctx.request.body.events;
    console.log(test);
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
            } else if (Number(messageText) && updateStatus) {
                if (updateData < 7) {
                    cacheData[updateData] = Number(messageText);
                    await linebot.responseConfirm(events, updateDataArray[updateData], updateData < 6 ? `yes,\n接著設定機房資訊\n${updateDataArray[updateData + 1]}` : updateDataArray[updateData + 1]);
                    updateData++;
                }
            } else if (messageText == 'No,重新設定') {
                updateData = 0;
                cacheData = [0, 0, 0, 0, 0, 0, 0];
                updateStatus = true;
                events.messageText = '更新';
                await linebot.responseText(events, {
                    '更新': updateDataArray[updateData]
                });
            } else if (/電錶度數/.test(messageText)) {
                if (/今日/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('電錶今日度數'));
                    events.messageText = '電錶今日度數';
                    await linebot.responseText(events, {
                        '電錶今日度數': mLabData
                    });
                } else if (/昨日消耗/.test(messageText)){
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('電錶昨日消耗度數'));
                    events.messageText = '電錶昨日消耗度數';
                    await linebot.responseText(events, {
                        '電錶昨日消耗度數': mLabData
                    });
                } else {
                    mLabData = await co(mongoLab.findData('電錶今日度數'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('電錶昨日消耗度數'));
                    resMsg = resMsg + mLabData;
                    events.messageText = '電錶度數';
                    await linebot.responseText(events, {
                        '電錶度數': resMsg
                    });
                }
            } else if (/設定機房資訊/.test(messageText)) {
                if (!updateStatus) {
                    cacheData = [0, 0, 0, 0, 0, 0, 0];
                    setTimeout(() => {
                        updateData = 0;
                        updateStatus = false;
                    }, 600000);
                }
                updateStatus = true;
                events.messageText = '更新';
                if (updateData < 7) {
                    await linebot.responseText(events, {
                        '更新': `請輸入${updateDataArray[updateData]}`
                    });
                }
            } else if (/查看設定結果/.test(messageText)) {
                if (updateStatus && updateData >= 7) {
                    updateData = 0;
                    await co(mongoLab.computerRoomInformationUpdate(cacheData));
                    updateStatus = false;
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot.responseFlexContainer(events, message);
                } else if (updateStatus && updateData < 7) {
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot.responseFlexContainer(events, message);
                } else {
                    let message = await co(mongoLab.computerRoomInformationFind());
                    await linebot.responseFlexContainer(events, message);
                }
            } else if (/機房資訊/.test(messageText)) {
                let message = await co(mongoLab.computerRoomInformationFind());
                await linebot.responseFlexContainer(events, message);
            } else if (/功能列表/.test(messageText)) {
                await linebot.responseFunctionList(events);
            } else if (/每日通報資訊/.test(messageText)) {
                let powerData = await co(mongoLab.powerFind());
                let messageText = '昨日冷氣消耗度數：' + powerData.airConditioning + '度\n';
                messageText = messageText + '昨日ups_A消耗度數：' + powerData.upsA + '度\n';
                messageText = messageText + '昨日ups_B消耗度數：' + powerData.upsB + '度\n';
                messageText = messageText + '昨日機房電錶消耗： ' + powerData.cameraPowerConsumption + '度\n';
                messageText = messageText + '機房電錶消耗計算起始日： ' + powerData.cameraStartTime + '\n';
                messageText = messageText + '機房電錶消耗計算終止日： ' + powerData.cameraEndTime;
                let weather = {
                    uri: 'https://works.ioa.tw/weather/api/weathers/116.json',
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    json: true // Automatically parses the JSON string in the response
                };
                let weatherData = await request(weather);
                let weatherMessage = `天氣：${weatherData.desc}\n室外溫度：${weatherData.temperature}\n體感溫度：${weatherData.felt_air_temp}\n濕度：${weatherData.humidity}\n`;
                let specials = '';
                if (weatherData.specials.length != 0) {
                    specials = `特別預報：${weatherData.specials[0].title}\n敘述：${weatherData.specials[0].desc}`;
                }
                let weatherImage = `https://works.ioa.tw/weather/img/weathers/zeusdesign/${weatherData.img}`
                await linebot.responsePower(events, weatherImage, messageText, weatherMessage, specials);
            } else if (/機房服務列表/.test(messageText)) {
                mLabData = await co(mongoLab.serviceListFind());
                console.log(mLabData);
                await linebot.responseServiceList(events, mLabData);
            }
        } else if (events.type == 'postback') {
            //postback 控制資訊         
            let controlET7044 = events.postbackData.split('#');
            let value = controlET7044[1];
            if (controlET7044[0] == 'outputFan') {
                let data = await co(mongoLab.controlUpdate({ 'outputFan': value }));
                console.log(data);
            } else if (controlET7044[0] == 'inputFan') {
                let data = await co(mongoLab.controlUpdate({ 'inputFan': value }));
                console.log(data);
            } else if (controlET7044[0] == 'humidity') {
                let data = await co(mongoLab.controlUpdate({ 'humidity': value }));
                console.log(data);
            } else if (controlET7044[0] == 'relay1') {
                let data = await co(mongoLab.arduinoControlUpdate({ 'relay1': value }));
                console.log(data);
            } else if (controlET7044[0] == 'relay2') {
                let data = await co(mongoLab.arduinoControlUpdate({ 'relay2': value }));
                console.log(data);
            }
            test = JSON.stringify(events);
            // test = data;
        }
    } else {
        ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
        ctx.status = 401;
    }
    ctx.status = 200;
});

router.post('/post/push', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = '昨日冷氣消耗度數：' + requestData.powerMeterPower + '度\n';
    messageText = messageText + '昨日ups_A消耗度數：' + requestData.upsPower_A + '度\n';
    messageText = messageText + '昨日ups_B消耗度數：' + requestData.upsPower_B + '度\n';
    messageText = messageText + '昨日機房電錶消耗： ' + requestData.cameraPowerConsumption + '度\n';
    messageText = messageText + '機房電錶消耗計算起始時間： ' + requestData.cameraStartTime + '\n';
    messageText = messageText + '機房電錶消耗計算終止時間： ' + requestData.cameraEndTime;
    console.log(messageText);
    // 取得天氣資訊
    let weather = {
        uri: 'https://works.ioa.tw/weather/api/weathers/116.json',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    let weatherData = await request(weather);
    console.log(weatherData);
    let weatherMessage = `天氣：${weatherData.desc}\n室外溫度：${weatherData.temperature}\n體感溫度：${weatherData.felt_air_temp}\n濕度：${weatherData.humidity}\n`;
    let specials = '';
    if (weatherData.specials.length != 0) {
        specials = `特別預報：${weatherData.specials[0].title}\n敘述：${weatherData.specials[0].desc}`;
    }
    let weatherImage = `https://works.ioa.tw/weather/img/weathers/zeusdesign/${weatherData.img}`;
    // 更新mLab暫存資料
    await co(mongoLab.powerUpdate(requestData));
    console.log(imacGroupID, weatherImage, messageText, weatherMessage, specials);
    // 發送給imac group
    await linebot.sendPower(imacGroupID, weatherImage, messageText, weatherMessage, specials);
    ctx.status = 200;
});

router.post('/post/control/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = requestData.message;
    console.log(messageText);
    // 發送給imac group
    await linebot.sendText(imacGroupID, messageText);
    ctx.status = 200;
});

router.post('/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID = process.env.imacGroupID;
    let messageText = requestData.message;
    console.log(messageText);
    // 發送給imac group
    await linebot.sendText(imacGroupID, messageText);
    ctx.status = 200;
});

router.get('/test', async function (ctx, next) {
    let data = await co(mongoLab.controlFind());
    console.log(data);
    ctx.status = 200;
    ctx.body = data;
});

app
    .use(linebot.middleware())
    .use(router.routes());

// 因為 koa 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
