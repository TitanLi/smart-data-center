const crypto = require('crypto');
const request = require('request-promise');
const fs = require('fs');
// const serve = require('koa-static');

module.exports = function(channelSecret,lineBotToken){
  this.channelSecret = channelSecret;
  this.lineBotToken = lineBotToken;

/*
  ctx.request.body處理
  return Object

  message:
  {
    'type' : type, @string
    'replyToken' : replyToken, @string
    'sourceUserId' : sourceUserId, @string
    'sourceType' : sourceType, @string
    'messageType' : messageType, @string
    'messageText' : messageText @string
  }

  postback:
  {
    'type' : type, @string
    'replyToken' : replyToken, @string
    'sourceUserId' : sourceUserId, @string
    'sourceType' : sourceType, @string
    'postbackData' : postbackData, @string
  }
*/
  this.requestHandle = (ctx) => {
    let userMessages = ctx.request.body.events;
    if(ctx.status == 200){
      let replyToken,type,sourceType,sourceUserId,messageType,messageText,postbackData;
      userMessages.map(function(item, index, array){
        type = item.type;
        replyToken = item.replyToken;
        sourceUserId = item.source.userId;
        sourceType = item.source.type;
        if(type == 'message'){
          messageType = item.message.type;
          messageText = item.message.text;
        }else if(type == 'postback'){
          postbackData = item.postback.data;
        }
      });
      if(type == 'message'){
        return {
          'type' : type,
          'replyToken' : replyToken,
          'sourceUserId' : sourceUserId,
          'sourceType' : sourceType,
          'messageType' : messageType,
          'messageText' : messageText
        }
      }else if(type == 'postback'){
        return {
          'type' : type,
          'replyToken' : replyToken,
          'sourceUserId' : sourceUserId,
          'sourceType' : sourceType,
          'postbackData' : postbackData
        }
      }
    }else {
      return false;
    }
  }

/*
  line bot middleware 處理
  過慮訊息是否由line developers發出請求
  ctx.url = '/webhooks'
  ctx.method=='POST'
  result =>
    true ctx.status = 200
    false ctx.ststus = 401
*/
  this.middleware = () => {
    return async (ctx, next) => {
      const koaRequest = ctx.request;
      const hash = crypto
                        .createHmac('sha256', channelSecret)
                        .update(JSON.stringify(koaRequest.body))
                        .digest('base64');
      if(ctx.url=='/webhooks' && ctx.method=='POST'){
        if ( koaRequest.headers['x-line-signature'] === hash ) {
          // User 送來的訊息
          ctx.status = 200;
        } else {
          ctx.body = 'Unauthorized! Channel Serect and Request header aren\'t the same.';
          ctx.status = 401;
        }
      }
      await next();
    }
  };

/*
  自動回復文字設定
  property  Type    Description
  events    Object  JSON(requestHandle)
  resObject Object  JSON(Key:user message,Value:response text)

  return request-promise
*/
  this.responseText = (events,resObject) => {
    if (events) {
      console.log(events);
      let data = events.messageText;
      console.log(data);
      let options = {
              method: 'POST',
              uri: 'https://api.line.me/v2/bot/message/reply',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineBotToken}`
              },
              body: {
                replyToken: events.replyToken,
                messages: [{
                    type: "text",
                    text: resObject[data]
                  }]
              },
              json: true
            }
      return request(options);
    }else{
      ctx.body = "hash error";
    }
  };

/*
  自動回復carousel template
  參考資料：https://developers.line.me/en/docs/messaging-api/reference/#carousel
  property              Type        Description
  events                Object      JSON(requestHandle)
  altText               String      user received message
  thumbnailImageUrl     Object      user received image url
                                      Image URL (Max: 1000 characters)
                                      HTTPS
                                      JPEG or PNG
                                      Aspect ratio: 1:1.51
                                      Max width: 1024px
                                      Max: 1 MB
  imageBackgroundColor  Object      user received image background color
  title                 Object      user received title
                                      Max: 40 characters
  text                  Object      user received message text
                                      Max: 120 characters (no image or title)
                                      Max: 60 characters 
  defaultAction         Object      Action when image is tapped
                                      set for the entire image, title, and text area
  actions               Object      Action when tapped
                                      Max: 3
                                    
  return request-promise

  success
  response  {}
  return request-promise
*/
  this.responseCarouselTemplate = (events,altText,thumbnailImageUrl,imageBackgroundColor,title,text,defaultAction,actions) => {
    if (events) {
      console.log(events);
      let data = events.messageText;
      console.log(data);
      let options = {
              method: 'POST',
              uri: 'https://api.line.me/v2/bot/message/reply',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineBotToken}`
              },
              body: {
                replyToken: events.replyToken,
                messages: [{
                  "type": "template",
                  "altText": altText,
                  "template": {
                      "type": "carousel",
                      "columns": [],
                      "imageAspectRatio": "rectangle",
                      "imageSize": "cover"
                  }
                }]
              },
              json: true
            }
      for(let i = 0 ;i<thumbnailImageUrl.length;i++){
        options.body.messages[0].template.columns.push(
          {
            "thumbnailImageUrl": thumbnailImageUrl[i],
            "imageBackgroundColor": imageBackgroundColor[i],
            "title": title[i],
            "text": text[i],
            "defaultAction": defaultAction[i],
            "actions": actions[i]
          }
        )
      }
      return request(options);
    }else{
      ctx.body = "hash error";
    }
  };

