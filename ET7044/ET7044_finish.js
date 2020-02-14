const mqtt = require('mqtt');
const ModbusRTU = require("modbus-serial");
const config = require("./config.json");
const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"];
const writeData = [false, false, false, false, false, false, false, false];
let client = new ModbusRTU();
let timeoutRunRef = null;
let timeoutConnectRef = null;
let DOstatus;

function checkError(e) {
    if (e.errno && networkErrors.includes(e.errno)) {
        console.log("we have to reconnect");
        // close port
        client.close();
        // re open client
        client = new ModbusRTU();
        timeoutConnectRef = setTimeout(connect, 1000);
    }
}
function connect() {
    // clear pending timeouts
    clearTimeout(timeoutConnectRef);
    // if client already open, just run
    // if (client.isOpen()) {
    //     run();
    // }
    client.connectTCP(config.ET7044, { port: 502 })
        .then(setClient)
        .then(function () {
            console.log("Connected");
        })
        .catch(function (e) {
            console.log(e.message);
        });
}
function setClient() {
    // set the client's unit id
    // set a timout for requests default is null (no timeout)
    client.setID(1);
    client.setTimeout(3000);
    // run program
    run();
}

function run() {
    // clear pending timeouts
    clearTimeout(timeoutRunRef);
    client.writeCoils(0, writeData);
    client.readCoils(0, 8)
        .then(function (d) {
            //DOstatus = d.data.toString();
            DOstatus = JSON.stringify(d.data);
            console.log(DOstatus);
            console.log("Receive:", d.data);
            mqttClient.publish('ET7044/DOstatus', DOstatus);
        })
        .then(function () {
            timeoutRunRef = setTimeout(run, 5000);
        })
        .catch(function (e) {
            checkError(e);
            console.log(e.message);
        });

}
// connect and start logging
connect();

// Mqtt connecting and pub
const mqttClient = mqtt.connect(config.MQTT);
mqttClient.on('connect', function () {
    console.log('connect to MQTT server');
    mqttClient.subscribe('ET7044/write');
});

mqttClient.on('message', function (topic, message) {
    // message is Buffer
    writeData = JSON.parse(message);
    console.log(writeData);
});
