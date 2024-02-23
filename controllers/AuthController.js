const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/jwt');

const login = async(req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status (400).json({
        ok: false,
        message: "Invalid credentials",
        translationKey: "invalid_credentials"
      });
    }

    const validPassword = bcrypt.compareSync( password, user.password );

    if (!validPassword) {
      return res.status (400).json({
        ok: false,
        message: 'Invalid credentials',
        translationKey: "invalid_credentials"
      });
    }

    const token = await generateJWT( user.id, user.name);

    res.json({
      ok: true,
      uid: user.id,
      name: user.name,
      token,
      translationKey: "login_success"
    });
  }
  catch(error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: 'Please talk to the administrator',
      translationKey: "talk_to_admin"
    });
  }
}

const createUser = async(req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status (400).json({
        ok: false,
        message: 'A user already exists with that email',
        translationKey: "user_already_exists"
      });
    }

    user = new User(req.body);

    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync( user.password, salt);

    await user.save();

    const token = await generateJWT( user.id, user.name);

    res.status(201).json({
      ok: true,
      uid: user.id,
      name: user.name,
      token,
      translationKey: "user_created_successfully"
    });
  }
  catch(error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: 'Please talk to the administrator',
      translationKey: "talk_to_admin"
    });
  }
}

const refreshToken = async(req, res) => {
  const uid = req.uid;
  const name = req.name;

  const token = await generateJWT( uid, name );

  res.json({
    ok: true,
    uid,
    name,
    token,
    translationKey: "token_refreshed"
  });
}

module.exports = {
  login,
  createUser,
  refreshToken
}
