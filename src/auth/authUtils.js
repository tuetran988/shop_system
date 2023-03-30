const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError,NotFoundError } = require("../core/error.response");
const KeyTokenService =  require("../services/keyToken.service");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID:'x-client-id',
  AUTHORIZATION: "authorization",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // create accesstoken and refreshToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify::::::${err}`);
      } else {
        console.log(`decode verify:::: ${decode}`);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  //step1  check userId missing???
  //step2 get accessToken
  // verify token
  // check User in db
  // check keyStore with this userId
  // ok all -> return next
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid Request');
  }
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError('Not Found key store');
  }
  //
  const accessToken = req.headers[HEADER.AUTHORIZATION];
   if (!accessToken) {
     throw new AuthFailureError("Invalid Request");
  }
  
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid userId");
    }
    req.keyStore = keyStore;
    return next()
  } catch (error) {
      throw error
  }
});

const verifyJWT = async(token,keySecret) => {
      return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
};
