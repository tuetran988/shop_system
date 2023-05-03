/*
    Discount Service
    1- generator discount code [shop|admin]
    2- get discount amount [user]
    3- get all discount codes [user|shop]
    4- verify discount code [user]
    5- delete discount code [Admin|shop]
    6- cancel discount code [user]
*/
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");

const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");

const {
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");

const { Types } = require("mongoose");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      user_used,
    } = payload;
    //kiemtra
    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError("discount code has expired !!!");
    // }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("startdate must before end date");
    }

    //create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: new Types.ObjectId(shopId),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active == true) {
      throw new BadRequestError("discount code exist");
    }
    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: user_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });
    return newDiscount;
  }
  static async updateDiscountCode() {
    //...
  }
  /*
        get all discount code available with products
    */
  static async getAllDiscountCodesWithProduct({
    // lấy các sản phẩm thuộc discountcode này!
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    //create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: new Types.ObjectId(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("discount not exist!");
    }
    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to == "all") {
      //get all product
      products = await findAllProducts({
        filter: {
          product_shop: new Types.ObjectId(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    if (discount_applies_to == "specific") {
      //get the productids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    console.log(`tuetest`, products);
    return products;
  }

  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: new Types.ObjectId(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });
    return discounts;
  }

  /* apply discount code
   products = [
      {
        productId,
        shopId,
        quantity,
        name, price
      } mang theo cac san pham trong gio hang khi dat hang
   ]
*/
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: new Types.ObjectId(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError("discount doesnt exist");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError("discount expired");
    if (!discount_max_uses) throw new NotFoundError("discount are out");
    // if (
    //   new Date() < new Date(discount_start_date) ||
    //   new Date() > new Date(discount_end_date)
    // )
    //   throw new NotFoundError("discount expired");
    // check xem co xet gia tri toi thieu cua don hang hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total cua gio hang
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError("discount required minium order values !");
      }
    }
    if (discount_max_uses_per_user > 0) {
      const userUseDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUseDiscount) {
      }
    }
    //check xem discount nay la fixamount hay percentage
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongoDb(shopId),
    });
    return deleted;
  }

  //usercancel discount = nguoi dung deo dung ma giam gia nay nua
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDb(shopId),
      },
    });
    if (!foundDiscount) throw new NotFoundError(`discount doesnt exist`);

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_users_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
