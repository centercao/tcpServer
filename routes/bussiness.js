/**
 * Created by center ON 17-12-19
 */
var router = require("../middlewares/routesHelper");
const REGISTER = 1;
router.use(REGISTER,async function () {
	console.log("abcd");
});


module.exports = router;