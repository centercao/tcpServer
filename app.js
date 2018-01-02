/**
 * Created by center ON 17-12-19
 */
const Cet = require("./middlewares/cetHelper");
var app = new Cet();
const routes = require("./middlewares/routesHelper");
const bussiness = require("./routes/bussiness");
const checkData = require("./middlewares/checkData");

// log
app.use(async function (ctx,next) {
	const start = new Date();
	try{
		// ctx.logger = logger;
		await next();
		if(ctx.status == 200){
			const ms = new Date() - start;
			//记录请求日志
			// logger.debug(formatRes(ctx, ms));
		}
	}catch (error){
		const ms = new Date() - start;
		//错误信息开始
		// logger.error(formatError(ctx, error, ms));
	}
});
// format output
app.use(async function (ctx,next) {
	try{
		await next();
		ctx.body = {
			status: ctx.status,
			name:"Reply",
			message: "success"
		};
	}catch (error){
		ctx.status = error.status ? 500 : ctx.status;
		ctx.body = {
			status: error.status ? error.status : ctx.status || 999,
			name:error.name?error.name:"SystemError",
			message: error.message,
			debug: error.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "")
		};
		throw error;
	}
});
app.use(checkData());
// check data
app.use(async function (ctx,next) {
	ctx.request.url = 1;
	await next();
	ctx.status = 200;
});
// routes
app.use(routes.route());
// 404
app.use(async function (ctx,next) {
	ctx.status = 404;
	throw new Error("请求的资源不存在...");
});

app.create(6000);