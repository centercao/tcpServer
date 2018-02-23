/**
 * Created by center ON 17-12-19
 */
const net = require('net');
Array.prototype.remove = function(val) {
	for(var i=0; i<this.length; i++) {
		if(this[i] == val) {
			this.splice(i, 1);
			break;
		}
	}
};
function context(socket,cet) {
	this.request = {}; // 请求结构
	this.request.rvLen = 0;
	this.request.cmd = -1;
	this.request.dataLen = 0;
	this.request.state = false;
	this.request.isContinue = 0;
	this.response = {};// 响应结构
	this.request.dataBuffers = [];
}
function cet() {
	this.middleware = [];
	this.socket = null;
	this.request = {}; // 请求结构
	this.request.rvLen = 0;
	this.request.cmd = -1;
	this.request.dataLen = 0;
	this.request.state = false;
	this.response = {};// 响应结构
	this.request.dataBuffers = [];
}
cet.prototype = {
	trigger: async function (ctx){ // 收到数据调用中间件
		var that = this;
		var n = 0;
		var next = async function () {
			if(that.middleware[n]){
				await that.middleware[n++](ctx,next);
			}
		};
		await next();
	},
	use:function (func) {
		this.middleware.push(func);
	},
	close:function () {
		this.socket.end();
	},
	send:function(data){
		this.socket.write(data);
	},
	create:function (port,host,backFunc) {
		this.socket = new net.Socket();
		this.socket.on('error', function (e) { // 连接被拒绝
			backFunc("error",e);
		});
		// close always ,server or client end
		this.socket.on('close', function () { // socket关闭
			backFunc("close");
		});
		// server disconnected
		this.socket.on('end', function () {
			backFunc("end");
		});
		// Receive
		var that = this;
		function dealData(that) {
			// 激发中间件处理接收到的数据
			that.trigger(that).then(function () {
				if(that.response.data){ // 中间件处理完毕需要发送响应的请填写响应数据
					that.send(that.response.data); // 发送响应数据
					that.response = {}; // 初始化响应
				}
				if(that.request.rvLen > 0 && that.request.isContinue > 0){
					dealData(that);
				}
			}).catch(function (err) {
				console.log("error:"  + err.message);
				that.close();
			});
		}
		this.socket.on('data', function (data) {
			that.request.dataBuffers.push(data);
			that.request.rvLen += data.length;
			// 激发中间件处理接收到的数据
			dealData(that);
		});
		this.socket.connect(port, host,function () {
			console.log('CONNECTED TO: ' + host + ':' + port);
		});
	}
};
module.exports = cet;
