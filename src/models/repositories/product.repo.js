const { Types } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../utils");
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
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

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

//home page product
const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findProduct = async ({product_id , unSelect}) => { // select là lấy ra các trường , unselect là không lấy ra các trường vì details lấy rất nhiều trường nên viết vậy cho nhanh!
   return await product.findById(product_id).select(unGetSelectData(unSelect)); 
}


const updateProductById = async({
  productId,
  bodyUpdate,
  model,
  isNew = true
}) => {
   return await model.findByIdAndUpdate(productId , bodyUpdate , {new: isNew})
}

const getProductById = async (productId) => {
  return await product.findOne({
    _id: new Types.ObjectId(productId),
  }).lean();
}




module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
};
