const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Bağlantısı
mongoose.connect("mongodb://127.0.0.1:27017/callcenter_inventory", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB bağlantısı başarılı!"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

// İlk çalıştırma için Uploads klasörü oluşturma
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static("uploads"));

// Kullanıcı Modeli
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
});
const User = mongoose.model("User", userSchema);

// Admin ve Kullanıcıları Ekleme
(async () => {
  const users = [
    { username: "admin", password: "matiricie", role: "admin" }, // Respect for Matiricie ;)
    { username: "Mert", password: "matiricie", role: "user" }, // Respect for Matiricie ;)
    { username: "Beril", password: "matiricie", role: "user" } // Respect for Matiricie ;)
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ username: user.username });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({ username: user.username, password: hashedPassword, role: user.role });
      console.log(`✅ Kullanıcı eklendi: ${user.username} (${user.role})`);
    }
  }
})();

// Demirbaş Modeli
const deviceSchema = new mongoose.Schema({
  deviceName: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  owner: { type: String, required: true },
  campus: { type: String, required: true },
  floor: { type: String, required: true },
  warrantyEndDate: { type: String, required: true },
  maintenanceSchedule: { type: String, required: true },
  purchaseDate: { type: String, default: null },
  invoiceNumber: { type: String, default: null },
  cost: { type: Number, default: null },
  supplier: { type: String, default: null },
  depreciationPeriod: { type: Number, default: null },
  maintenanceContract: { type: String, default: null },
  warrantyDocument: { type: String, default: null },
  hardwareSpecs: { type: String, default: null },
  softwareInfo: { type: String, default: null },
  connectionType: { type: String, default: null },
  status: { type: String, default: "Aktif" },
  lastUsageDate: { type: String, default: null },
  notes: { type: String, default: null },
  productImages: { type: [String], default: [] },
  technicalDocuments: { type: [String], default: [] }
});
const Device = mongoose.model("Device", deviceSchema);

// Dump Admin
(async () => {
  const existingAdmin = await User.findOne({ username: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("matiricie", 10);
    await User.create({ username: "admin", password: hashedPassword });
    console.log("✅ Admin kullanıcı başarıyla oluşturuldu!");
  } else {
    console.log("ℹ️ Admin kullanıcı zaten mevcut.");
  }
})();

// 📌 Kullanıcı Girişi API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Giriş başarısız! Kullanıcı adı veya şifre yanlış." });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Giriş başarısız! Kullanıcı adı veya şifre yanlış." });
    const token = jwt.sign({ username, role: user.role }, "SECRET_KEY", { expiresIn: "1h" });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("❌ Giriş API hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// 📌 Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
      return res.status(401).json({ message: "Erişim reddedildi. Token bulunamadı." });
  }
  try {
      const decoded = jwt.verify(token, "SECRET_KEY");
      req.user = decoded;
      next();
  } catch (err) {
      return res.status(401).json({ message: "Geçersiz token." });
  }
};

// 📌 Authorization Middleware (Admin için)
const authorize = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Yetkiniz yok." });
  }
  next();
};

