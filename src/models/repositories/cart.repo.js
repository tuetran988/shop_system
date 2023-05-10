const { Types } = require("mongoose");
const { cart } = require("../cart.model");

const findCartById = async (cartId) => {
  return await cart.findOne({
    _id: new Types.ObjectId(cartId),
    cart_state: "active",
  }).lean();
};

module.exports = {
  findCartById,
};
