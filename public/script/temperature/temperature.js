var temperatureMax = 100;//溫度最高值
var currentTemperature = 24;//目前溫度
var animationTime = 10000;//動畫時間
var numberUnit = "°C";//溫度前符號
var tickMarkUnit = 4;//區間個數
var tickHeight = 16;//每個刻度多少px
var heightOfBody;//溫度計高度
var widthOfNumbers = 50;//the width in px of the numbers on the left

var arrayOfImages;
var imgsLoaded = 0;
var mercuryHeightEmpty = 0;
var numberStartY = 6;
var thermTopHeight = 13;
var thermBottomHeight = 51;
var tooltipOffset = 15;

//start once the page is loaded
$( document ).ready(function() {
	console.log(1);
	createGraphics();
});

//visually create the thermometer
function createGraphics(){
	console.log(2);
	//preload and add the background images
	$('<img/>').attr('src', "tickShine.png").load(function(){
		$(this).remove();
		$("#therm-body-fore").css("background-image", "url('"+"tickShine.png"+"')");
	});

	$('<img/>').attr('src', "tooltipMiddle.png").load(function(){
		$(this).remove();
		$("#therm-tooltip .tip-middle").css("background-image", "url('" + "tooltipMiddle.png" + "')");
	});

	//adjust the css
	heightOfBody = tickMarkUnit * tickHeight;
	$("#therm-graphics").css("left", widthOfNumbers)
	$("#therm-body-bg").css("height", heightOfBody);
	$("#goal-thermometer").css("height",  heightOfBody + thermTopHeight + thermBottomHeight);
	$("#therm-body-fore").css("height", heightOfBody);
	$("#therm-bottom").css("top", heightOfBody + thermTopHeight);
	$("#therm-body-mercury").css("top", heightOfBody + thermTopHeight);
	$("#therm-tooltip").css("top", heightOfBody + thermTopHeight - tooltipOffset);

	//add the numbers to the left
	var numbersDiv = $("#therm-numbers");
	var countPerTick = temperatureMax/tickMarkUnit;

	//add the number
	for ( var i = 0; i < tickMarkUnit; i++ ) {
		var yPos = tickHeight * i + numberStartY;
		var style = $("<style>.pos" + i + " { top: " + yPos + "px; width:"+widthOfNumbers+"px }</style>");
		$("html > head").append(style);
		var dollarText = commaSeparateNumber(temperatureMax - countPerTick * i);
		$( numbersDiv ).append( "<div class='therm-number pos" + i + "'>" +dollarText+ "</div>" );

	}

	//check that the images are loaded before anything
	arrayOfImages = ["#therm-top", "#therm-body-bg", "#therm-body-mercury", "#therm-bottom", ".tip-left", ".tip-right"];
	preload(arrayOfImages);

};

//check if each image is preloaded
function preload(arrayOfImages) {
	console.log(6);
	for(i=0;i<arrayOfImages.length;i++){
		$("#goal-thermometer").fadeTo(1000, 1, function(){
			console.log("aaa");
		 animateThermometer();
		});
	}

}

//顯示溫度
function animateThermometer(){
	console.log(4);
	var percentageComplete = currentTemperature/temperatureMax;
	var mercuryHeight = Math.round(heightOfBody * percentageComplete);
	var newMercuryTop = heightOfBody + thermTopHeight - mercuryHeight;

	$("#therm-body-mercury").css({height:mercuryHeight +1, top:newMercuryTop });
	$("#therm-tooltip").css({top:newMercuryTop - tooltipOffset});
	$("#therm-tooltip .tip-middle p").html(currentTemperature+"°C");
}

//format the numbers with $ and commas
function commaSeparateNumber(val){
	console.log(5);
	val = Math.round(val);
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/);
    }
    return val + numberUnit;
}
