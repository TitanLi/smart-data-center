// nohup mongoexport --db smart-data-center --collection ups_Life_A --type csv --out ups_Life_A.csv --fields connectDevice,upsStatus,inputFreq,inputVolt,systemMode,outputFreq,outputVolt,outputAmp,outputWatt,outputPercent,batteryHealth,batteryStatus,batteryCharge_Mode,batteryRemain_Min,batteryRemain_Sec,batteryVolt,batteryTemp,batteryRemain_Percent,lastChangeBattery_Year,lastChangeBattery_Mon,lastChangeBattery_Day,nextBattery_Year,nextBattery_Mon,nextBattery_Day,time &> ups_Life_A.log &

const MongoLocalClient = require('mongodb').MongoClient;
const assert = require('assert');
var i = 1;
MongoLocalClient.connect('mongodb://10.20.0.19:27017/', (err, client) => {
    localDB = client.db("smart-data-center");
    console.log("connect mongodb on 27017 port");

    let collection = localDB.collection('ups');
    let ups_Life_A = localDB.collection('ups_Life_A');
    let ups_Life_B = localDB.collection('ups_Life_B');

    let stream = collection.find().stream();

    // Execute find on all the documents
    stream.on('close', function() {
        client.close();
    });

    stream.on('data', function(data) {
        assert.ok(data != null);
        console.log(data);
        let upsLifeDataA = {
            connectDevice : data.connect_A,
            upsStatus : data.ups_Life_A,
            inputFreq : data.input_A.inputFreq_A,
            inputVolt : data.input_A.inputVolt_A,
            systemMode : data.output_A.systemMode_A,
            outputFreq : data.output_A.outputFreq_A,
            outputVolt : data.output_A.outputVolt_A,
            outputAmp : data.output_A.outputAmp_A,
            outputWatt : data.output_A.outputWatt_A,
            outputPercent : data.output_A.outputPercent_A,
            batteryHealth : data.battery_A.status.batteryHealth_A,
            batteryStatus : data.battery_A.status.batteryStatus_A,
            batteryCharge_Mode : data.battery_A.status.batteryCharge_Mode_A,
            batteryRemain_Min : data.battery_A.status.batteryRemain_Min_A,
            batteryRemain_Sec : data.battery_A.status.batteryRemain_Sec_A,
            batteryVolt : data.battery_A.status.batteryVolt_A,
            batteryTemp : data.battery_A.status.batteryTemp_A,
            batteryRemain_Percent : data.battery_A.status.batteryRemain_Percent_A,
            lastChangeBattery_Year : data.battery_A.lastChange.lastBattery_Year_A,
            lastChangeBattery_Mon : data.battery_A.lastChange.lastBattery_Mon_A,
            lastChangeBattery_Day : data.battery_A.lastChange.lastBattery_Day_A,
            nextBattery_Year : data.battery_A.nextChange.nextBattery_Year_A,
            nextBattery_Mon : data.battery_A.nextChange.nextBattery_Mon_A,
            nextBattery_Day : data.battery_A.nextChange.nextBattery_Day_A,
            time : new Date(data.time)
        }
        ups_Life_A.insert(upsLifeDataA, function(err, data) {
            if (err) {
                console.log('upsA data insert failed');
            } else {
                console.log('upsA data insert successfully');
            }
        });

        let upsLifeDataB = {
            connectDevice : data.connect_B,
            upsStatus : data.ups_Life_B,
            inputFreq : data.input_B.inputFreq_B,
            inputVolt : data.input_B.inputVolt_B,
            systemMode : data.output_B.systemMode_B,
            outputFreq : data.output_B.outputFreq_B,
            outputVolt : data.output_B.outputVolt_B,
            outputAmp : data.output_B.outputAmp_B,
            outputWatt : data.output_B.outputWatt_B,
            outputPercent : data.output_B.outputPercent_B,
            batteryHealth : data.battery_B.status.batteryHealth_B,
            batteryStatus : data.battery_B.status.batteryStatus_B,
            batteryCharge_Mode : data.battery_B.status.batteryCharge_Mode_B,
            batteryRemain_Min : data.battery_B.status.batteryRemain_Min_B,
            batteryRemain_Sec : data.battery_B.status.batteryRemain_Sec_B,
            batteryVolt : data.battery_B.status.batteryVolt_B,
            batteryTemp : data.battery_B.status.batteryTemp_B,
            batteryRemain_Percent : data.battery_B.status.batteryRemain_Percent_B,
            lastChangeBattery_Year : data.battery_B.lastChange.lastBattery_Year_B,
            lastChangeBattery_Mon : data.battery_B.lastChange.lastBattery_Mon_B,
            lastChangeBattery_Day : data.battery_B.lastChange.lastBattery_Day_B,
            nextBattery_Year : data.battery_B.nextChange.nextBattery_Year_B,
            nextBattery_Mon : data.battery_B.nextChange.nextBattery_Mon_B,
            nextBattery_Day : data.battery_B.nextChange.nextBattery_Day_B,
            time : new Date(data.time)
        }
        ups_Life_B.insert(upsLifeDataB, function(err, data) {
            if (err) {
                console.log('upsB data insert failed');
            } else {
                console.log('upsB data insert successfully');
            }
        });
        console.log(`================第${i}筆資料================`)
        i++;
    });
});




