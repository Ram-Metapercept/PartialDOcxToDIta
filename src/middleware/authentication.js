const jwt = require('jsonwebtoken');
require("dotenv").config({ path: "./.env" });
const jwt_secret = process.env.JWT_SECRET

const authenticateToken = (req, res, next) => {
  const token = req?.headers?.token ||null

  if (!token) return res.status(401).json({ message: "Access denied, no token provided", status: 401 });

  try {
    const verified = jwt.verify(token, jwt_secret);

    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token", status: 400 });
  }
};

module.exports = authenticateToken;