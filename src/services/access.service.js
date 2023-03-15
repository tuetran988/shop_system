const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
      const passwordHash = bcrypt.hash(password, 10);

      const newShop = await shopModel.create( {
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
        const {privateKey,publicKey} = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096
        }) //sử dụng thuật toán bất đối xứng
        console.log({ privateKey, publicKey }); // save to collection KeyStore
      }
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
