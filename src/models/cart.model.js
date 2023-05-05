const { model, Schema } = require("mongoose");

const DOCUMENTS_NAME = "Cart";
const COLLECTION_NAME = "Carts";

var cartSchema = new Schema(
    {
        cart_state: {
            type: String,
            required: true,
            enum: ['active', 'completed', 'failed', 'pending'],
            default: 'active'
        },
        cart_products: {
            type: Array,
            required: true,
            default: []
        },
        cart_count_product: {
            type: Number,
            default: 0
        },
        cart_userId: {
            type: Number,
            required: true,
        }
    },
    {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'modifiedOn'
        }
    }
);

module.exports = {
    cart: model(DOCUMENTS_NAME, cartSchema)
}
