// var piePercent = [
//     { name: '冷氣', y: parseInt("{{powerMeterPower}}") },
//     { name: 'UPS1', y: parseInt("{{upsPower_A}}") },
//     { name: 'UPS2', y: parseInt("{{upsPower_B}}") }
// ];

console.log(piePercent);
socket.on("piePercent", function (data) {
  if (data) {
    piePercent = data;
    console.log(piePercent);
    new Highcharts.chart('container', {
        chart: {
            backgroundColor: [43, 40, 40, 0.71],
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            style: {
              color:"#ffffff"
            },
            verticalAlign: 'top',
            y:36,
            text: '消耗功率比例<br>(每10分鐘更新一次)</br>'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                colors: pieColors,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                    distance: -46,
                    filter: {
                        property: 'percentage',
                        operator: '>',
                        value: 4
                    },
                    style: {
                        fontSize: '16px'
                    }
                }
            }
        },
        series: [{
            name: 'Share',
            data: piePercent
        }],
        navigation:{
          buttonOptions: {
            enabled:false
          }
        },
        credits: {
          enabled: false
        }
    });
  }
});

// Make monochrome colors
var pieColors = (function () {
    var colors = [],
        base = Highcharts.getOptions().colors[0],
        i;

    for (i = 0; i < 10; i += 1) {
        // Start out with a darkened base color (negative brighten), and end
        // up with a much brighter color
        colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
    }
    return colors;
}());

// Build the chart
Highcharts.chart('container', {
    chart: {
        backgroundColor: [43, 40, 40, 0.71],
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        style: {
          color:"#ffffff"
        },
        verticalAlign: 'top',
        y:36,
        text: '消耗功率比例<br>(每10分鐘更新一次)</br>'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            colors: pieColors,
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
                distance: -46,
                filter: {
                    property: 'percentage',
                    operator: '>',
                    value: 4
                },
                style: {
                    fontSize: '16px'
                }
            }
        }
    },
    series: [{
        name: 'Share',
        data: piePercent
    }],
    navigation:{
      buttonOptions: {
        enabled:false
      }
    },
    credits: {
      enabled: false
    }
});
