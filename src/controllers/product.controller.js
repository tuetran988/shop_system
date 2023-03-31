const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");
class ProductController {
    createProduct = async (req, res, next) => {
      console.log(`tuetrantest`,req.user)
    new SuccessResponse({
      message: "create new product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user?.userId, // lay dc id cua shop tu token o middware authen truyen qua
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
