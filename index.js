/**
 * Created by center ON 18-2-10
 */
const  NetServer = require("./middlewares/tcpHelper").TcpServer;
const  routes = require("./middlewares/tcpHelper").Router;
const bus = require('./routes/business');
const app = new NetServer();
let dealFun = function (ctx,next) {
	console.log("dealFun:开始处理............buffers length:%d",ctx.data.length);
	return new Promise(function (resolve, rejec) {
		setTimeout(async function () {
			console.log("dealFun:处理ok........buffers length:%d",ctx.data.length);
			resolve("dealFun:ok");
			await next();
		},1000);
	});
};
app.use(async (ctx, next)=>{
	try{
		console.log("---格式化错误---");
		await next();
		return "ok...ok";
	}catch (e){
		console.log("error:",e);
	}
});
app.use(async (ctx, next)=>{
	console.log("dealFun:开始处理............buffers length:%d",ctx.data.length);
	return new Promise((resolve, reject) => {
		setTimeout(async ()=>{
			console.log("dealFun:处理ok........buffers length:%d",ctx.data.length);
			try{
				await next();
				resolve("dealFun:ok");
			}catch (e){
				reject("error");
				console.log("error:",e);
			}
		},1000);
	});
});
// 业务处理
app.use(routes.route());
app.create(6999);