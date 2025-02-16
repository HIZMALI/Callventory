import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const FloorDensity = () => {
  const navigate = useNavigate();
  const [densityData, setDensityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDevices, setTotalDevices] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDensityData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/floor-density");

        // Kampüs sıralama düzeni (küçük harfe çevirip trim ile)
        const orderMapping: { [key: string]: number } = {
          "ana bina": 1,
          "laboratuvar": 2,
          "ek bina": 3,
        };

        const sortedData = response.data.sort((a: any, b: any) => {
          const campusA = a._id.campus.trim().toLowerCase();
          const campusB = b._id.campus.trim().toLowerCase();
          const campusOrderDiff = (orderMapping[campusA] || 100) - (orderMapping[campusB] || 100);
          if (campusOrderDiff !== 0) return campusOrderDiff;
          if (campusA === "ana bina") {
            return parseInt(a._id.floor) - parseInt(b._id.floor);
          }
          return 0;
        });

        setDensityData(sortedData);
        const total = sortedData.reduce((sum: number, campus: any) => sum + campus.totalDevices, 0);
        setTotalDevices(total);
      } catch (err) {
        setError("Veriler alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDensityData();
  }, []);

  // Kategoriye tıklayınca detayları aç/kapat
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Duruma (Aktif, Bakımda, arızalı) tıklayınca cihazları listele
  const toggleStatus = (status: string) => {
    if (expandedStatus === status) {
      setExpandedStatus(null);
      setFilteredDevices([]);
    } else {
      const filtered = densityData.flatMap((campus: any) =>
        campus.categories.flatMap((cat: any) =>
          cat.devices
            .filter((device: any) => device.status === status)
            .map((device: any) => ({
              ...device,
              campus: campus._id.campus,
              floor: campus._id.floor,
            }))
        )
      );
      setFilteredDevices(filtered);
      setExpandedStatus(status);
    }
  };

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
        .card-header {
          background-color: #cbc5f4 !important;
        }
      `}</style>

      <button className="dashboard-btn mb-3" onClick={() => navigate("/dashboard")}>
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand">🏢 Kat Yoğunluğu</h2>

      {loading && <p className="custom-brand">🔄 Veriler yükleniyor...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && densityData.length === 0 && (
        <p className="custom-brand">📭 Henüz cihaz eklenmemiş.</p>
      )}

      {!loading && !error && densityData.length > 0 && (
        <div className="mt-4">
          {densityData.map((campusData: any, index: number) => {
            const percentage = ((campusData.totalDevices / totalDevices) * 100).toFixed(2);
            return (
              <div key={index} className="card shadow-sm mb-3">
                <div className="card-header">
                  <h5 className="mb-0 custom-brand">
                    {campusData._id.campus} - {campusData._id.floor}
                    <span className="float-end custom-brand">
                      📊 Demirbaşların %{percentage} bu konumda
                    </span>
                  </h5>
                </div>
                <div className="card-body">
                  <p className="custom-brand">
                    <strong className="custom-brand">Toplam Cihaz:</strong> {campusData.totalDevices}
                  </p>

                  {/* Cihaz Durumları */}
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="badge bg-success"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStatus("Aktif")}
                    >
                      🟢 Aktif: {campusData.statusCounts?.Aktif || 0}
                    </span>
                    <span
                      className="badge bg-warning"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStatus("Bakımda")}
                    >
                      🟡 Bakımda: {campusData.statusCounts?.Bakımda || 0}
                    </span>
                    <span
                      className="badge bg-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStatus("Hurda")}
                    >
                      🔴 Arızalı: {campusData.statusCounts?.Hurda || 0}
                    </span>
                  </div>

                  <ul className="list-group">
                    {campusData.categories.map((cat: any, idx: number) => {
                      const categoryId = `${campusData._id.campus}-${campusData._id.floor}-${cat.category}`;
                      return (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="custom-brand">{cat.category}</span>
                          <span
                            className="badge bg-info custom-brand"
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleCategory(categoryId)}
                          >
                            {cat.count}
                          </span>

                          {/* Açılır Detay Menüsü */}
                          {expandedCategory === categoryId && (
                            <div className="mt-2 p-2 bg-light border rounded w-100">
                              <h6 className="text-dark custom-brand">📋 {cat.category} Demirbaşları</h6>
                              <ul className="list-unstyled">
                                {cat.devices.map((device: any, deviceIdx: number) => (
                                  <li key={deviceIdx} className="text-muted custom-brand">
                                    <strong className="custom-brand">{device.deviceName}</strong> - {device.brand} - {device.model} - {device.owner}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-3 border rounded">
        <h4 className="text-center">📊 Genel Cihaz Sayıları</h4>
        <div className="d-flex justify-content-between">
          <span className="badge bg-secondary text-white">🔢 Toplam Cihaz: {totalDevices}</span>
          <span
            className="badge bg-success text-white"
            style={{ cursor: "pointer" }}
            onClick={() => toggleStatus("Aktif")}
          >
            🟢 Aktif: {densityData.reduce((sum, campus) => sum + (campus.statusCounts?.Aktif || 0), 0)}
          </span>
          <span
            className="badge bg-warning text-white"
            style={{ cursor: "pointer" }}
            onClick={() => toggleStatus("Bakımda")}
          >
            🟡 Bakımda: {densityData.reduce((sum, campus) => sum + (campus.statusCounts?.Bakımda || 0), 0)}
          </span>
          <span
            className="badge bg-danger text-white"
            style={{ cursor: "pointer" }}
            onClick={() => toggleStatus("Hurda")}
          >
            🔴 Arızalı: {densityData.reduce((sum, campus) => sum + (campus.statusCounts?.Hurda || 0), 0)}
          </span>
        </div>

        {expandedStatus && (
          <div className="mt-3 p-3 border rounded">
            <h5 className="text-center custom-brand">📋 {expandedStatus} Cihazlar</h5>
            <ul className="list-unstyled">
              {filteredDevices.map((device, index) => (
                <li key={index} className="text-muted custom-brand">
                  <strong className="custom-brand">{device.deviceName}</strong> - {device.brand} - {device.model} - {device.owner} ({device.campus} - {device.floor})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorDensity;
