const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
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
    static async checkoutReview({ cartId, userId, shop_order_ids = []}) {
        //kiểm tra cartId có tồn tại không ?
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exist')

        const checkout_order = {
            totalPrice: 0, // Tổng tiền hàng
            feeShip: 0, // phí vận chuyển
            totalDiscount: 0, // Tổng tiền được giảm giá
            totalCheckout:0 // Tổng thanh toán thực tế phải trả 
        },
            shop_order_ids_new = []
        
            //  tính tổng tiền bill
        for (let i = 0; i < shop_order_ids.length; i++){
            const { shopId, shop_discounts, item_products } = shop_order_ids[i];
            // kiểm tra sản phẩm có hợp lệ hay không
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkproductserver:::::`, checkProductServer)
            if (!checkProductServer[0]) throw new BadRequestError('order wrong!!!')

            // Tổng tiền đơn hàng đặt của 1 shop cụ thể 
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
            
            //Tổng tiền đơn hàng đặt của tất cả các shop khi chưa được áp mã giảm giá 
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tổng tiền trước khi được giảm giá
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            } // 1 đơn hàng của 1 shop cụ thể
            
            // nếu shop_discounts tồn tại > 0 tức là người dùng có áp mã giảm giá , check xem có hợp lệ không
            if (shop_discounts.length > 0) {
                // giả sử người dùng chỉ áp 1 mã giảm giá
                //get amount discount của 1 shop cụ thể
                const {totalPrice=0 , discount = 0} = await DiscountService.getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // tổng tất cả số tiền được giảm giá ở lần checkout này(tất cả các shop)
                checkout_order.totalDiscount += discount
                //nếu giảm giá > 0
                if (discount > 0) {
                    //tổng giá trị đơn sau khi đc áp mã giảm giá của 1 shop cụ thể 
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }              
            }
            // tổng thanh toán cuối cùng
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }
}

module.exports = CheckoutService;
