const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT  } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { findByEmail } = require("./shop.service");

const {
  BadRequestError,
  ForbiddenError,
  AuthFailureError
} = require("../core/error.response");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      //step1 check email exist
      const hodelShop = await shopModel.findOne({ email }).lean(); //.lean() giúp lấy về 1 object thuần túy giám tải nhiều hơn
      if (!!hodelShop) {
        throw new BadRequestError("Error: shop already registered!");
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        role: RoleShop.SHOP,
      });
      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });
        if (!keyStore) {
          return {
            code: "xxxx",
            message: "keyStore error",
          };
        }
        // nếu thành công trong việc đăng kí và tạo key thì sẽ trả về token cho client
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        console.log(`Created token success:::: ${tokens}`);
        return {
          code: 201,
          metadata: {
            shop: getInfoData([
              { fields: ["_id", "name", "email"], object: newShop }, //sử dung lodash chỉ lấy những trường như vậy
            ]),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxxx",
        message: error.message,
        status: "error",
      };
    }
  };

  static login = async ({ email, password, refreshToken = null }) => {
    // check email in dbs
    // match password
    // create accesstoken and refreshToken
    //generate token
    //get data return login
    //step1
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop is not registered");
    }
    //step2
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authen Error ");
    }
    //step3
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    //step4
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData([
        { fields: ["_id", "name", "email"], object: foundShop }, //sử dung lodash chỉ lấy những trường như vậy
      ]),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };
  static handlerRefreshToken = async (refreshToken)=>{
    // refreshTokensUsed
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    console.log(`foundToken`, foundToken);
    if (foundToken) {
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
      console.log(`{ userId, email }::::`, { userId, email })
      // await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenError('something wrong happend')
    }
    //
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    if (!holderToken) throw new AuthFailureError('shop not register 1')
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
    const foundShop = await findByEmail({email})
    if (!foundShop) throw new AuthFailureError('shop not register 2')

    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken
      }
    })

    return {
      user: { userId, email },
      tokens
    }
  }
}

module.exports = AccessService;
