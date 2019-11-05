const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1:1883');

client.on('connect', function () {
    client.subscribe('current');
});

client.on('message', function (topic, message) {
    console.log(topic, JSON.parse(message));
})
