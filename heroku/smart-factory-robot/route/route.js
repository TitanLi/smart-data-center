const co = require('co');
const dotenv = require('dotenv').load();
// 送 Request 用 ( 也要安裝 request package )
const request = require('request-promise');
// 載入 crypto ，等下要加密
// const crypto = require('crypto');
const Linebot = require('./../lib/linebot.js');
const mongoLab = require('./../lib/mongoLab.js');
const linebotUse = require('./../lib/linebotUse.js');
const linebot = new Linebot(process.env.channelSecret, process.env.lineBotToken);

let test = "Hello Koa";
let updateData = 0;
let updateDataArray = [
    'VCPU數量(顆)',
    'RAM數量(GB)',
    '機房儲存空間(TB)',
    '機房Switch數量(台)',
    '機房SDN Switch數量(台)',
    '機房一般主機數量(台)',
    '機房伺服器數量(台)',
    '查看設定結果'
];
let updateStatus = false;
let cacheData = [0, 0, 0, 0, 0, 0, 0];

module.exports = {
    index: async (ctx) => {
        ctx.body = test;
    },
    webhooks: async (ctx, next) => {
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
                    } else if (/昨日消耗/.test(messageText)) {
                        // 回覆給 User 的訊息
                        mLabData = await co(mongoLab.findData('電錶昨日消耗度數'));
                        events.messageText = '電錶昨日消耗度數';
                        await linebot.responseText(events, {
                            '電錶昨日消耗度數': mLabData
                        });
                    } else {
                        mLabData = await co(mongoLab.findData('電錶今日度數'));
                        resMsg = resMsg + mLabData + '\n\n';
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
                        let telegramData = {
                            'vcpu': cacheData[0],
                            'ram': cacheData[1],
                            'disk': cacheData[2],
                            'switch': cacheData[3],
                            'sdnSwitch': cacheData[4],
                            'pc': cacheData[5],
                            'server': cacheData[6]
                        };
                        let telegramOptions = {
                            method: 'POST',
                            uri: 'https://smart-data-center-telegram.herokuapp.com/linebot',
                            body: telegramData,
                            json: true
                        }
                        await request(telegramOptions).catch(function (err) {
                            console.log(err);
                        });;
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
                    let messageText = '昨日冷氣消耗：' + powerData.airConditioning + '度\n';
                    messageText = messageText + '昨日ups_A消耗：' + powerData.upsA + '度\n';
                    messageText = messageText + '昨日ups_B消耗：' + powerData.upsB + '度\n';
                    messageText = messageText + '昨日水塔馬達消耗：' + powerData.waterTank + '度\n';
                    messageText = messageText + '昨日電錶消耗： ' + powerData.cameraPowerConsumption + '度\n';
                    messageText = messageText + '(' + new Date(powerData.cameraStartTime).toLocaleString().split(' ')[0];
                    messageText = messageText + (powerData.cameraEndTime === '第一筆資料' ? powerData.cameraEndTime : ` ~ ${new Date(powerData.cameraEndTime).toLocaleString().split(' ')[0]}`) + ')';
                    // Version 1:
                    // let weather = {
                    //     uri: 'https://works.ioa.tw/weather/api/weathers/116.json',
                    //     headers: {
                    //         'User-Agent': 'Request-Promise'
                    //     },
                    //     json: true // Automatically parses the JSON string in the response
                    // };
                    // let weatherData = await request(weather);
                    // let weatherMessage = `天氣：${weatherData.desc}\n室外溫度：${weatherData.temperature}\n體感溫度：${weatherData.felt_air_temp}\n濕度：${weatherData.humidity}\n`;
                    // let specials = '';
                    // console.dir(weatherData);
                    // if (weatherData.specials.length != 0) {
                    //     specials = `特別預報：${weatherData.specials[0].title}\n敘述：${weatherData.specials[0].desc}`;
                    // }
                    // let weatherImage = `https://works.ioa.tw/weather/img/weathers/zeusdesign/${weatherData.img}`
                    // await linebot.responsePower(events, weatherImage, messageText, weatherMessage, specials);
                    
                    // Version 2:
                    let weather = {
                        uri: `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.weatherAuthorization}&limit=1&offset=0&format=JSON&locationName=%E8%87%BA%E4%B8%AD%E5%B8%82`,
                        json: true // Automatically parses the JSON string in the response
                    };
                    let weatherData = await request(weather);
                    let weatherMessage = `天氣：${weatherData.records.location[0].weatherElement[0].time[1].parameter.parameterName}\n`;
                    weatherMessage = weatherMessage + `最低溫度：${weatherData.records.location[0].weatherElement[2].time[1].parameter.parameterName} °C\n`;
                    weatherMessage = weatherMessage + `最高溫度：${weatherData.records.location[0].weatherElement[4].time[1].parameter.parameterName} °C\n`;
                    weatherMessage = weatherMessage + `降雨機率：${weatherData.records.location[0].weatherElement[1].time[1].parameter.parameterName} %\n`;
                    await linebot.responsePower(events, messageText, weatherMessage);
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
    },
    push: async (ctx, next) => {
        let requestData = ctx.request.body;
        let imacGroupID = process.env.imacGroupID;
        let messageText = '昨日冷氣消耗：' + requestData.powerMeterPower + '度\n';
        messageText = messageText + '昨日ups_A消耗：' + requestData.upsPower_A + '度\n';
        messageText = messageText + '昨日ups_B消耗：' + requestData.upsPower_B + '度\n';
        messageText = messageText + '昨日水塔馬達消耗：' + requestData.waterTank + '度\n';
        messageText = messageText + '昨日電錶消耗： ' + requestData.cameraPowerConsumption + '度\n';
        messageText = messageText + '(' + new Date(requestData.cameraStartTime).toLocaleString().split(' ')[0];
        messageText = messageText + (requestData.cameraEndTime === '第一筆資料' ? requestData.cameraEndTime : ` ~ ${new Date(requestData.cameraEndTime).toLocaleString().split(' ')[0]}`) + ')';
        console.log(messageText);
        // 取得天氣資訊
        // Version 1:
        // let weather = {
        //     uri: 'https://works.ioa.tw/weather/api/weathers/116.json',
        //     headers: {
        //         'User-Agent': 'Request-Promise'
        //     },
        //     json: true // Automatically parses the JSON string in the response
        // };
        // let weatherData = await request(weather);
        // console.log(weatherData);
        // let weatherMessage = `天氣：${weatherData.desc}\n室外溫度：${weatherData.temperature}\n體感溫度：${weatherData.felt_air_temp}\n濕度：${weatherData.humidity}\n`;
        // let specials = '';
        // if (weatherData.specials.length != 0) {
        //     specials = `特別預報：${weatherData.specials[0].title}\n敘述：${weatherData.specials[0].desc}`;
        // }
        // let weatherImage = `https://works.ioa.tw/weather/img/weathers/zeusdesign/${weatherData.img}`;
        // Version 2:
        let weather = {
            uri: `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.weatherAuthorization}&limit=1&offset=0&format=JSON&locationName=%E8%87%BA%E4%B8%AD%E5%B8%82`,
            json: true // Automatically parses the JSON string in the response
        };
        let weatherData = await request(weather);
        let weatherMessage = `天氣：${weatherData.records.location[0].weatherElement[0].time[1].parameter.parameterName}\n`;
        weatherMessage = weatherMessage + `最低溫度：${weatherData.records.location[0].weatherElement[2].time[1].parameter.parameterName} °C\n`;
        weatherMessage = weatherMessage + `最高溫度：${weatherData.records.location[0].weatherElement[4].time[1].parameter.parameterName} °C\n`;
        weatherMessage = weatherMessage + `降雨機率：${weatherData.records.location[0].weatherElement[1].time[1].parameter.parameterName} %\n`;
        // 更新mLab暫存資料
        await co(mongoLab.powerUpdate(requestData));
        // 發送給imac group
        // Version 1:
        // await linebot.sendPower(imacGroupID, weatherImage, messageText, weatherMessage, specials);
        // Version 2:
        await linebot.sendPower(imacGroupID, messageText, weatherMessage);
        ctx.status = 200;
    },
    controlMessage: async (ctx, next) => {
        let requestData = ctx.request.body;
        let imacGroupID = process.env.imacGroupID;
        let messageText = requestData.message;
        console.log(messageText);
        // 發送給imac group
        await linebot.sendText(imacGroupID, messageText);
        ctx.status = 200;
    },
    message: async (ctx, next) => {
        let requestData = ctx.request.body;
        let imacGroupID = process.env.imacGroupID;
        let messageText = requestData.message;
        console.log(messageText);
        // 發送給imac group
        await linebot.sendText(imacGroupID, messageText);
        ctx.status = 200;
    },
    test: async (ctx, next) => {
        let data = await co(mongoLab.controlFind());
        console.log(data);
        ctx.status = 200;
        ctx.body = data;
    },
    telegram: async (ctx, next) => {
        let telegramData = ['vcpu', 'ram', 'disk', 'switch', 'sdnSwitch', 'pc', 'server'];
        let key = ctx.params.key;
        let value = ctx.params.value;
        if (telegramData.find(e => e == key) != undefined) {
            await co(mongoLab.computerRoomInformationUpdateFromTelegram(key, value));
            ctx.status = 200;
            ctx.body = {
                [key]: value
            };
        } else {
            ctx.status = 400
            ctx.body = {
                status: 'key error'
            };
        }
    },
    middleware: linebot.middleware()
}