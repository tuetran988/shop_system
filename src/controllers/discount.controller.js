const DiscountService = require("../services/discount.service");
const { SuccessResponse } = require("../core/success.response");
class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "create discount successfull",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

  getAllDiscountCodes = async (req, res, next) => {
    new SuccessResponse({
      message: "found discount successfull",
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
    };
    
  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "found discount successfull",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
    };
    
  getAllDiscountCodesWithProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "found all discount successfull",
      metadata: await DiscountService.getAllDiscountCodesWithProduct({
        ...req.query,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
