var outputAmp_A = 0;
socket.on("outputAmp_A", function (data) {
  if (data) {
    outputAmp_A = Number(data);
  }
});

$(document).ready(function() {
  var chart = {
    backgroundColor: [43, 40, 40, 0.71],
    type: 'spline',
    animation: Highcharts.svg, // don't animate in IE < IE 10.
    marginRight: 10,
    events: {
      load: function () {
          // set up the updating of the chart each second
          var series = this.series[0];
          setInterval(function () {
            var x = (new Date()).getTime(), // current time
            y = outputAmp_A;
            series.addPoint([x, y], true, true);
          }, 1000);
        }
      }
    };
    var title = {
      text: 'UPS1',
      style: {
        color: '#ffffff'
      }
    };
    var xAxis = {
      type: 'datetime',
      tickPixelInterval: 150,
      labels:{
        style:{
          color: '#ffffff',
          fontSize: "12px",
          fontWeight: "blod",
          fontFamily: "Courier new"
        }
      }
    };
    var yAxis = {
      tickInterval: 0.01,
      title: {
        text: '電流（A)',
        style:{
          color: '#ffffff'
        }
      },
      labels:{
        style:{
          color: '#ffffff',
          fontSize: "12px",
          fontWeight: "blod",
          fontFamily: "Courier new"
        }
      },
      plotLines: [{
        value: 0,
        width: 1,
        color: '#808080'
      }]
    };
    var tooltip = {
      formatter: function () {
        return '<b>' + this.series.name + '</b><br/>' +
        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
        Highcharts.numberFormat(this.y, 2);
      }
    };
    var plotOptions = {
      area: {
        pointStart: 1940,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    };
    var legend = {
      enabled: false
    };
    var exporting = {
      enabled: false
    };
    var series= [{
      name: 'UPS1',
      data: (function () {
        // generate an array of random data
        var data = [],time = (new Date()).getTime(),i;
        for (i = -19; i <= 0; i += 1) {
          data.push({
            x: time + i * 1000,
            y: Math.random()
          });
        }
        return data;
      }())
    }];

    var credits = {
      enabled: false
    }

    var json = {};
    json.chart = chart;
    json.title = title;
    json.tooltip = tooltip;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.legend = legend;
    json.exporting = exporting;
    json.series = series;
    json.plotOptions = plotOptions;
    json.credits = credits;


    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    $('#ups1').highcharts(json);
});
