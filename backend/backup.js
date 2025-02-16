const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// Yedekleme Dizini
const backupDir = path.join(__dirname, "backups");

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// MongoDB Dump Komutu (Yedekleme)
const backupMongoDB = () => {
    const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    const backupPath = path.join(backupDir, `backup_${timestamp}`);

    // Windows için mongodump dizini 
    const mongodumpPath = `"C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongodump"`;

    // Mac bilgisayarlarda bu dizin farklıdır.
    
    const command = `${mongodumpPath} --db callcenter_inventory --out "${backupPath}"`;

    console.log(`Yedekleme başlatıldı: ${backupPath}`);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Yedekleme hatası: ${error.message}`);
            return;
        }
        console.log("✅ Yedekleme tamamlandı.");
    });
};

// Haftalık Yedekleme İçin Zamanlayıcı
setInterval(() => {
    console.log("⏳ Haftalık yedekleme çalıştırılıyor...");
    backupMongoDB();
}, 7 * 24 * 60 * 60 * 1000); // 7 gün (ms cinsinden)

backupMongoDB();
