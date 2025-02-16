import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const Logs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/logs");
        setLogs(response.data);
      } catch (err) {
        setError("Geçmiş verileri alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container mt-5">
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
      <button 
        className="dashboard-btn mb-3" 
        onClick={() => navigate("/dashboard")}
      >
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand">📜 Cihaz Geçmişi</h2>

      {loading && <p className="custom-brand">🔄 Veriler yükleniyor...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && logs.length === 0 && (
        <p className="custom-brand">📭 Henüz herhangi bir işlem geçmişi yok.</p>
      )}

      {!loading && !error && logs.length > 0 && (
        <ul className="list-group mt-4">
          {logs.map((log, index) => (
            <li key={index} className="list-group-item custom-brand">
              <strong>{moment(log.timestamp).format("DD.MM.YYYY HH:mm")}</strong> - {log.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Logs;
