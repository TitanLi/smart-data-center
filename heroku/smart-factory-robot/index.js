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
// const linebotUse2 = require('./lib/linebotUse.js');

const app = new koa();
const router = Router();

const linebot1 = new Linebot(process.env.channelSecret1, process.env.lineBotToken1);
const linebot2 = new Linebot(process.env.channelSecret2, process.env.lineBotToken2);

var test = "Hello Koa";
var linebotChange = true;
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
    let mLabData = "";
    let useMsg = "";
    test = ctx.request.body.events;
    console.log(test);
    let events1 = linebot1.requestHandle(ctx);
    if (events1) {
        if (events1.type == 'message') {
            test = JSON.stringify(events1);
            let messageText = events1.messageText;
            if (/電流/.test(messageText)) {
                // 回覆給 User 的訊息
                if (/冷氣/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    events1.messageText = '冷氣電流';
                    await linebot1.responseText(events1, {
                        '冷氣電流': mLabData
                    });
                } else if (/ups_A/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    events1.messageText = 'ups_A電流';
                    await linebot1.responseText(events1, {
                        'ups_A電流': mLabData
                    });
                } else if (/ups_B/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    events1.messageText = 'ups_B電流';
                    await linebot1.responseText(events1, {
                        'ups_B電流': mLabData
                    });
                } else {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    resMsg = resMsg + mLabData;
                    events1.messageText = '電流';
                    await linebot1.responseText(events1, {
                        '電流': resMsg
                    });
                }
            } else if (/濕度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo濕度'));
                    events1.messageText = 'demo濕度';
                    await linebot1.responseText(events1, {
                        'demo濕度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房濕度'));
                    events1.messageText = '機房濕度';
                    await linebot1.responseText(events1, {
                        '機房濕度': mLabData
                    });
                }
            } else if (/溫度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo溫度'));
                    events1.messageText = 'demo溫度';
                    await linebot1.responseText(events1, {
                        'demo溫度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房溫度'));
                    events1.messageText = '機房溫度';
                    await linebot1.responseText(events1, {
                        '機房溫度': mLabData
                    });
                }
            } else if (/控制/.test(messageText)) {
                if (/arduino/.test(messageText)) {
                    let controlStatus = await co(mongoLab.arduinoControlFind());
                    await linebotUse.arduinoCarouselTemplateControl(linebot1, events1, `狀態：${controlStatus.relay1}`, `狀態：${controlStatus.relay2}`);
                } else {
                    let controlStatus = await co(mongoLab.controlFind());
                    await linebotUse.carouselTemplateControl(linebot1, events1, `狀態：${controlStatus.outputFan}`, `狀態：${controlStatus.inputFan}`, `狀態：${controlStatus.humidity}`);
                }
            } else if (Number(messageText) && updateStatus) {
                if (updateData < 7) {
                    cacheData[updateData] = Number(messageText);
                    await linebot1.responseConfirm(events1, updateDataArray[updateData], updateData < 6 ? `yes,\n接著設定機房資訊\n${updateDataArray[updateData + 1]}` : updateDataArray[updateData + 1]);
                    updateData++;
                }
            } else if (messageText == 'No,重新設定') {
                updateData = 0;
                cacheData = [0, 0, 0, 0, 0, 0, 0];
                updateStatus = true;
                events1.messageText = '更新';
                await linebot1.responseText(events1, {
                    '更新': updateDataArray[updateData]
                });
            } else if (/設定機房資訊/.test(messageText)) {
                if (!updateStatus) {
                    cacheData = [0, 0, 0, 0, 0, 0, 0];
                    setTimeout(() => {
                        updateData = 0;
                        updateStatus = false;
                    }, 600000);
                }
                updateStatus = true;
                events1.messageText = '更新';
                if (updateData < 7) {
                    await linebot1.responseText(events1, {
                        '更新': `請輸入${updateDataArray[updateData]}`
                    });
                }
            } else if (/查看設定結果/.test(messageText)) {
                if (updateStatus && updateData >= 7) {
                    updateData = 0;
                    await co(mongoLab.computerRoomInformationUpdate(cacheData));
                    updateStatus = false;
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot1.responseFlexContainer(events1, message);
                } else if (updateStatus && updateData < 7) {
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot1.responseFlexContainer(events1, message);
                } else {
                    let message = await co(mongoLab.computerRoomInformationFind());
                    await linebot1.responseFlexContainer(events1, message);
                }
            } else if (/機房資訊/.test(messageText)) {
                let message = await co(mongoLab.computerRoomInformationFind());
                await linebot1.responseFlexContainer(events1, message);
            } else if (/功能列表/.test(messageText)) {
                await linebot1.responseFunctionList(events1);
            } else if (/每日通報資訊/.test(messageText)) {
                let powerData = await co(mongoLab.powerFind());
                let messageText = '昨日冷氣消耗度數：' + powerData.airConditioning + '度\n' + '昨日ups_A消耗度數：' + powerData.upsA + '度\n' + '昨日ups_B消耗度數：' + powerData.upsB + '度';
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
                await linebot1.sendPower(events1, weatherImage, messageText, weatherMessage, specials);
            }
        } else if (events1.type == 'postback') {
            //postback 控制資訊         
            let controlET7044 = events1.postbackData.split('#');
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
            test = JSON.stringify(events1);
            // test = data;
        }
    } else {
        ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
        ctx.status = 401;
    }
    ctx.status = 200;
});