/*
  取得user資料
  property  Type    Description
  userId    String  events.sourceUserId(requestHandle)

  return request-promise
*/
  this.getProfile = (userId) => {
    let options = {
            uri: 'https://api.line.me/v2/bot/profile/'+userId,
            headers: {
              'Authorization': `Bearer ${lineBotToken}`
            }
          }
    return request(options);
  }

/*
  Create Rich Menu
  property      Type      Description
  width         Int       width of the rich menu displayed in the chat
  height        Int       height of the rich menu displayed in the chat
  selected      Boolean   true to display the rich menu by default. Otherwise, false
  chatBarText   String    Text displayed in the chat bar Max: 14 characters
  boundsX       Int       Horizontal position relative to the top-left corner of the area
  boundsY       Int       Vertical position relative to the top-left corner of the area
  boundsWidth   Int       Width of the area
  boundsHeight  Int       Height of the area
  actionType    String    postback or message or uri or datetimepicker
  actionLabel   String    Label for the action
                              Required for templates other than image carousel. Max: 20 characters
                              Optional for image carousel templates. Max: 12 characters
                              Optional for rich menus. Spoken when the accessibility feature is enabled on the client device. Max: 20 characters
                              Supported on LINE iOS version 8.2.0 and later
  actionText    String    Text sent when the action is performed Max: 300 characters

  return request-promise

  response  {"richMenuId":"richmenu-3def666bec52cfab832c01ffe5xxxxxx"}
*/
  this.createRichMenu = (width,height,selected,chatBarText,boundsX,boundsY,boundsWidth,boundsHeight,actionType,actionLabel,actionText) => {
    let options = {
            method: 'POST',
            uri: 'https://api.line.me/v2/bot/richmenu',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineBotToken}`
            },
            body: {
              "size": {
                "width": width,
                "height": height
              },
              "selected": selected,
              "name": "Nice richmenu",
              "chatBarText": chatBarText,
              "areas": [
                {
                  "bounds": {
                    "x": boundsX,
                    "y": boundsY,
                    "width": boundsWidth,
                    "height": boundsHeight
                  },
                  "action": {
                    "type":actionType,
                    "label":actionLabel,
                    "text":actionText
                  }
                }
              ]
            },
            json: true
          };
      return request(options);
  }

/*
  upload image to rich menu
  property           Type         Description
  richMenuId         String       rich menu id
  picturePath        String       upload picture path

  return request-promise

  success
  response  {}
*/
  this.uploadRichMenuImage = (richMenuId,picturePath) => {
    let readStream = fs.createReadStream(picturePath);
    let stats = fs.statSync(picturePath);
    let fileSizeInBytes = stats["size"];
    let options = {
            method: 'POST',
            uri: `https://api.line.me/v2/bot/richmenu/${richMenuId}/content`,
            headers: {
              'Authorization': `Bearer ${lineBotToken}`,
              'Content-Type':'image/png',
              'Content-Length':fileSizeInBytes
            },
            body: readStream,
            encoding: null
          };
    return request(options);
  }

/*
  link rich menu to user
  property           Type         Description
  userId             String       user id
  richMenuId         String       rich menu id

  return request-promise

  success
  response  {}
*/
  this.linkRichMenuToUser = (userId,richMenuId) => {
    let options = {
            method: 'POST',
            uri: `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
            headers: {
              'Authorization': `Bearer ${lineBotToken}`
            },
            json: true
          };
    return request(options);
  }

/*
  get rich menu list

  return request-promise

  response JSON.stringify()
  {
    "richmenus": [
      {
        "richMenuId": "richmenu-e9d346dbb534eadd1c9e3e8bb72e6c5b",
        "size": {
          "width": 2500,
          "height": 1686
        },
        "selected": false,
        "areas": [
          {
            "bounds": {
              "x": 0,
              "y": 0,
              "width": 2500,
              "height": 1686
            },
            "action": {
              "type": "postback"
              "data": "action=buy&itemid=123"
            }
          }
        ]
      }
    ]
  }
*/
  this.getRichMenuList = () => {
    let options = {
            method: 'GET',
            uri: 'https://api.line.me/v2/bot/richmenu/list',
            headers: {
              'Authorization': `Bearer ${lineBotToken}`
            }
          };
    return request(options);
  }

/*
  delete rich menu
  property           Type         Description
  richMenuId         String       rich menu id

  return request-promise

  success
  response  {}
*/
  this.deleteRichMenu = (richMenuId) => {
    let options = {
            method: 'DELETE',
            uri: `https://api.line.me/v2/bot/richmenu/${richMenuId}`,
            headers: {
              'Authorization': `Bearer ${lineBotToken}`
            }
          };
    return request(options);
  }

