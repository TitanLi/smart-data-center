const SerialPort = require("serialport");
const mqtt = require('mqtt');
const config = require('./config.js');
const client  = mqtt.connect(config.MQTT);

var port = new SerialPort(config.serialport, {
    parser: SerialPort.parsers.readline('\n')
});

client.on('connect', function () {
  console.log('on connect');
  client.subscribe('current');
});

port.on('open', function() {
    port.on('data', function(data) {
        console.log(data);
        client.publish('current', data.toString());
    });
});
