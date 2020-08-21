//power-meter
socket.on("temperature", function (data) {
  var temperature = document.getElementById("temperature-data");
  temperature.innerHTML = data + "°C";
  console.log(data);
});

socket.on("humidity", function (data) {
  var humidity = document.getElementById("humidity-data");
  humidity.innerHTML = data + "%";
  console.log(data);
});

//UPS1
socket.on("inputVolt_A", function (data) {
  var upsData = document.getElementById("inputVolt_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("inputFreq_A", function (data) {
  var upsData = document.getElementById("inputFreq_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputVolt_A", function (data) {
  var upsData = document.getElementById("outputVolt_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputFreq_A", function (data) {
  var upsData = document.getElementById("outputFreq_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputAmp_A", function (data) {
  var upsData = document.getElementById("outputAmp_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputWatt_A", function (data) {
  var upsData = document.getElementById("outputWatt_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("systemMode_A", function (data) {
  var upsData = document.getElementById("systemMode_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputPercent_A", function (data) {
  var upsData = document.getElementById("outputPercent_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryHealth_A", function (data) {
  var upsData = document.getElementById("batteryHealth_A");
  upsData.innerHTML = data;
  console.log(data);
  console.log("error");
});

socket.on("batteryCharge_Mode_A", function (data) {
  var upsData = document.getElementById("batteryCharge_Mode_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryTemp_A", function (data) {
  var upsData = document.getElementById("batteryTemp_A");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryRemain_A", function (data) {
  var upsData = document.getElementById("batteryRemain_A");
  upsData.innerHTML = data;
  var upsStatus = document.getElementById("battery1-status");
  upsStatus.innerHTML = data;
  console.log(data);
});

socket.on("batteryRemain_Percent_A", function (data) {
  var styleElem = document.head.appendChild(document.createElement("style"));
  styleElem.innerHTML = "#battery1-ups::before {height: "+data+"%;}";
  console.log(data);
});

//UPS2
socket.on("inputVolt_B", function (data) {
  var upsData = document.getElementById("inputVolt_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("inputFreq_B", function (data) {
  var upsData = document.getElementById("inputFreq_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputVolt_B", function (data) {
  var upsData = document.getElementById("outputVolt_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputFreq_B", function (data) {
  var upsData = document.getElementById("outputFreq_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputAmp_B", function (data) {
  var upsData = document.getElementById("outputAmp_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputWatt_B", function (data) {
  var upsData = document.getElementById("outputWatt_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("systemMode_B", function (data) {
  var upsData = document.getElementById("systemMode_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("outputPercent_B", function (data) {
  var upsData = document.getElementById("outputPercent_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryHealth_B", function (data) {
  var upsData = document.getElementById("batteryHealth_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryCharge_Mode_B", function (data) {
  var upsData = document.getElementById("batteryCharge_Mode_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryTemp_B", function (data) {
  var upsData = document.getElementById("batteryTemp_B");
  upsData.innerHTML = data;
  console.log(data);
});

socket.on("batteryRemain_B", function (data) {
  var upsData = document.getElementById("batteryRemain_B");
  upsData.innerHTML = data;
  var upsStatus = document.getElementById("battery2-status");
  upsStatus.innerHTML = data;
  console.log(data);
});

socket.on("batteryRemain_Percent_B", function (data) {
  var styleElem = document.head.appendChild(document.createElement("style"));
  styleElem.innerHTML = "#battery2-ups::before {height: "+data+"%;}";
  console.log(data);
});

socket.on("yesterdayPower", function (data) {
  var textarea = $("#messageList").append("機房每日報告\n"+new Date().toLocaleString('zh-tw')+"\n"+"冷氣昨日消耗："+data.powerMeterPower+"度電\n"+"ups_A昨日消耗："+data.upsPower_A+"度電\n"+"ups_B昨日消耗："+data.upsPower_B+"度電\n");
  textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
  console.log(data);
});

socket.on("D0", function (data) {
  document.getElementById("D0").innerHTML = data;
  console.log(data);
});

socket.on("D1", function (data) {
  document.getElementById("D1").innerHTML = data;
  console.log(data);
});

socket.on("D2", function (data) {
  document.getElementById("D2").innerHTML = data;
  console.log(data);
});

socket.on("ET7044", function (data) {
  var textarea = $("#messageList").append(data);
  textarea.scrollTop(textarea[0].scrollHeight - textarea.height());
  console.log(data);
});
socket.on("fan1", function(data){
  document.getElementById("fan1").innerHTML = data;
  console.log(data);
});
socket.on("fan2", function(data){
  document.getElementById("fan2").innerHTML = data;
  console.log(data);
})
socket.on("fan3", function(data){
  document.getElementById("fan3").innerHTML = data;
  console.log(data);
})
socket.on("fan4", function(data){
  document.getElementById("fan4").innerHTML = data;
  console.log(data); 
})