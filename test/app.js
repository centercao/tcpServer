/**
 * Created by center ON 17-12-19
 */
const Cet = require("./middlewares/cetHelper");
const app = new Cet();
const routes = require("./routes/business");
const checkData = require("./middlewares/checkData");
Date.prototype.format = function (fmt) { //author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
};
// log
app.use(async function (ctx,next) {
	const start = new Date();
	try{
		// ctx.logger = logger;
		await next();
		/*if(ctx.response.info){
			const ms = new Date() - start;
			//记录请求日志
			// logger.debug(formatRes(ctx, ms));
		}*/
	}catch (error){
		const ms = new Date() - start;
		//错误信息开始
		// logger.error(formatError(ctx, error, ms));
	}
});
// 数据完整性分析
app.use(checkData());
 // format output
app.use(async function (ctx,next) {
	try {
		await next();
	}catch (error){
	
	}
});

function backFunc(err,data) {
	switch (err) {
		case "error": { // init fail
			console.log(data);
		}
			break;
		case "end": { // server end
			console.log(err);
			// cet.create(6000,"127.0.0.1",backFunc);
			// cet.send(new Buffer("abcd"));
		}
			break;
	}
}
app.create(6999, "127.0.0.1", backFunc);
// 业务处理
app.use(routes.route());
// 注册网关
var resBuffer = new Buffer(23);
resBuffer.writeUInt16BE(0xAA75,0); // header
resBuffer.writeUInt16BE(0x0,2); // cmd1
resBuffer.writeUInt16BE(17,4); // len
resBuffer.writeUInt8(1,6); // cmd2
resBuffer.write("BVvT5k5KqG8cLigR",7);
console.log((new Date).format("yyyy-M-d h:m:s.S")  + " 发送网关注册....");
app.send(resBuffer);
setTimeout(function () { // setInterval
	let buffer = new Buffer(50);
	buffer.writeUInt16BE(0xAA75,0); // header
	buffer.writeUInt16BE(0x0,2); // cmd1
	buffer.writeUInt16BE(3,4); // len
	buffer.writeUInt8(8,6); // cmd2
	buffer.writeUInt8(1,7);
	buffer.writeUInt8(1,8);

	buffer.writeUInt16BE(0xAA75,9); // header
	buffer.writeUInt16BE(0x0,11); // cmd1
	buffer.writeUInt16BE(3,13); // len
	buffer.writeUInt8(8,15); // cmd2
	buffer.writeUInt8(1,16);
	buffer.writeUInt8(1,17);
	
	buffer.writeUInt16BE(0xAA75,18); // header
	buffer.writeUInt16BE(0x0,20); // cmd1
	buffer.writeUInt16BE(3,22); // len
	buffer.writeUInt8(8,24); // cmd2
	buffer.writeUInt8(1,25);
	buffer.writeUInt8(1,26);

	buffer.writeUInt16BE(0xAA75,27); // header
	buffer.writeUInt16BE(0x0,29); // cmd1
	buffer.writeUInt16BE(17,31); // len
	buffer.writeUInt8(1,33); // cmd2
	buffer.write("BVvT5k5KqG8cLigR",34);
	console.log((new Date).format("yyyy-M-d h:m:s.S")  + " 发送网关状态....");
	app.send(buffer);
},100);
