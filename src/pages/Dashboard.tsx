// src/pages/Dashboard.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FastBot from "../components/FastBot";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container-fluid bg-light min-vh-100">
      <style>{`
        .custom-brand {
          color: #362870 !important;
        }
        .custom-from {
          color: #5b45b5 !important;
        }
        .dashboard-btn {
          background: linear-gradient(45deg, #362870, #5b45b5);
          border: none;
          color: #fff;
          font-weight: bold;
          border-radius: 8px;
          padding: 12px 20px;
          transition: background 0.3s ease;
          margin: 5px;
          min-width: 180px;
        }
        .dashboard-btn:hover {
          background: linear-gradient(45deg, #5b45b5, #362870);
        }
      `}</style>
      <nav className="navbar navbar-dark px-3" style={{ backgroundColor: "#cbc5f4" }}>
        <div className="d-flex flex-column align-items-start">
          <span className="navbar-brand fs-4 fw-bold custom-brand">
            Callventory
          </span>
          <small className="custom-from" style={{ fontSize: "10px", marginTop: "-5px" }}>
            from Matiricie
          </small>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </nav>
      <div className="container mt-4">
        <h2 className="text-center custom-brand fw-bold">Yönetim Paneli</h2>
        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
          <button className="dashboard-btn" onClick={() => navigate("/add-device")}>
            📋 Demirbaş Girişi
          </button>
          <button className="dashboard-btn" onClick={() => navigate("/floor-density")}>
            📊 Kat Yoğunluğu
          </button>
          <button className="dashboard-btn" onClick={() => navigate("/schedule")}>
            🛠 Bakım ve Garanti
          </button>
          <button className="dashboard-btn" onClick={() => navigate("/update-device")}>
            🔧 Demirbaş Veri Güncelleme
          </button>
          <button className="dashboard-btn" onClick={() => navigate("/logs")}>
            🕒 Geçmiş
          </button>
          <button className="dashboard-btn" onClick={() => navigate("/backup-restore")}>
            📂 Yedekleme & Geri Yükleme
          </button>
        </div>
        <p className="text-center mt-4">
          Sistem yönetimi için yukarıdaki seçeneklerden birini seçebilirsiniz.
        </p>
        <div className="mt-5">
          <FastBot />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
