const { inventory } = require("../inventory.model");
const { Types } = require("mongoose");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unKnow",
}) => {
  return await inventory.create({
    inven_productId: productId,
    inven_location: location,
    inven_stock: stock,
    inven_shopId: shopId,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inven_productId: new Types.ObjectId(productId),
    inven_stock: { $gte: quantity }, // so luong ton kho phai lon hon hoac bang so luong khach hang mua
  };
  updateSet = {
    $inc: {
      inven_stock: -quantity,
    },
    $push: {
      inven_reservations: {
        quantity,
        cartId,
        createOn: new Date()
      }
    },
    options = {upsert: true , new: true}
  };

  return await inventory.updateOne(query , updateSet )
};

module.exports = {
  insertInventory,
  reservationInventory
};
