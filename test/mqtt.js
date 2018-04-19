const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1:1883');

var UPS_Data = { "connect_A" : "/dev/ttyUSB0 (左)",
             "connect_B" : "/dev/ttyUSB1 (右)",
             "ups_Life_A" : "onLine(在線)",
             "ups_Life_B" : "onLine(在線)" ,
             "input_A" : { "inputLine_A" : "1",
                           "inputFreq_A" : "60.0",
                           "inputVolt_A" : "217.0"},
             "input_B" : { "inputLine_B" : "1",
                           "inputFreq_B" : "60.0",
                           "inputVolt_B" : "217.0"},
             "output_A" : {"systemMode_A" : "Normal",
                           "outputLine_A" : "1",
                           "outputFreq_A" : "60.0",
                           "outputVolt_A" : "222.0",
                           "outputAmp_A" : "14.5766",
                           "outputWatt_A" : "3.236",
                           "outputPercent_A" : "38"},
             "output_B" : { "systemMode_B" : "Normal",
                            "outputLine_B" : "1",
                            "outputFreq_B" : "60.0",
                            "outputVolt_B" : "221.0",
                            "outputAmp_B" : "16.3484",
                            "outputWatt_B" : "3.613",
                            "outputPercent_B" : "43"},
             "battery_A" : {
                             "status" : {
                                          "batteryHealth_A" : "Good (良好)",
                                          "batteryStatus_A" : "OK (良好)",
                                          "batteryCharge_Mode_A" : "Boost charging (快速充電)",
                                          "batteryRemain_Min_A" : "None By Charging (充電中)",
                                          "batteryRemain_Sec_A" : "None By Charging (充電中)",
                                          "batteryVolt_A" : "271",
                                          "batteryTemp_A" : "32",
                                          "batteryRemain_Percent_A" : "100"
                                        }
                             },
                             "lastChange" : {
                                        "lastBattery_Year_A" : "2017",
                                        "lastBattery_Mon_A" : "3",
                                        "lastBattery_Day_A" : "22"
                             },
                             "nextChange" : { "nextBattery_Year_A" : "2020",
                                        "nextBattery_Mon_A" : "3",
                                        "nextBattery_Day_A" : "22"
                             },
              "battery_B" : {
                              "status" : {
                                          "batteryHealth_B" : "Good (良好)",
                                          "batteryStatus_B" : "OK (良好)",
                                          "batteryCharge_Mode_B" : "Boost charging (快速充電)",
                                          "batteryRemain_Min_B" : "None By Charging (充電中)",
                                          "batteryRemain_Sec_B" : "None By Charging (充電中)",
                                          "batteryVolt_B" : "272",
                                          "batteryTemp_B" : "31",
                                          "batteryRemain_Percent_B" : "100"
                                         },
                              "lastChange" : {
                                         "lastBattery_Year_B" : "2017",
                                         "lastBattery_Mon_B" : "3",
                                         "lastBattery_Day_B" : "22"
                              },
                              "nextChange" : {
                                         "nextBattery_Year_B" : "2020",
                                         "nextBattery_Mon_B" : "3",
                                         "nextBattery_Day_B" : "22"
                              }
                            }
            };
var current = {"Humidity":35.0,"Temperature":25.0,"currents":2.90};
var i = 0;
setInterval(() => {
  client.publish('UPS_Monitor',JSON.stringify(UPS_Data));
  client.publish('current',JSON.stringify(current));
  console.log(i++);
},3000);
