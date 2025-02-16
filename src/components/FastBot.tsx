import { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";

const FastBot = () => {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{ sender: string; text: string }[]>([
    { sender: "FastBot", text: "Merhaba! Ben FastBot. Size nasıl yardımcı olabilirim?" }
  ]);
  const [devices, setDevices] = useState<any[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  // Kullanıcı adı localStorage'dan alınır
  const username = localStorage.getItem("username") || "Siz";

  const fetchDevices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/devices");
      setDevices(response.data);
    } catch (error) {
      console.error("Cihazlar alınırken hata:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [chat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lowerQuery = query.toLowerCase();
    let reply = "Üzgünüm, bu konuda bilgi veremiyorum.";

    if (lowerQuery.includes("aktif") && lowerQuery.includes("demirbaş")) {
      const count = devices.filter((d) => d.status === "Aktif").length;
      reply = `Şu anda ${count} adet aktif demirbaş var.`;
    } else if (lowerQuery.includes("bakımda") && lowerQuery.includes("demirbaş")) {
      const count = devices.filter((d) => d.status === "Bakımda").length;
      reply = `Şu anda ${count} adet bakımda demirbaş var.`;
    } else if (lowerQuery.includes("toplam") && lowerQuery.includes("demirbaş")) {
      const count = devices.length;
      reply = `Şu anda toplam ${count} adet demirbaş var.`;
    } else if (lowerQuery.includes("garanti") && lowerQuery.includes("bitiyor")) {
      const count = devices.filter((d) => {
        const daysLeft = moment(d.warrantyEndDate).diff(moment(), "days");
        return daysLeft >= 0 && daysLeft <= 30;
      }).length;
      reply = `Garanti süresi 30 gün içinde biten ${count} adet demirbaş var.`;
    } else if (lowerQuery.includes("garanti") && lowerQuery.includes("bitmiş")) {
      const count = devices.filter((d) => moment(d.warrantyEndDate).isBefore(moment())).length;
      reply = `Garanti süresi geçmiş ${count} adet demirbaş var.`;
    } else if (lowerQuery.includes("kat") && lowerQuery.includes("yoğunluk")) {
      const floorDensity = devices.reduce((acc, d) => {
        acc[d.floor] = (acc[d.floor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      reply = `Kat yoğunlukları: ${Object.entries(floorDensity).map(([floor, count]) => `${floor}: ${count} cihaz`).join(", ")}.`;
    } else if (lowerQuery.includes("en fazla") && lowerQuery.includes("arızalanan") && lowerQuery.includes("marka")) {
      const brandFailures = devices.reduce((acc, device) => {
        if (device.status === "Hurda") {
          acc[device.brand] = (acc[device.brand] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const maxBrand = Object.keys(brandFailures).reduce((a, b) => (brandFailures[a] > brandFailures[b] ? a : b), "");
      reply = `En fazla arızalanan marka: ${maxBrand} (${brandFailures[maxBrand] || 0} cihaz).`;
    } else if (lowerQuery.includes("belirli") && lowerQuery.includes("marka") && lowerQuery.includes("sayısı")) {
      const words = lowerQuery.split(" ");
      const brand = words.find((word) => devices.some((d) => d.brand.toLowerCase() === word));
      if (brand) {
        const count = devices.filter((d) => d.brand.toLowerCase() === brand).length;
        reply = `${brand.toUpperCase()} markasına ait ${count} cihaz var.`;
      } else {
        reply = "Belirtilen markaya ait cihaz bulunamadı.";
      }
    } else if (lowerQuery.includes("cihaz") && lowerQuery.includes("hangi odada")) {
      const words = lowerQuery.split(" ");
      const deviceName = words.find((word) => devices.some((d) => d.name.toLowerCase().includes(word)));
      if (deviceName) {
        const device = devices.find((d) => d.name.toLowerCase().includes(deviceName));
        reply = `${deviceName.toUpperCase()} adlı cihaz ${device?.room || "bilinmeyen"} odasında.`;
      } else {
        reply = "Belirtilen cihaz bulunamadı.";
      }
    } else if (lowerQuery.includes("bakım") && lowerQuery.includes("yaklaşan")) {
      const count = devices.filter((d) => {
        const daysLeft = moment(d.maintenanceDate).diff(moment(), "days");
        return daysLeft >= 0 && daysLeft <= 30;
      }).length;
      reply = `Bakım zamanı 30 gün içinde gelecek ${count} cihaz var.`;
    } else if (lowerQuery.includes("yedekleme") || lowerQuery.includes("geri yükleme")) {
      reply = "Yedekleme işlemi için lütfen sistem yöneticisine başvurun veya 'Yedekleme & Geri Yükleme' sayfasına gidin.";
    } else if (lowerQuery.includes("merhaba") || lowerQuery.includes("selam")) {
      reply = "Merhaba! Size nasıl yardımcı olabilirim?";
    }

    setChat((prev) => [...prev, { sender: username, text: query }, { sender: "FastBot", text: reply }]);
    setQuery("");
  };

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: "10px", padding: "10px", backgroundColor: "#fff", maxWidth: "350px", margin: "0 auto", textAlign: "center" }}>
      <h4 style={{ color: "#362870", marginBottom: "10px" }}>FastBot</h4>
      <div ref={chatRef} style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "10px", border: "1px solid #ccc", padding: "8px", borderRadius: "5px", textAlign: "left" }}>
        {chat.map((message, index) => (
          <p key={index} style={{ margin: "5px 0", textAlign: message.sender === username ? "right" : "left" }}>
            <strong>{message.sender}: </strong>{message.text}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="d-flex">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Soru sorun..." className="form-control" required style={{ borderRadius: "5px 0 0 5px", borderRight: "none" }} />
        <button type="submit" className="btn" style={{ background: "linear-gradient(45deg, #362870, #5b45b5)", border: "none", color: "#fff", borderRadius: "0 5px 5px 0", padding: "8px 12px" }}>Gönder</button>
      </form>
    </div>
  );
};

export default FastBot;
