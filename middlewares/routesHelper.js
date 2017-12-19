/**
 * Created by center ON 17-12-19
 */
var middleware = [];
var Routes ={
	route: function (){ // 路由处理,加入Cet
		return async function (ctx,next) {
			for(var i = 0;i< middleware.length;i++){
				if(ctx.request.url == middleware[i].url){
					await middleware[i].func(ctx,next);
					return;
				}
			}
			await next();
		};
	},
	use:function (url,func) { // 加入Routes
		let route = {};
		route.url = url;
		route.func = func;
		middleware.push(route);
	}
};
module.exports = Routes;