const koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const serve = require('koa-static');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const render = require('koa-swig');
const co = require('co');

const app = new koa();
const router = Router();


app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(serve(__dirname+'/public/img'));
app.use(serve(__dirname+'/public/css'));
app.use(serve(__dirname+'/public/script'));
app.use(router.routes());

app.context.render = co.wrap(render({
  root: __dirname + '/public/views',
  autoescape: true,
  cache: 'memory',
  ext: 'html',
}));

router.get('/',index);
router.get('/test',test);
router.get('/pie',pie);

async function index(ctx){
  ctx.body = await ctx.render('smart');
}

async function test(ctx){
  ctx.body = await ctx.render('test');
}

async function pie(ctx){
  ctx.body = await ctx.render('pie');
}

app.listen(3000);
