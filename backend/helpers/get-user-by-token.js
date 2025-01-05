const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth");
const User = require("../models/User");

const getUserByToken = async (token) => {
  const decoded = jwt.verify(token, authConfig.secret);
  const userId = decoded.id;
  const user = await User.findOne({ _id: userId });
  return user;
};

module.exports = getUserByToken;
