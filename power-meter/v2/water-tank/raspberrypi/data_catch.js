const SerialPort = require("serialport");
const mqtt = require('mqtt');
const config = require('./config.js');
const client  = mqtt.connect(config.MQTT);

const Readline = SerialPort.parsers.Readline;
var port;
function connect() {
    port = new SerialPort(config.serialport, {
        baudRate: 9600
    });
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
    // parser.on('data', console.log);
    port.on('open', function () {
        console.log('port open')
        parser.on('data', function (data) {
            console.log(JSON.parse(data));
            client.publish('waterTank', data.toString());
        });
    });

    port.on('close', function (err) {
        console.log('close')
    });
}
connect();

setInterval(() => {
    port.get(function (err) {
        if (err) {
            console.log(err);
            connect();
        }
    });
}, 1000);
