const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require("../models/order.model");

const DiscountService = require("./discount.service");
class CheckoutService {
  /*
   cấu trúc của 1 checkout :
     shop_order_ids :  gồm id của 1 shop cụ thể và 1 mảng các sản phẩm có thể có nhiều sản phẩm  được mua từ shop đó
        {
        cartId,
        userId,
        shop_order_ids:[
            {
                shopId, // id shop
                shop_discounts:[], // tất cả các mã giảm giá được apply cho đơn hàng
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    } // thông tin 1 sản phẩm cụ thể được đặt ở shop - có thể có nhiều sản phẩm như vậy
                ],
            }, // các sản phẩm được đặt hàng từ 1 shop cụ thể có thể có nhiều shop được đặt như vậy
             {
                shopId,
                shop_discounts:[
                 {
                    "shopId",
                    "discountId",
                     codeId
                 }
                ],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    }
                ],
            },
        ],
        }
    */
  static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
    //kiểm tra cartId có tồn tại không ?
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestError("Cart does not exist");

    const checkout_order = {
        totalPrice: 0, // Tổng tiền hàng
        feeShip: 0, // phí vận chuyển
        totalDiscount: 0, // Tổng tiền được giảm giá
        totalCheckout: 0, // Tổng thanh toán thực tế phải trả
      },
      shop_order_ids_new = [];

    //  tính tổng tiền bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, shop_discounts, item_products } = shop_order_ids[i];
      // kiểm tra sản phẩm có hợp lệ hay không
      const checkProductServer = await checkProductByServer(item_products);
      console.log(`checkproductserver:::::`, checkProductServer);
      if (!checkProductServer[0]) throw new BadRequestError("order wrong!!!");

      // Tổng tiền đơn hàng đặt của 1 shop cụ thể
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      //Tổng tiền đơn hàng đặt của tất cả các shop khi chưa được áp mã giảm giá
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tổng tiền trước khi được giảm giá
        priceApplyDiscount: checkoutPrice,
        item_products: checkProductServer,
      }; // 1 đơn hàng của 1 shop cụ thể

      // nếu shop_discounts tồn tại > 0 tức là người dùng có áp mã giảm giá , check xem có hợp lệ không
      if (shop_discounts.length > 0) {
        // giả sử người dùng chỉ áp 1 mã giảm giá
        //get amount discount của 1 shop cụ thể
        const {
          totalPrice = 0,
          discount = 0,
        } = await DiscountService.getDiscountAmount({
          codeId: shop_discounts[0].codeId,
          userId,
          shopId,
          products: checkProductServer,
        });
        // tổng tất cả số tiền được giảm giá ở lần checkout này(tất cả các shop)
        checkout_order.totalDiscount += discount;
        //nếu giảm giá > 0
        if (discount > 0) {
          //tổng giá trị đơn sau khi đc áp mã giảm giá của 1 shop cụ thể
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }
      // tổng thanh toán cuối cùng
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  //order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const {
      shop_order_ids_new,
      checkout_order,
    } = await CheckoutService.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });

    //check lại 1 lần nữa xem có vượt tồn kho hay không
    //get new array product
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    //check lai neu co 1 san pham het hang trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Some product has been updated , please back to your cart"
      );
    }
    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // case : neu insert thanh cong thi remove product co trong cart
    if (newOrder) {
      // remove product in my cart
    }

    return newOrder;
  }

  /*
    query order [users]
    user se lay tong don hang hien tai co
  */

  static async getOrdersByUser() {}
  /*
    query order using id [users]
  */
  static async getOneOrderByUser() {}
  /*
    cancel order [users]
  */
  static async cancelOrderByUser() {}
  /*
    update order status [shop|admin]
  */
  static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
