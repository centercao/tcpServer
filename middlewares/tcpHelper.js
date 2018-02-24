/**
 * Created by center ON 18-2-10
 */
const Net = require('net');
const G_HEAD = 0xAA75;
let Context = function (connect) {
	this.cmd = 0;
	this.data = null;
	this.connect = connect;
	
};
Context.prototype = {
	send:function (buffer) {
		return this.socket.write(buffer);
	}
};
let Connect = function (socket,server,port) {
	this.port = port;
	this.socket = socket;
	this.rvLen = 0;
	this.tcpServer = server;
	this.dataPool = [];
	this.header = true;
	// 错误事件监听
	this.socket.on('error', function(e) {
		console.log("socket error:" + e);
	});
	// 关闭事件监听
	this.socket.on('close', (e) => {
		if(e){
			console.log("Client  accidentally closed!");
			this.socket.destroy();
		}else {
			console.log("server close the Client!");
		}
	});
	this.socket.on('data', async (data)  =>{
		this.dataPool.push(data);
		this.rvLen += data.length;
		console.log("on data:%d:收到数据,dataPool length:%d...",this.port,this.dataPool.length);
		this.transform();
		console.log("on data:%d:数据处理完成!",this.port);
	});
};
Connect.prototype = {
	transform:async function () {
		if(this.header){
			if(this.rvLen > 6){
				let buffer = Buffer.concat(this.dataPool,6);
				let dHead = buffer.readUInt16BE(0);
				if(G_HEAD != dHead){
					console.log("+++++++NetServer:数据头错误.+++++++++++++");
					console.log(buffer);
					let temBuffer = Buffer.concat(this.dataPool);
					console.log("长度:" +temBuffer.length);
					console.log(temBuffer);
					this.socket.destroy();
					console.log("数据头错误");
					return;
				}
				this.cmd = buffer.readUInt16BE(2); // cmd
				this.dataLen = buffer.readUInt16BE(4);
				this.header = false;
			}
		}
		if(!this.header){
			if(this.rvLen >= this.dataLen + 6){ // 数据完整
				this.header = true;
				var buffer = Buffer.concat(this.dataPool);
				let ctx = new Context(this);
				ctx.cmd = this.cmd;
				ctx.data = buffer.slice(6,this.dataLen + 6);
				this.rvLen = this.rvLen - this.dataLen -6; // 10 header
				this.dataPool.length = 0;
				if(this.rvLen > 0){
					this.dataPool.push(buffer.slice(this.dataLen + 6));
					await this.tcpServer.trigger(ctx);
					this.transform();
				}else{
					await this.tcpServer.trigger(ctx);
				}
				
			}
		}
	}
};
var middlewares = new Map();
var Router ={
	route: function (){
		return async function (ctx,next) {
			let func = middlewares.get(ctx.cmd);
			if(func){
				return await func(ctx,next);
			}
			let error = new Error("服务器找不到请求的资源");
			error.number = 404;
			throw error;
		};
	},
	use:function (cmd,func) {
		middlewares.set(cmd,func);
	}
};
let TcpServer = function () {
	this.server = null;
	this.middlewares = [];
	
};
TcpServer.prototype = {
	trigger:async function (ctx) {
		let n = 0;
		let next = async  () => {
			if(this.middlewares[n]){
			let res =	await this.middlewares[n++](ctx,next);
			console.log("trigger:数据处理结果:%s...",res);
			}
		};
		return await next();
	},
	use:function (func) {
		this.middlewares.push(func);
	},
	create:function (port) {
		this.server = Net.createServer();
		if(!this.server)
		{
			return null;
		}
		this.server.on('error', function(e) {
			console.log("tcpServer error:" + e);
		});
		this.server.on('close', function(e) {
			console.log("tcpServer close:" + e);
		});
		this.server.listen(port, function(e){
			if(e){
				console.log("tcpServer error: %s",e.message);
			}else{
				console.log("tcpServer listen port:%d",port);
			}
		});
		// connection:
		this.server.on('connection', (socket) => {
			console.log('Connection: ' + socket.remoteAddress + ':' + socket.remotePort);
			new Connect(socket,this,socket.remotePort);
		});
	}
};
module.exports = {
	TcpServer:TcpServer,
	Router:Router};