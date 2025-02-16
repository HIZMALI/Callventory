const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Kullanıcı Girişi
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Kullanıcı bulunamadı." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Şifre yanlış." });

    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Admin Kullanıcı Oluşturma
(async () => {
  const existingAdmin = await User.findOne({ username: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("matiricie", 10);
    await User.create({ username: "admin", password: hashedPassword, role: "admin" });
    console.log("✅ Admin kullanıcı oluşturuldu!");
  }
})();

module.exports = router;
