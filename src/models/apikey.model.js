//có nhiệm vụ lưu trữ token

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENTS_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

var apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    }, // key api duoc general ra
    status: {
      type: Boolean,
      default: true,
    }, // status xem key nay duoc phep hoat dong hay khong
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENTS_NAME, apiKeySchema);

// khi chúng ta export mô hình backend thì nhiều nơi sẽ sử dụng
// vì thế chúng ta cung cấp cho nhiều người sử dụng khác nhau sử dụng key này
// key này được tạo ra bởi admin
//người dùng sẽ cầm key này add vào header của request và sau đó
// chúng ta verify nó nếu phù hợp trong database thì pass qua
