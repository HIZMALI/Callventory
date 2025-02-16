const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Erişim reddedildi. Token bulunamadı." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz token." });
  }
};

const authorize = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) return res.status(403).json({ message: "Yetkiniz yok." });
  next();
};

module.exports = { authenticate, authorize };