/*
  send text
  picturePath : https://developers.line.me/media/messaging-api/sticker_list.pdf
  property       Type         Description
  userId         String       user id
  text           String       message

  return request-promise

  success
  response  {}
*/
  this.sendText = (userId,text) => {
    let options = {
      method: 'POST',
      uri: 'https://api.line.me/v2/bot/message/push',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lineBotToken}`
      },
      body: {
        to: userId,
        messages: [{
            type: "text",
            text: text
          }]
        },
        json: true
      }

    return request(options);
  }

/*
  send sticker
  picturePath : https://developers.line.me/media/messaging-api/sticker_list.pdf
  property       Type         Description
  userId         String       user id
  packageId      Int          STKPKGID
  stickerId      Int          stickerId

  return request-promise

  success
  response  {}
*/
  this.sendSticker = (userId,packageId,stickerId) => {
    let options = {
            method: 'POST',
            uri: 'https://api.line.me/v2/bot/message/push',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineBotToken}`
            },
            body: {
              to: userId,
              messages: [{
                "type": "sticker",
                "packageId": packageId,
                "stickerId": stickerId
              }]
            },
            json: true
          }
    return request(options);
  }

/*
  send image
  property              Type         Description
  userId                String       user id
  originalContentUrl    Int          https images url
  previewImageUrl       Int          https images url

  return request-promise

  success
  response  {}
*/
  this.sendImage = (userId,originalContentUrl,previewImageUrl) => {
    let options = {
            method: 'POST',
            uri: 'https://api.line.me/v2/bot/message/push',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineBotToken}`
            },
            body: {
              to: userId,
              messages: [{
                "type": "image",
                "originalContentUrl": originalContentUrl,
                "previewImageUrl": previewImageUrl
              }]
            },
            json: true
          }
    return request(options);
  }

/*
  send video
  property              Type         Description
  userId                String       user id
  originalContentUrl    Int          https video url
  previewImageUrl       Int          https images url

  return request-promise

  success
  response  {}
*/
  this.sendVideo = (userId,originalContentUrl,previewImageUrl) => {
    let options = {
            method: 'POST',
            uri: 'https://api.line.me/v2/bot/message/push',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineBotToken}`
            },
            body: {
              to: userId,
              messages: [{
                "type": "video",
                "originalContentUrl": originalContentUrl,
                "previewImageUrl": previewImageUrl
              }]
            },
            json: true
          }
    return request(options);
  }

/*
send carousel template
參考資料：https://developers.line.me/en/docs/messaging-api/reference/#carousel
  property              Type        Description
  userId                String      user id
  altText               String      user received message
  thumbnailImageUrl     Object      user received image url
                                      Image URL (Max: 1000 characters)
                                      HTTPS
                                      JPEG or PNG
                                      Aspect ratio: 1:1.51
                                      Max width: 1024px
                                      Max: 1 MB
  imageBackgroundColor  Object      user received image background color
  title                 Object      user received title
                                      Max: 40 characters
  text                  Object      user received message text
                                      Max: 120 characters (no image or title)
                                      Max: 60 characters 
  defaultAction         Object      Action when image is tapped
                                      set for the entire image, title, and text area
  actions               Object      Action when tapped
                                      Max: 3
                                    
  return request-promise

  success
  response  {}
*/
  this.carouselTemplate = (userId,altText,thumbnailImageUrl,imageBackgroundColor,title,text,defaultAction,actions) => {
    let options = {
            method: 'POST',
            uri: 'https://api.line.me/v2/bot/message/push',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${lineBotToken}`
            },
            body: {
              to: userId,
              messages: [{
                "type": "template",
                "altText": altText,
                "template": {
                    "type": "carousel",
                    "columns": [],
                    "imageAspectRatio": "rectangle",
                    "imageSize": "cover"
                }
              }]
            },
            json: true
          }
    for(let i = 0 ;i<thumbnailImageUrl.length;i++){
      options.body.messages[0].template.columns.push(
        {
          "thumbnailImageUrl": thumbnailImageUrl[i],
          "imageBackgroundColor": imageBackgroundColor[i],
          "title": title[i],
          "text": text[i],
          "defaultAction": defaultAction[i],
          "actions": actions[i]
        }
      )
    }
    return request(options);
  }
};