// Dosya Yüklemesi
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Cihaz Ekleme API
app.post("/api/devices", upload.fields([
  { name: "productImages", maxCount: 5 },
  { name: "technicalDocuments", maxCount: 3 }
]), async (req, res) => {
  try {
    console.log("Yeni cihaz ekleme isteği alındı.");
    const { body, files } = req;
    const existingDevice = await Device.findOne({ serialNumber: body.serialNumber });
    if (existingDevice) {
      console.log("❌ Hata: Seri numarası zaten mevcut!", body.serialNumber);
      return res.status(400).json({ message: "Bu seri numarası zaten kullanılıyor." });
    }
    const newDevice = new Device({
      ...body,
      productImages: files?.["productImages"] ? files["productImages"].map(f => f.path) : [],
      technicalDocuments: files?.["technicalDocuments"] ? files["technicalDocuments"].map(f => f.path) : []
    });
    await newDevice.save();
    await saveLog(`🆕 Yeni cihaz eklendi: ${newDevice.deviceName} (${newDevice.brand} - ${newDevice.model})`);
    console.log("✅ Cihaz başarıyla kaydedildi:", newDevice);
    res.status(201).json({ message: "Cihaz başarıyla eklendi" });
  } catch (err) {
    console.error("❌ Cihaz ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Kat Yoğunluğu API
app.get("/api/floor-density", async (req, res) => {
  try {
    console.log("Kat yoğunluğu hesaplanıyor...");
    const devices = await Device.find();
    let floorDensity = {};
    devices.forEach(device => {
      const key = `${device.campus} - ${device.floor}`;
      if (!floorDensity[key]) {
        floorDensity[key] = {
          campus: device.campus,
          floor: device.floor,
          totalDevices: 0,
          statusCounts: { Aktif: 0, Bakımda: 0, Hurda: 0 },
          categories: {}
        };
      }
      floorDensity[key].totalDevices++;
      if (device.status === "Aktif") floorDensity[key].statusCounts.Aktif++;
      if (device.status === "Bakımda") floorDensity[key].statusCounts.Bakımda++;
      if (device.status === "Hurda") floorDensity[key].statusCounts.Hurda++;
      if (!floorDensity[key].categories[device.category]) {
        floorDensity[key].categories[device.category] = {
          category: device.category,
          count: 0,
          devices: []
        };
      }
      floorDensity[key].categories[device.category].count++;
      floorDensity[key].categories[device.category].devices.push({
        serialNumber: device.serialNumber,
        deviceName: device.deviceName,
        brand: device.brand,
        model: device.model,
        owner: device.owner,
        status: device.status
      });
    });
    let densityArray = Object.values(floorDensity).map(entry => ({
      _id: { campus: entry.campus, floor: entry.floor },
      totalDevices: entry.totalDevices,
      statusCounts: entry.statusCounts,
      categories: Object.values(entry.categories)
    }));
    console.log("✅ Kat yoğunluğu hesaplandı ve sıralandı:", densityArray);
    res.json(densityArray);
  } catch (err) {
    console.error("❌ Kat yoğunluğu API hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Bakım ve Garanti Etkinlikleri API
app.get("/api/maintenance-events", async (req, res) => {
    try {
      console.log("📌 Bakım ve garanti etkinlikleri hesaplanıyor...");
      const devices = await Device.find();
      const today = moment();
      let events = [];
      devices.forEach((device) => {
        // Garanti süresi bitiyor olayları için
        if (device.warrantyEndDate) {
          const warrantyEnd = moment(device.warrantyEndDate);
          if (warrantyEnd.isAfter(today)) {
            events.push({
              _id: device._id.toString(), // _id'yi ekleyin
              date: warrantyEnd.format("YYYY-MM-DD"),
              deviceName: device.deviceName,
              brand: device.brand,
              model: device.model,
              owner: device.owner,
              campus: device.campus,
              floor: device.floor,
              eventType: "Garanti Süresi Bitiyor"
            });
          }
        }
        // Bakım olayları için
        if (device.maintenanceSchedule) {
          // Eğer device.lastUsageDate boşsa, fallback olarak purchaseDate kullanabilirsiniz
          const baseDate = device.lastUsageDate || device.purchaseDate;
          if (baseDate) {
            let nextMaintenance = moment(baseDate).add(1, "year");
            if (nextMaintenance.isSameOrAfter(today)) {
              events.push({
                _id: device._id.toString(), // _id'yi ekliyoruz
                date: nextMaintenance.format("YYYY-MM-DD"),
                deviceName: device.deviceName,
                brand: device.brand,
                model: device.model,
                owner: device.owner,
                campus: device.campus,
                floor: device.floor,
                eventType: device.status === "Bakımda" ? "Bakımda" : "Bakım Zamanı"
              });
            }
          }
        }
      });
      events.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
      console.log("✅ Bakım ve garanti etkinlikleri hesaplandı:", events);
      res.json(events);
    } catch (err) {
      console.error("❌ Bakım ve garanti API hatası:", err);
      res.status(500).json({ message: "Sunucu hatası", error: err.message });
    }
  });

// Demirbaş Listeleme API
app.get("/api/devices", async (req, res) => {
  try {
    const devices = await Device.find();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Log Modeli ve API
const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model("Log", logSchema);

const saveLog = async (message) => {
  try {
    await Log.create({ message });
  } catch (error) {
    console.error("❌ Log kaydedilemedi:", error);
  }
};

app.get("/api/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ Logları getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});

// Cihaz Güncelleme API (Değişiklikleri loglayan versiyon)
// İsteğin header'ında "Authorization: Bearer <TOKEN>" gönderilmelidir.
app.put("/api/devices/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;
    // Mevcut cihazı al
    const existingDevice = await Device.findById(id);
    if (!existingDevice) return res.status(404).json({ message: "Cihaz bulunamadı." });
    const ignoredFields = ["_id", "productImages", "technicalDocuments"];
    let changes = [];
    for (let key in updatedFields) {
      if (!ignoredFields.includes(key) && existingDevice[key] !== updatedFields[key]) {
        let fieldName = key;
        switch (key) {
          case "deviceName":
            fieldName = "Cihaz Adı";
            break;
          case "brand":
            fieldName = "Marka";
            break;
          case "model":
            fieldName = "Model";
            break;
          case "owner":
            fieldName = "Kullanıcı";
            break;
          case "campus":
            fieldName = "Yerleşke";
            break;
          case "floor":
            fieldName = "Kat";
            break;
          case "status":
            fieldName = "Durum";
            changes.push(`${fieldName}: "${existingDevice[key]}" → "${updatedFields[key]}"`);
            continue;
          default:
            fieldName = key;
        }
        changes.push(`${fieldName}: "${existingDevice[key]}" → "${updatedFields[key]}"`);
      }
    }
    if (changes.length === 0) {
      return res.status(200).json({ message: "Herhangi bir değişiklik yapılmadı." });
    }
    const updatedDevice = await Device.findByIdAndUpdate(id, updatedFields, { new: true });
    const logMessage = `🔄 Cihaz güncellendi: ${updatedDevice.deviceName} (${updatedDevice.brand} - ${updatedDevice.model}). Değişiklikler: ${changes.join(", ")}. İşlemi yapan: ${req.user.username}`;
    await saveLog(logMessage);
    res.json({ message: "Cihaz başarıyla güncellendi!", device: updatedDevice });
  } catch (err) {
    console.error("❌ Cihaz güncelleme hatası:", err);
    res.status(500).json({ message: "Güncelleme hatası.", error: err.message });
  }
});

// Cihaz Silme API
app.delete("/api/devices/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const deletedDevice = await Device.findByIdAndDelete(req.params.id);
    if (!deletedDevice) {
      return res.status(404).json({ message: "Cihaz bulunamadı." });
    }
    await saveLog(`🗑️ Cihaz silindi: ${deletedDevice.deviceName} (${deletedDevice.brand} - ${deletedDevice.model}). İşlemi yapan: ${req.user.username}`);
    res.json({ message: "Cihaz başarıyla silindi." });
  } catch (err) {
    res.status(500).json({ message: "Silme hatası.", error: err.message });
  }
});

// Backup Klasörü
const backupFolder = path.join(__dirname, "backups");
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

// Yedekleri Listeleme API
app.get("/api/backups", (req, res) => {
  fs.readdir(backupFolder, (err, files) => {
    if (err) {
      console.error("❌ Yedekleri okuma hatası:", err);
      return res.status(500).json({ message: "Yedekleri okuma hatası", error: err.message });
    }
    const backupFiles = files.filter(file => file.endsWith(".zip"));
    res.json(backupFiles);
  });
});

// Manuel Yedekleme API (Sadece authenticated kullanıcılar)
// İsteğin header'ında "Authorization: Bearer <TOKEN>" gönderilmeli.
app.post("/api/backup", authenticate, async (req, res) => {
  const username = req.user.username;
  const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
  const backupPath = path.join(backupFolder, `backup_${timestamp}.zip`);
  const command = `"C:/Program Files/MongoDB/Server/8.0/bin/mongodump" --db callcenter_inventory --archive="${backupPath}" --gzip`;
  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Yedekleme hatası:", stderr || error);
      return res.status(500).json({ message: "Yedekleme sırasında hata oluştu.", error: stderr || error.message });
    }
    console.log("✅ Yedekleme başarıyla tamamlandı:", backupPath);
    await saveLog(`📌 Veritabanı yedeklendi: ${backupPath}. İşlemi yapan: ${username}`);
    res.json({ message: "✅ Yedekleme başarıyla tamamlandı!", backupFile: `backup_${timestamp}.zip` });
  });
});

// Yedek Geri Yükleme API (Sadece authenticated kullanıcılar)
// İsteğin header'ında "Authorization: Bearer <TOKEN>" gönderilmeli.
app.post("/api/restore", authenticate, async (req, res) => {
  const username = req.user.username;
  const { backupName } = req.body;
  if (!backupName) {
    return res.status(400).json({ message: "Yedek ismi belirtilmedi." });
  }
  const backupPath = path.join(backupFolder, backupName);
  const command = `"C:/Program Files/MongoDB/Server/8.0/bin/mongorestore" --archive="${backupPath}" --gzip --drop`;
  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Geri yükleme hatası:", stderr || error);
      return res.status(500).json({ message: "Geri yükleme sırasında hata oluştu.", error: stderr || error.message });
    }
    console.log("✅ Geri yükleme başarıyla tamamlandı:", backupPath);
    await saveLog(`🔄 Veritabanı geri yüklendi: ${backupName}. İşlemi yapan: ${username}`);
    res.json({ message: "✅ Yedek başarıyla geri yüklendi!" });
  });
});

app.listen(5000, () => console.log("✅ Server 5000 portunda çalışıyor!"));
