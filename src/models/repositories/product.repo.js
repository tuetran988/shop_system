const { Types } = require("mongoose");
const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        $text: { $search: regexSearch },
    }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .lean()
    return results;
};

const queryProduct = async ({query ,limit, skip})=>{
    return await product
      .find(query)
      .populate("product_shop", "name email -_id")
      .sort({ updateAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec()
}


const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
    if (!foundShop) return null;
    // foundShop.isDraft = false;
    // foundShop.isPublished = true;
    // const {modifiedCount} = await foundShop.update(foundShop);  // return 1 | 0 when update or not
    // return modifiedCount;
    const { modifiedCount } = await product.updateOne(
      { _id: foundShop._id },
      { isDraft: false, isPublished: true }
    );
    return modifiedCount;
};
const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  const { modifiedCount } = await product.updateOne(
    { _id: foundShop._id },
    { isDraft: true, isPublished: false }
  );
  return modifiedCount;
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
};