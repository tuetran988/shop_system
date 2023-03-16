const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      //publicKey được sinh ra từ thuât toán bất đối xứng nên nó có dạng buffer vì thế khi lưu vào database gây ra lỗi
      //vì thế nên chuyển về dạng string
      const publicKeyString = publicKey.toString();
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      });
        return tokens ? tokens.publicKey : null
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
