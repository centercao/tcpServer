/**
 * Created by Center on 2017/4/1.
 */
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
const G_HEAD = 0xAA75;
module.exports = function() {
	return async function (ctx,next) {
		console.log((new Date).format("yyyy-M-d h:m:s.S ") +"收到数据包...");
		console.log(ctx.request.dataBuffers);
		if(!ctx.request.state){
			if(ctx.request.rvLen >= 6){
				let buffer = Buffer.concat(ctx.request.dataBuffers, 6);
				let dHead = buffer.readUInt16BE(0);
				if(G_HEAD != dHead){
					throw new Error("数据头错误");
				}
				ctx.request.cmd = buffer.readUInt16BE(2); // cmd
				ctx.request.dataLen = buffer.readUInt16BE(4);
				ctx.request.state = true;
			}else{
				ctx.request.isContinue = 0;
			}
		}
		if(ctx.request.state){
			if(ctx.request.rvLen >= ctx.request.dataLen + 6){ // 数据完整
				ctx.request.state = false;
				var buffer = Buffer.concat(ctx.request.dataBuffers);
				ctx.request.data = buffer.slice(6,ctx.request.dataLen + 6);
				await next();
				ctx.request.rvLen = ctx.request.rvLen - ctx.request.dataLen -6; // 10 header
				ctx.request.dataBuffers .length = 0;
				if(ctx.request.rvLen > 0){
					ctx.request.dataBuffers.push(buffer.slice(ctx.request.dataLen + 6));
					if(ctx.ctx.request.rvLen >= 6 ){
						ctx.request.isContinue = 1;
					}else{
						ctx.request.isContinue = 0;
					}
					// ctx.cet.trigger(ctx);
				}
			}else{
				ctx.request.isContinue = 0;
			}
		}
	};
};
