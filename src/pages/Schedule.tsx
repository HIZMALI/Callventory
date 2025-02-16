import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const Schedule = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedReturnTimes, setEstimatedReturnTimes] = useState<{ [id: string]: string }>({});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/maintenance-events");
      const sortedEvents = response.data.sort(
        (a: any, b: any) =>
          moment(a.date, "YYYY-MM-DD").valueOf() - moment(b.date, "YYYY-MM-DD").valueOf()
      );
      setEvents(sortedEvents);
    } catch (err) {
      setError("Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Olayları tarihe göre gruplayan fonksiyon
  const groupedEvents = events.reduce((acc: any[], event: any) => {
    const eventDateFormatted = moment(event.date, "YYYY-MM-DD").format("DD.MM.YYYY");
    const existing = acc.find((e) => e.date === eventDateFormatted);
    if (existing) {
      existing.devices.push(event);
    } else {
      acc.push({ date: eventDateFormatted, devices: [event] });
    }
    return acc;
  }, []);

  // Checkbox değişim fonksiyonu
  const handleCheckboxChange = async (
    deviceId: string,
    currentEventType: string,
    originalDate: string
  ) => {
    console.log("Checkbox tıklandı:", deviceId, currentEventType, originalDate);
    // Eğer cihaz durumu "Bakımda" ise, checkbox kaldırılırsa "Aktif", aksi halde "Bakımda" olacak.
    const newStatus = currentEventType === "Bakımda" ? "Aktif" : "Bakımda";
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/devices/${deviceId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Eğer yeni durum "Bakımda" ise, rastgele 7-15 gün ekleyerek tahmini geri dönüş tarihini hesapla
      if (newStatus === "Bakımda") {
        const randomDays = Math.floor(Math.random() * 9) + 7;
        const estimatedDate = moment(originalDate, "YYYY-MM-DD")
          .add(randomDays, "days")
          .format("DD.MM.YYYY");
        setEstimatedReturnTimes((prev) => ({ ...prev, [deviceId]: estimatedDate }));
      } else {
        setEstimatedReturnTimes((prev) => {
          const newState = { ...prev };
          delete newState[deviceId];
          return newState;
        });
      }
      fetchEvents();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
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
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
      `}</style>
      <button className="dashboard-btn mb-3" onClick={() => navigate("/dashboard")}>
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand">🛠 Bakım ve Garanti Takvimi</h2>

      {loading && <p className="custom-brand">🔄 Veriler yükleniyor...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && groupedEvents.length === 0 && (
        <p className="custom-brand">📭 Yaklaşan bakım veya garanti etkinliği bulunamadı.</p>
      )}

      {!loading && !error && groupedEvents.length > 0 && (
        <div className="calendar-grid mt-4">
          {groupedEvents.map((dayEvent: any, index: number) => (
            <div key={index} className="card shadow-sm">
              <div className="card-header text-center">
                <h5 className="mb-0 custom-brand">{dayEvent.date}</h5>
              </div>
              <div className="card-body">
                {dayEvent.devices.map((event: any, idx: number) => {
                  const eventKey = `${dayEvent.date}-${idx}`;
                  const isMaintenance = event.eventType === "Bakım Zamanı" || event.eventType === "Bakımda";
                  return (
                    <div key={eventKey} className="mb-3">
                      <div className="w-100 text-center">
                        <strong className="custom-brand">{event.deviceName}</strong> - {event.brand} {event.model} <br />
                        <small className="custom-brand">
                          ({event.owner} - {event.campus} / {event.floor})
                        </small>
                      </div>
                      <div className="text-center mt-2">
                        <span className={`badge ${event.eventType === "Garanti Süresi Bitiyor" ? "bg-danger" : "bg-warning"} custom-brand`}>
                          {event.eventType}
                        </span>
                      </div>
                      {isMaintenance && (
                        <div className="text-center mt-2">
                          <span className="custom-brand">Bakım Zamanı</span>
                          <input
                            type="checkbox"
                            style={{ marginLeft: "10px", cursor: "pointer" }}
                            checked={event.eventType === "Bakımda"}
                            onChange={() => handleCheckboxChange(event._id, event.eventType, event.date)}
                          />
                        </div>
                      )}
                      {isMaintenance && estimatedReturnTimes[event._id] && (
                        <div className="text-center mt-2 custom-brand">
                          Tahmini Geri Dönüş Zamanı: {estimatedReturnTimes[event._id]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