router.post('/webhooks2', async (ctx, next) => {
    let resMsg = '';
    let mLabData = "";
    let useMsg = "";
    test = ctx.request.body.events;
    console.log(test);
    let events2 = linebot2.requestHandle(ctx);
    if (events2) {
        if (events2.type == 'message') {
            test = JSON.stringify(events2);
            let messageText = events2.messageText;
            if (/電流/.test(messageText)) {
                // 回覆給 User 的訊息
                if (/冷氣/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    events2.messageText = '冷氣電流';
                    await linebot2.responseText(events2, {
                        '冷氣電流': mLabData
                    });
                } else if (/ups_A/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    events2.messageText = 'ups_A電流';
                    await linebot2.responseText(events2, {
                        'ups_A電流': mLabData
                    });
                } else if (/ups_B/.test(messageText)) {
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    events2.messageText = 'ups_B電流';
                    await linebot2.responseText(events2, {
                        'ups_B電流': mLabData
                    });
                } else {
                    mLabData = await co(mongoLab.findData('冷氣電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_A電流'));
                    resMsg = resMsg + mLabData + '\n';
                    mLabData = await co(mongoLab.findData('ups_B電流'));
                    resMsg = resMsg + mLabData;
                    events2.messageText = '電流';
                    await linebot2.responseText(events2, {
                        '電流': resMsg
                    });
                }
            } else if (/濕度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo濕度'));
                    events2.messageText = 'demo濕度';
                    await linebot2.responseText(events2, {
                        'demo濕度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房濕度'));
                    events2.messageText = '機房濕度';
                    await linebot2.responseText(events2, {
                        '機房濕度': mLabData
                    });
                }
            } else if (/溫度/.test(messageText)) {
                if (/demo/.test(messageText)) {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('demo溫度'));
                    events2.messageText = 'demo溫度';
                    await linebot2.responseText(events2, {
                        'demo溫度': mLabData
                    });
                } else {
                    // 回覆給 User 的訊息
                    mLabData = await co(mongoLab.findData('機房溫度'));
                    events2.messageText = '機房溫度';
                    await linebot2.responseText(events2, {
                        '機房溫度': mLabData
                    });
                }
            } else if (/控制/.test(messageText)) {
                if (/arduino/.test(messageText)) {
                    let controlStatus = await co(mongoLab.arduinoControlFind());
                    await linebotUse.arduinoCarouselTemplateControl(linebot2, events2, `狀態：${controlStatus.relay1}`, `狀態：${controlStatus.relay2}`);
                } else {
                    let controlStatus = await co(mongoLab.controlFind());
                    await linebotUse.carouselTemplateControl(linebot2, events2, `狀態：${controlStatus.outputFan}`, `狀態：${controlStatus.inputFan}`, `狀態：${controlStatus.humidity}`);
                }
            } else if (Number(messageText) && updateStatus) {
                if (updateData < 7) {
                    cacheData[updateData] = Number(messageText);
                    await linebot2.responseConfirm(events2, updateDataArray[updateData], updateData < 6 ? `yes,\n接著設定機房資訊\n${updateDataArray[updateData + 1]}` : updateDataArray[updateData + 1]);
                    updateData++;
                }
            } else if (messageText == 'No,重新設定') {
                updateData = 0;
                cacheData = [0, 0, 0, 0, 0, 0, 0];
                updateStatus = true;
                events2.messageText = '更新';
                await linebot2.responseText(events2, {
                    '更新': updateDataArray[updateData]
                });
            } else if (/設定機房資訊/.test(messageText)) {
                if (!updateStatus) {
                    cacheData = [0, 0, 0, 0, 0, 0, 0];
                    setTimeout(() => {
                        updateData = 0;
                        updateStatus = false;
                    }, 600000);
                }
                updateStatus = true;
                events2.messageText = '更新';
                if (updateData < 7) {
                    await linebot2.responseText(events2, {
                        '更新': `請輸入${updateDataArray[updateData]}`
                    });
                }
            } else if (/查看設定結果/.test(messageText)) {
                if (updateStatus && updateData >= 7) {
                    updateData = 0;
                    await co(mongoLab.computerRoomInformationUpdate(cacheData));
                    updateStatus = false;
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot2.responseFlexContainer(events2, message);
                } else if (updateStatus && updateData < 7) {
                    let message = `VCPU數量(顆):${cacheData[0]}\nRAM數量(GB):${cacheData[1]}\n機房儲存空間(TB):${cacheData[2]}\n機房Switch數量(台):${cacheData[3]}\n機房SDN Switch數量(台):${cacheData[4]}\n機房一般主機數量(台):${cacheData[5]}\n機房伺服器數量(台):${cacheData[6]}`
                    await linebot2.responseFlexContainer(events2, message);
                } else {
                    let message = await co(mongoLab.computerRoomInformationFind());
                    await linebot2.responseFlexContainer(events2, message);
                }
            } else if (/機房資訊/.test(messageText)) {
                let message = await co(mongoLab.computerRoomInformationFind());
                await linebot2.responseFlexContainer(events2, message);
            } else if (/功能列表/.test(messageText)) {
                await linebot2.responseFunctionList(events2);
            } else if (/每日通報資訊/.test(messageText)) {
                let powerData = await co(mongoLab.powerFind());
                let messageText = '昨日冷氣消耗度數：' + powerData.airConditioning + '度\n' + '昨日ups_A消耗度數：' + powerData.upsA + '度\n' + '昨日ups_B消耗度數：' + powerData.upsB + '度';
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
                await linebot2.sendPower(events2, weatherImage, messageText, weatherMessage, specials);
            }
        } else if (events2.type == 'postback') {
            //postback 控制資訊         
            let controlET7044 = events2.postbackData.split('#');
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
            test = JSON.stringify(events2);
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
    let imacGroupID1 = process.env.imacGroupID1;
    let imacGroupID2 = process.env.imacGroupID2;
    let messageText = '昨日冷氣消耗度數：' + requestData.powerMeterPower + '度\n' + '昨日ups_A消耗度數：' + requestData.upsPower_A + '度\n' + '昨日ups_B消耗度數：' + requestData.upsPower_B + '度';
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
    let weatherImage = `https://works.ioa.tw/weather/img/weathers/zeusdesign/${weatherData.img}`;
    await co(mongoLab.powerUpdate(requestData));
    console.log(messageText);
    console.log(linebotChange)
    // 發送給imac group
    if (linebotChange) {
        try {
            await linebot1.sendText(imacGroupID1, weatherImage, messageText, weatherMessage, specials);
        } catch (error) {
            console.log('LINE BOT change IMAC');
            linebotChange = !linebotChange;
            await linebot2.sendText(imacGroupID2, weatherImage, messageText, weatherMessage, specials);
        }
    } else {
        try {
            await linebot2.sendText(imacGroupID2, weatherImage, messageText, weatherMessage, specials);
        } catch (error) {
            console.log('LINE BOT change imac');
            linebotChange = !linebotChange;
            await linebot1.sendText(imacGroupID1, weatherImage, messageText, weatherMessage, specials);
        }
    }
    ctx.status = 200;
});

