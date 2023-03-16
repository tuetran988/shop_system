const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
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
        return {
          code: "xxxx",
          message: "Shop already registed",
        };
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        role: RoleShop.SHOP,
      });
      if (newShop) {
        //created privateKey and publicKey
        // privateKey là khi tạo xong sẽ đẩy về cho người dùng chứ không lưu ở hệ thống - dùng trong sign token
        // publicKey thì lưu ở hệ thống dùng để verify token
        // giảm sự rủi ro khi hacker tấn công và lấy đi 2 key trên

        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1", //Public key cryptography standards
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        }); //sử dụng thuật toán bất đối xứng
        console.log("show two key", { privateKey, publicKey }); // save to collection KeyStore
        // => ĐÂY LÀ CÁCH CHỈ SỬ DỤNG CHO HỆ THỐNG LỚN VÌ THẾ ĐỂ ĐƠN GIẢN THÌ THEO PHƯƠNG ÁN DƯỚI ĐÂY:

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });
        if (!publicKeyString) {
          return {
            code: "xxxx",
            message: "publicKey error",
          };
        }
        // Lúc này sau khi lấy từ DB ra thì publicKeyString có dạng là string
        const publicKeyObject = crypto.createPublicKey(publicKeyString);

        // nếu thành công trong việc đăng kí và tạo key thì sẽ trả về token cho client
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyObject,
          privateKey
        );
        console.log(`Created token success:::: ${tokens}`);
        return {
          code: 201,
          metadata: {
            shop: getInfoData([
              { fields: ["_id", "name", "email"], object: newShop },
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
}

module.exports = AccessService;
