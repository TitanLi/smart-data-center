const express = require('express');
const app = express();
var SerialPort = require("serialport");
SerialPort.list((err, ports) => {
  console.log(ports)                
})
var port = 3000;
var arduinoCOMPort = "/dev/ttyUSB0";
var arduinoport = new SerialPort(arduinoCOMPort, {baudRate: 9600});
var i=1;
while(i){
    arduinoport.on('open',function() {
        console.log('Serial Port ' + arduinoport + ' is opened.');
      });
    arduinoport.write("RELAY1");
    }
//> ROBOT ONLINE