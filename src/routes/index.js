const express = require("express");
const router = express.Router();
const { apiKey, permission } = require("../auth/checkAuth");

//checkAPi key
router.use(apiKey)
//checkPermission - xem api key này có được quyền truy cập vào hệ thống hay không
router.use(permission('0000'));



router.use("/v1/api", require("./access"));
router.use("/v1/api/product", require("./product"));

module.exports = router;
