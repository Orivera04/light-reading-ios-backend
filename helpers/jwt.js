const jwt = require('jsonwebtoken');

const generateJWT = ( uid, name ) => {
  return new Promise( (resolve, reject) => {
    const payload = { uid, name };

    jwt.sign(payload, process.env.SECRET_JWT_SEED, {
      expiresIn: '7d'
    }, (err, token) => {
      if (err) {
        console.log(err);
        reject('There was an error generating the token.');
      } else {
        resolve(token);
      }
    });
  });
}

module.exports = {
  generateJWT
}
