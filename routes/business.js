/**
 * Created by center ON 18-2-23
 */
const  routes = require("../middlewares/tcpHelper").Router;
routes.use(0, async function (ctx, next) {
	return "businiss ok";
});