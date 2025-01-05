const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");

const createUserToken = async (user, req, res) => {
  // create a token
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn }
  );

  // return token
  res.status(200).json({
    message: "You are authenticated!",
    token,
    userId: user._id,
  });
};

module.exports = createUserToken;
