const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const render = require('koa-swig');
const co = require('co');
const dotenv = require('dotenv').load();

const app = new koa();
const router = Router();

app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(router.routes());

app.context.render = co.wrap(render({
  root: __dirname + '/public/views',
  autoescape: true,
  cache: 'memory',
  ext: 'html',
}));

router.get('/',async (ctx) => {
  ctx.body = 'Hello Koa';
});

// //因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
var port = server.address().port;
  console.log("App now running on port", port);
});
