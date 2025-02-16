import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BackupRestore = () => {
  const navigate = useNavigate();
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  // Yedekleri Listeleme (Başarılı mesajı kaldırıldı)
  const fetchBackups = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/backups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackups(response.data);
    } catch (error) {
      console.error("❌ Yedekleri alırken hata oluştu:", error);
      setMessage("❌ Yedekleri alırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Manuel Yedekleme
  const createBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/backup", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Yedek alma başarılı.");
      fetchBackups(); // Yeni yedeği listeye ekle
    } catch (error) {
      console.error("❌ Yedekleme sırasında hata oluştu:", error);
      setMessage("❌ Yedekleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Yedeği Geri Yükleme
  const restoreBackup = async (backupName: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/restore", { backupName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Yedek başarıyla geri yüklendi!");
    } catch (error) {
      console.error("❌ Geri yükleme sırasında hata oluştu:", error);
      setMessage("❌ Geri yükleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {/* Stil Tanımlamaları */}
      <style>{`
        .custom-brand {
          color: #362870 !important;
        }
        .dashboard-btn {
          background: linear-gradient(45deg, #362870, #5b45b5);
          border: none;
          color: #fff;
          font-weight: bold;
          border-radius: 25px;
          padding: 8px 16px;
          transition: background 0.3s ease;
        }
        .dashboard-btn:hover {
          background: linear-gradient(45deg, #5b45b5, #362870);
        }
      `}</style>

      {/* Gradyanlı Geri Butonu */}
      <button
        className="dashboard-btn mb-3"
        onClick={() => navigate("/dashboard")}
      >
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand">📂 Yedekleme & Geri Yükleme</h2>

      {message && (
        <p
          className={`alert ${
            message.includes("❌") ? "alert-danger" : "alert-success"
          }`}
        >
          {message}
        </p>
      )}

      <button
        className="dashboard-btn w-100 my-2"
        onClick={createBackup}
        disabled={loading}
      >
        📌 Yedek Al
      </button>
      <button
        className="dashboard-btn w-100 my-2"
        onClick={fetchBackups}
        disabled={loading}
      >
        🔄 Yedekleri Yenile
      </button>

      {backups.length > 0 ? (
        <ul className="list-group mt-3">
          {backups.map((backup, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center custom-brand"
            >
              <span className="fw-bold">{backup}</span>
              <button
                className="dashboard-btn btn-sm"
                onClick={() => restoreBackup(backup)}
                disabled={loading}
              >
                🔄 Geri Yükle
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center custom-brand mt-3">
          📭 Henüz yedekleme bulunmuyor.
        </p>
      )}
    </div>
  );
};

export default BackupRestore;
