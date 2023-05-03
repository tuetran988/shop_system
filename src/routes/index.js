const express = require("express");
const router = express.Router();
const { apiKey, permission } = require("../auth/checkAuth");

//checkAPi key
router.use(apiKey)
//checkPermission - xem api key này có được quyền truy cập vào hệ thống hay không
router.use(permission('0000'));


router.use("/v1/api/product", require("./product"));
router.use("/v1/api/discount", require("./discount"));

router.use("/v1/api", require("./access"));

module.exports = router;
