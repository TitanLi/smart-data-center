const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const render = require('koa-swig');
const json = require('koa-json');
const dotenv = require('dotenv').load();
const bodyParser = require('koa-bodyparser');
const route = require('./route/route.js');

const app = new koa();
const router = Router();

app.use(json());
app.use(logger());
app.use(bodyParser());

router.get('/', route.index);

// {
//   "events":[
//   {
//     "type": "message",
//     "replyToken": "567feb1e12d644c2a5aa49d35aeab618",
//     "source": {
//       "userId": "U6ac46864e9646bd5bd954471f0060194",
//       "type": "user"
//     },
//     "timestamp": 1526787595580,
//     "message": {
//       "type": "text",
//       "id": "7986854301445",
//       "text": "哈囉"
//     }
//   }]
// }

// [
//   {
//     "type": "postback",
//     "replyToken": "8ac478901b044eb586060e1e84c53cef",
//     "source": {
//       "userId": "U6ac46864e9646bd5bd954471f0060194",
//       "type": "user"
//     },
//     "timestamp": 1526787216000,
//     "postback": {
//       "data": "action=buy&itemid=111"
//     }
//   }
// ]
router.post('/webhooks', route.webhooks);

router.post('/post/push', route.push);

router.post('/post/control/message', route.controlMessage);

router.post('/message', route.message);

router.get('/test', route.test);

app
    .use(route.middleware)
    .use(router.routes());

// 因為 koa 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});
