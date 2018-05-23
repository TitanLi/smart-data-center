module.exports = {
    carouselTemplateControl : (linebot,events,text1,text2,text3) => {
        let altText = '遠端控制';
        let thumbnailImageUrl = ['https://i.imgur.com/O8lp0mk.png','https://i.imgur.com/icAeax3.png','https://i.imgur.com/0GJsShU.jpg'];
        let imageBackgroundColor = ['#FFEE99','#FFEE99','#FFEE99'];
        let title = ['排風風扇','進風風扇','加溼器'];
        let text = [text1,text2,text3];
        let defaultAction = [
          {
            'type': 'message',
            'label': '排風風扇',
            'text':'排風風扇'
          },
          {
            'type': 'message',
            'label': '進風風扇',
            'text':'進風風扇'
          },
          {
            'type': 'message',
            'label': '加溼器',
            'text':'加溼器'
          }
        ];
        let actions = [
          [
            {
              "type": "postback",
              "label": "開啟",
              "data":"outputFan#true"
            },
            {
              "type": "postback",
              "label": "關閉",
              "data":"outputFan#false"
            }
          ],
          [
            {
              "type": "postback",
              "label": "開啟",
              "data":"inputFan#true"
            },
            {
              "type": "postback",
              "label": "關閉",
              "data":"inputFan#false"
            }
          ],
          [
            {
              "type": "postback",
              "label": "開啟",
              "data":"humidity#true"
            },
            {
              "type": "postback",
              "label": "關閉",
              "data":"humidity#false"
            }
          ]
        ];
        return linebot.responseCarouselTemplate(events,
                                                altText,
                                                thumbnailImageUrl,
                                                imageBackgroundColor,
                                                title,
                                                text,
                                                defaultAction,
                                                actions);
    },
    arduinoCarouselTemplateControl : (linebot,events,text1,text2) => {
        let altText = 'arduino遠端控制';
        let thumbnailImageUrl = ['https://i.imgur.com/q8dNbS9.jpg','https://i.imgur.com/q8dNbS9.jpg'];
        let imageBackgroundColor = ['#FFEE99','#FFEE99'];
        let title = ['繼電器1','繼電器2'];
        let text = [text1,text2];
        let defaultAction = [
          {
            'type': 'message',
            'label': '繼電器1',
            'text':'繼電器1'
          },
          {
            'type': 'message',
            'label': '繼電器2',
            'text':'繼電器2'
          }
        ];
        let actions = [
          [
            {
              "type": "postback",
              "label": "開啟",
              "data": "relay1#true"
            },
            {
              "type": "postback",
              "label": "關閉",
              "data": "relay1#false"
            }
          ],
          [
            {
              "type": "postback",
              "label": "開啟",
              "data": "relay2#true"
            },
            {
              "type": "postback",
              "label": "關閉",
              "data": "relay2#false"
            }
          ]
        ];
        return linebot.responseCarouselTemplate(events,
                                                altText,
                                                thumbnailImageUrl,
                                                imageBackgroundColor,
                                                title,
                                                text,
                                                defaultAction,
                                                actions);
  }
  }