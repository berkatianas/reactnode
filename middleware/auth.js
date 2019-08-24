const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  // Get Tocken from Header (of postman)
  const token = req.header("x-auth-token");

  // Check if no Token
  if (!token) {
    return res.status(401).json({ msg: "No Token!!" });
  }

  // Verifier Token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token Invalide :/" });
  }
};
