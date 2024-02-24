
const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  const token = req.header('x-token');

  // if (!token){
  //   return res.status(401).json({
  //     ok: false,
  //     message: "There is no token in the request.",
  //     translationKey: "no_token_in_request"
  //   });
  // }

  try {
    // const { uid, name } = jwt.verify(
    //   token,
    //   process.env.SECRET_JWT_SEED
    // );

    // req.uid = uid;
    // req.name = name;

    req.uid = "65d926131c1d403f4e37b1d7"
    req.name = "Oscar"

  } catch(error) {
    return res.status(401).json({
      ok: false,
      message: "Invalid token.",
      translationKey: "invalid_token"
    });
  }

  next();
}

module.exports = {
  validateJWT
}
