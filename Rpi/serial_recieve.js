const Readline = require('@serialport/parser-readline')
const parser = new Readline()
var SerialPort = require("serialport");
var arduinoCOMPort = "/dev/ttyACM0";
var arduinoport = new SerialPort(arduinoCOMPort, {baudRate: 9600}).setEncoding('utf8');
var mqtt = require('mqtt')
var data
const client  = mqtt.connect('mqtt://127.0.0.1')

arduinoport.on("open", () => {
  console.log('serial port open');
},200);
client.on('message', function (topic, message){
    arduinoport.write(message, (err) => {n
      if (err) {
          return console.log('written error:',err.message);
        }
      console.log('message written')
        });
      });
arduinoport.pipe(parser)
client.on('connect', function () {
  client.subscribe('arduino');
});
setInterval(function(){
  arduinoport.write('s')
},5000)
parser.on('data', line =>{
  console.log(line)
  var Arduno_data = JSON.parse(line);
  // var data = Object.keys(Arduno_data) 
  var data_value = Object.values(Arduno_data)
  data = data_value;
  asyncCall();
  },100)
async function asyncCall() {
  const client  = mqtt.connect('mqtt://127.0.0.1')
  client.on('connect', function () {
    console.log(data);
    client.publish('7F_FAN',JSON.stringify(data))
    client.end()
  },100); 
}
