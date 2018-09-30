const ModbusRTU = require("modbus-serial");
const mqtt = require('mqtt');
const config = require('./config.json');
const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"];
var client = new ModbusRTU();
var ans = new Array();
var a = new Array();
var l = 0;
var pm3133_a, pm3133_b, pm3133_c;
var t = 0;
var j = 0;
var address = 4352; //i

const mqttClient = mqtt.connect(config.MQTT);
mqttClient.on('connect', function () {
    console.log('connect to MQTT server');
    mqttClient.subscribe("PM3133/A");
    mqttClient.subscribe("PM3133/B");
    mqttClient.subscribe("PM3133/C");
});

setInterval(function () {
    connect();
}, 5000);

// open connection to a serial port
function connect() {
    client.connectRTU(config.PM3133, { baudrate: 9600 })
        .then(setClient)
        .then(function () {
            console.log("Connected");
        })
        .catch(function (e) {
            console.log(e.message);
            process.exit(1);
        });
}

function setClient() {
    client.setID(1);
    run();
}

function run() {
    // i = i + 1;
    if (j == 0) {
        address = 4352;
    } else if (j == 10) {
        address = 4370;
    } else if (j == 20) {
        address = 4388;
    } else if (j == 30) {
        j = 0;
        close();
        return 0;
    }
    client.readInputRegisters(address++, 1)
        .then(function (d) {
            for (t = 0; t < 2; t++) {
                c = d.buffer[t].toString(16);
                a[l + t] = c;
            }
            l = l + 2;
            j++;
        })
        .catch(function (e) {
            checkError(e);
            console.log(e.message);
        }).then(run);
}

function close() {
    for (j = 0; j < l; j = j + 4) {
        var buffer = new ArrayBuffer(4);
        var bytes = new Uint8Array(buffer);
        bytes[0] = "0x" + a[j + 2];
        bytes[1] = "0x" + a[j + 3];
        bytes[2] = "0x" + a[j];
        bytes[3] = "0x" + a[j + 1];
        var view = new DataView(buffer);
        ans[t] = view.getFloat32(0, false);
        t++;
    }

    pm3133_a = JSON.stringify({
        "V_a": new Number(ans[0] / 100).toFixed(3),
        "I_a": new Number(ans[1]).toFixed(3),
        "kW_a": new Number(ans[2]).toFixed(3),
        "kvar_a": new Number(ans[3]).toFixed(3),
        "kVA_a": new Number(ans[4]).toFixed(3)
    });
    pm3133_b = JSON.stringify({
        "V_b": new Number(ans[5] / 100).toFixed(3),
        "I_b": new Number(ans[6]).toFixed(3),
        "kW_b": new Number(ans[7]).toFixed(3),
        "kvar_b": new Number(ans[8]).toFixed(3),
        "kVA_b": new Number(ans[9]).toFixed(3)
    });
    pm3133_c = JSON.stringify({
        "V_c": new Number(ans[10] / 100).toFixed(3),
        "I_c": new Number(ans[11]).toFixed(3),
        "kW_c": new Number(ans[12]).toFixed(3),
        "kvar_c": new Number(ans[13]).toFixed(3),
        "kVA_c": new Number(ans[14]).toFixed(3)
    });
    console.log(pm3133_a);
    console.log(pm3133_b);
    console.log(pm3133_c);
    mqttClient.publish('PM3133/A', pm3133_a);
    mqttClient.publish('PM3133/B', pm3133_b);
    mqttClient.publish('PM3133/C', pm3133_c);
    client.close(function () {
        console.log('close');
    });
}

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