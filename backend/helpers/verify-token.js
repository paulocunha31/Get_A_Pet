const jwt = require("jsonwebtoken");
const getToken = require("./get-token");
const authConfig = require("../config/auth");

const ckeckToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  try {
    const verified = jwt.verify(token, authConfig.secret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Token inválido!" });
  }
};

module.exports = ckeckToken;
