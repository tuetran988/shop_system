// có nhiệm vụ lưu lại idUser, publicKey , refreshToken...
const { Schema, model } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";
// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    inven_productId: { type: Schema.Types.ObjectId, ref: "Product" },
    inven_location: { type: String, default: "unKnow" },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    inven_reservations: { type: Array, default: [] },
    /*
        khi người ta đặt hàng thêm vào giỏ hàng thì chúng ta sẽ lưu trữ dữ liệu vào trong 
        mảng kia thì khi đó số lượng hàng tồn kho sẽ bị trừ đi 
        khi nào khách hàng đã thanh toán xong thì sẽ xóa đặt hàng trong mảng đi 
        trong đó sẽ lưu số lượng mua , cardID ....
    */
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = {
  inventory: model(DOCUMENT_NAME, inventorySchema),
};
