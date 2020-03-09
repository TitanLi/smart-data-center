const SerialPort = require("serialport");
const mqtt = require('mqtt');
const config = require('./config.js');
const client  = mqtt.connect(config.MQTT);



function connect(){
	port = new SerialPort(config.serialport, { 
    	  parser: SerialPort.parsers.readline('\n'),
          autoOpen:true
	},(err)=>{
           if(err){
             setTimeout(()=>{
               connect();
             },1000);
           }
        });
        port.on('open', function() {
          console.log("arduino connect")
          port.on('data', function(data) {
            console.log(data);
            console.log(data.toString())
            client.publish('waterTank', data.toString());
          });
        });

        port.on('close', function (err) {
           console.log('close');                                                                                                                                connect();
        });
}
client.on('connect', function () {
  console.log('on connect');
});

connect();