router.post('/post/control/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID1 = process.env.imacGroupID1;
    let imacGroupID2 = process.env.imacGroupID2;
    let messageText = requestData.message;
    console.log(messageText);
    console.log(linebotChange)
    // 發送給imac group
    // if (linebotChange) {
    //     try {
    //         await linebot1.sendControlText(imacGroupID1, messageText);
    //     } catch (error) {
    //         console.log('LINE BOT change IMAC');
    //         linebotChange = !linebotChange;
    //         await linebot2.sendControlText(imacGroupID2, messageText);
    //     }
    // } else {
    //     try {
    //         await linebot2.sendControlText(imacGroupID2, messageText);
    //     } catch (error) {
    //         console.log('LINE BOT change imac');
    //         linebotChange = !linebotChange;
    //         await linebot1.sendControlText(imacGroupID1, messageText);
    //     }
    // }
    ctx.status = 200;
});

router.post('/message', async function (ctx, next) {
    let requestData = ctx.request.body;
    let imacGroupID1 = process.env.imacGroupID1;
    let imacGroupID2 = process.env.imacGroupID2;
    let messageText = requestData.message;
    console.log(messageText);
    console.log(linebotChange);
    // 發送給imac group
    if (linebotChange) {
        try {
            await linebot1.sendText(imacGroupID1, messageText);
        } catch (error) {
            console.log('LINE BOT change IMAC');
            linebotChange = !linebotChange;
            await linebot2.sendText(imacGroupID2, messageText);
        }
    } else {
        try {
            await linebot2.sendText(imacGroupID2, messageText);
        } catch (error) {
            console.log('LINE BOT change imac');
            linebotChange = !linebotChange;
            await linebot1.sendText(imacGroupID1, messageText);
        }
    }
    ctx.status = 200;
});

router.get('/test', async function (ctx, next) {
    let data = await co(mongoLab.controlFind());
    console.log(data);
    ctx.status = 200;
    ctx.body = data;
});

app
    .use(linebot1.middleware())
    .use(linebot2.middleware2())
    .use(router.routes());

// 因為 koa 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
