import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateDevice = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/devices");
        setDevices(response.data);
      } catch (err) {
        setError("Cihazlar yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const handleEdit = (device: any) => {
    setSelectedDevice(device);
    setFormData(device);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token"); // Token'ı localStorage'dan alıyoruz.
      await axios.put(
        `http://localhost:5000/api/devices/${selectedDevice._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Cihaz başarıyla güncellendi!");
      setSelectedDevice(null);
      const response = await axios.get("http://localhost:5000/api/devices");
      setDevices(response.data);
    } catch (err) {
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token"); // Token'ı alıyoruz.
      await axios.delete(`http://localhost:5000/api/devices/${selectedDevice._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Cihaz başarıyla silindi!");
      setShowDeleteModal(false);
      setSelectedDevice(null);
      const response = await axios.get("http://localhost:5000/api/devices");
      setDevices(response.data);
    } catch (err) {
      alert("Silme sırasında hata oluştu.");
    }
  };

  return (
    <div className="container mt-5">
      {/* Stil Tanımlamaları */}
      <style>{`
        .custom-brand {
          color: #362870 !important;
        }
        .custom-label {
          color: #362870;
          font-weight: bold;
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
      <button className="dashboard-btn mb-3" onClick={() => navigate("/dashboard")}>
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand">🔧 Demirbaş Veri Güncelleme</h2>

      {loading && <p className="custom-brand">🔄 Veriler yükleniyor...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && devices.length === 0 && (
        <p className="custom-brand">📭 Henüz eklenmiş cihaz yok.</p>
      )}

      {!loading && !error && devices.length > 0 && (
        <div className="mt-4">
          <ul className="list-group">
            {devices.map((device) => (
              <li
                key={device._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span className="custom-brand">
                  <strong>{device.deviceName}</strong> - {device.brand} {device.model} ({device.owner} - {device.campus} / {device.floor})
                </span>
                <button
                  className="dashboard-btn"
                  onClick={() => handleEdit(device)}
                >
                  ✏️ Düzenle
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedDevice && (
        <div className="modal-backdrop">
          <div className="modal-content p-4 shadow-lg rounded" style={{ backgroundColor: "#fff" }}>
            <h4 className="text-center custom-brand">
              🛠 {selectedDevice.deviceName} Güncelle
            </h4>

            <label className="custom-label mt-2">Cihaz Adı</label>
            <input
              type="text"
              className="form-control mb-2"
              name="deviceName"
              value={formData.deviceName}
              onChange={handleChange}
            />

            <label className="custom-label">Marka</label>
            <input
              type="text"
              className="form-control mb-2"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />

            <label className="custom-label">Model</label>
            <input
              type="text"
              className="form-control mb-2"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />

            <label className="custom-label">Kullanıcı</label>
            <input
              type="text"
              className="form-control mb-2"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
            />

            <label className="custom-label">Yerleşke</label>
            <select
              className="form-select mb-2"
              name="campus"
              value={formData.campus}
              onChange={handleChange}
            >
              <option value="Ana Bina">Ana Bina</option>
              <option value="Laboratuvar">Laboratuvar</option>
              <option value="Ek Bina">Ek Bina</option>
            </select>

            <label className="custom-label">Kat</label>
            <select
              className="form-select mb-2"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
            >
              <option value="Zemin Kat">Zemin Kat</option>
              <option value="1. Kat">1. Kat</option>
              <option value="2. Kat">2. Kat</option>
              <option value="3. Kat">3. Kat</option>
            </select>

            <label className="custom-label">Durum</label>
            <select
              className="form-select mb-3"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Aktif">🟢 Aktif</option>
              <option value="Bakımda">🟡 Bakımda</option>
              <option value="Hurda">🔴 Arızalı</option>
            </select>

            <div className="d-flex justify-content-between">
              <button className="dashboard-btn w-45" onClick={handleUpdate}>
                💾 Güncelle
              </button>
              <button className="dashboard-btn w-45" onClick={() => setShowDeleteModal(true)}>
                🗑 Sil
              </button>
            </div>
            <button
              className="dashboard-btn w-100 mt-2"
              onClick={() => setSelectedDevice(null)}
            >
              ❌ Kapat
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content p-4 shadow-lg rounded" style={{ backgroundColor: "#fff" }}>
            <h4 className="text-center text-danger">⚠️ Silme Onayı</h4>
            <p className="text-center custom-brand">
              Bu cihazı silmek istediğinize emin misiniz?
            </p>
            <div className="d-flex justify-content-between">
              <button className="dashboard-btn w-45" onClick={handleDelete}>
                Evet, Sil
              </button>
              <button className="dashboard-btn w-45" onClick={() => setShowDeleteModal(false)}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateDevice;
