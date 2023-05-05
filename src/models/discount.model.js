const { model, Schema } = require("mongoose");

const DOCUMENTS_NAME = "Discount";
const COLLECTION_NAME = "discounts";

var discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: { type: String, default: "fixed_amount" }, // fixed_amount tức là giảm giá bằng số tiền cụ thể còn percent tức là giảm giá theo %
    discount_value: { type: Number, required: true }, // số tiền giảm 10.000 || 10%
    discount_code: { type: String, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, // số lượng discount được áp dụng
    discount_uses_count: { type: Number, required: true }, //số discount đã được sử dụng
    discount_users_used: { type: Array, default: [] }, //ai đã sử dụng discount này
    discount_max_uses_per_user: { type: Number, required: true }, // số lượng cho phép tối đa đc sử dụng trên mỗi user
    discount_min_order_value: { type: Number, required: true }, // giá trị đơn hàng tối thiểu được áp dụng
    discount_max_value: { type: Number, required: true }, 
    discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: { type: String, required: true, enum: ['all', 'specific'] },
    discount_product_ids: { type: Array, default: [] } // các sản phẩm được phép áp dụng mã giảm giá này 
    
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENTS_NAME, discountSchema);
