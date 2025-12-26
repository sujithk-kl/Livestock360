const jwtUtil = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "No token provided" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwtUtil.verifyToken(token);
    req.farmerId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
