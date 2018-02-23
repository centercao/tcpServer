/**
 * Created by center ON 17-12-29
 */
const routes = require("../middlewares/routesHelper");
module.exports = routes;

routes.use(3,async function (ctx,next) {
	var type =ctx.request.data.readUInt8(0);
	switch (type){
		case 1:
			console.log((new Date).format("yyyy-M-d h:m:s.S")  + " 收到网关注册回复");
			break;
		case 8:
			console.log((new Date).format("yyyy-M-d h:m:s.S")  + " 收到网关状态回复");
			
	}
});