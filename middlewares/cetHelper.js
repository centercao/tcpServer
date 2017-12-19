/**
 * Created by center ON 17-12-19
 */
var net = require('net');

function Context(socket,cet) {
	// 基本数据
	this.cet = cet;
	this.socket = socket;
	// 请求响应
	this.request = {}; // 请求结构
	this.response = {};// 响应结构
	this.status = 404;
	this.request.url = -1;
	// 辅助数据
	this.request.dataBuffers = [];
	var that = this;
	// 错误事件监听
	this.socket.on('error', function(e) {
		console.log("socket error:" + e);
		that.socket.destroy();
	});
	// 关闭事件监听
	this.socket.on('close', function(e) {
		if(e){
			console.log("Client  accidentally closed!");
			that.socket.destroy();
		}else {
			console.log("Client  closed!");
		}
	});
	// receive data
	this.socket.on('data', function(data) {
		that.status = 404;
		that.request.dataBuffers.push(data);
		// 激发中间件处理接收到的数据
		that.cet.trigger(that);
	});
}
Context.prototype = {
	send:function (buffer) {
		return this.socket.write(buffer);
	},
	close:function () {
		this.socket.end();
	}
};
function cet() {
	this.middleware = [];
	this.server = null;
}
Array.prototype.remove = function(val) {
	for(var i=0; i<this.length; i++) {
		if(this[i] == val) {
			this.splice(i, 1);
			break;
		}
	}
}

cet.prototype = {
	trigger: async function (ctx){
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
	create:function(port){
		this.server = net.createServer();
		var that = this;
		this.server.on('error', function(e) {
			console.log("cet error:" + e);
		});
		this.server.on('close', function(e) {
			console.log("cet close:" + e);
		});
		this.server.listen(port, function(e){
		});
		// connection:
		this.server.on('connection', function(socket) {
			console.log('a connection: ' + socket.remoteAddress + ':' + socket.remotePort);
			// socket.setKeepAlive(true);
			new Context(socket,that);
		});
		return this;
	},
	close:function(){
		if(!this.server ){
			return;
		}
		this.server.close();
	}
};
module.exports = cet;