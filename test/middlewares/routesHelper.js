/**
 * Created by center ON 17-12-19
 */
var middleware = [];
var Routes ={
	route: function (){ // 路由处理,加入Cet
		return async function (ctx,next) {
			for(var i = 0;i< middleware.length;i++){
				if(ctx.request.cmd == middleware[i].cmd){
					await middleware[i].func(ctx,next);
					return;
				}
			}
			let error = new Error("服务器找不到请求的资源");
			error.number = 404;
			throw error;
		};
	},
	use:function (cmd,func) { // 加入Routes
		let route = {};
		route.cmd = cmd;
		route.func = func;
		middleware.push(route);
	}
};
module.exports = Routes;