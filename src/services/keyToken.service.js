const keyTokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");
const { ObjectId } = require("mongodb");
class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey ,refreshToken}) => {
    try {
      //level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens.publicKey : null;

      //level xx
      const filter = { user: userId }
      const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }
      const options = {upsert: true , new: true}
      const tokens = await keyTokenModel.findOneAndUpdate(filter, update,options);
      return tokens ? tokens.publicKey : null;

    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({ user: new ObjectId(userId) }).lean();
  }
  static removeKeyById = async (id) => {
     return await keyTokenModel.deleteMany({ _id: id });
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken})
  }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.findByIdAndDelete({user:userId})
  }
  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken})
  }
  
}

module.exports = KeyTokenService;
