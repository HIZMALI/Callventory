import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddDevice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Zorunlu Alanlar
    deviceName: "",
    serialNumber: "",
    category: "",
    brand: "",
    model: "",
    owner: "",
    location: "",
    warrantyEndDate: "",
    maintenanceSchedule: "",
    // Opsiyonel Alanlar
    purchaseDate: "",
    invoiceNumber: "",
    cost: "",
    supplier: "",
    depreciationPeriod: "",
    maintenanceContract: "",
    warrantyDocument: "",
    hardwareSpecs: "",
    softwareInfo: "",
    connectionType: "",
    status: "Aktif",
    lastUsageDate: "",
    notes: "",
  });

  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [technicalDocuments, setTechnicalDocuments] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dosya Yükleme
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "pdf"
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const allowedFormats = type === "image" ? ["image/png", "image/jpeg"] : ["application/pdf"];

    const invalidFiles = files.filter((file) => !allowedFormats.includes(file.type));

    if (invalidFiles.length > 0) {
      setError(
        `❌ Hatalı dosya türü! Sadece ${type === "image" ? "PNG, JPG" : "PDF"} dosyaları yüklenebilir.`
      );
      e.target.value = "";
    } else {
      setError(null);
      type === "image" ? setProductImages(e.target.files) : setTechnicalDocuments(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    if (productImages)
      Array.from(productImages).forEach((file) => data.append("productImages", file));
    if (technicalDocuments)
      Array.from(technicalDocuments).forEach((file) =>
        data.append("technicalDocuments", file)
      );

    try {
      await axios.post("http://localhost:5000/api/devices", data);
      alert("Cihaz başarıyla eklendi!");
      navigate("/dashboard");
    } catch (err) {
      alert("Cihaz eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <style>{`
        .custom-brand {
          color: #362870 !important;
        }
        .custom-from {
          color: #5b45b5 !important;
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
          border-radius: 8px;
          padding: 10px 16px;
          transition: background 0.3s ease;
          margin-bottom: 10px;
        }
        .dashboard-btn:hover {
          background: linear-gradient(45deg, #5b45b5, #362870);
        }
      `}</style>
      <button
        className="dashboard-btn"
        onClick={() => navigate("/dashboard")}
        style={{ borderRadius: "25px", padding: "8px 16px" }}
      >
        ◀ Geri
      </button>

      <h2 className="text-center custom-brand d-flex align-items-center justify-content-center">
        <span role="img" aria-label="clipboard" className="me-2">📋</span>
        Demirbaş Girişi
      </h2>

      <form
        className="card shadow-lg p-4 mx-auto mt-4"
        style={{ maxWidth: "700px", borderRadius: "15px", backgroundColor: "#cbc5f4" }}
        onSubmit={handleSubmit}
      >
        <h5 className="fw-bold text-dark custom-brand">📌 Temel Bilgiler</h5>
        <input
          type="text"
          className="form-control mb-3"
          name="deviceName"
          placeholder="Cihaz Adı *"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          className="form-control mb-3"
          name="serialNumber"
          placeholder="Seri Numarası *"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          className="form-control mb-3"
          name="brand"
          placeholder="Marka *"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          className="form-control mb-3"
          name="model"
          placeholder="Model *"
          onChange={handleChange}
          required
        />
        <div className="mb-3">
          <label className="custom-label">Cihaz Kategorisi</label>
          <select className="form-select mb-3" name="category" onChange={handleChange} required>
            <option value="">Seçiniz *</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Beyaz Eşya">Beyaz Eşya</option>
            <option value="Mobilya">Mobilya</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>

        <h5 className="fw-bold text-dark custom-brand">📍 Sorumlu & Konum</h5>
        <input
          type="text"
          className="form-control mb-3"
          name="owner"
          placeholder="Kullanacak Kişi: *"
          onChange={handleChange}
          required
        />
        <div className="mb-3">
          <label className="custom-label">Yerleşke</label>
          <select className="form-select mb-3" name="campus" onChange={handleChange} required>
            <option value="">Yerleşke Seçin *</option>
            <option value="Merkez Kampüs">Merkez Kampüs</option>
            <option value="Ek Bina">Ek Bina</option>
            <option value="Depo">Depo</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="custom-label">Kat</label>
          <select className="form-select mb-3" name="floor" onChange={handleChange} required>
            <option value="">Kat Seçin *</option>
            <option value="Zemin Kat">Zemin Kat</option>
            <option value="1. Kat">1. Kat</option>
            <option value="2. Kat">2. Kat</option>
            <option value="3. Kat">3. Kat</option>
          </select>
        </div>

        <h5 className="fw-bold text-dark custom-brand">🛠 Bakım & Garanti</h5>
        <div className="mb-3">
          <label className="custom-label">Garanti Bitiş Süresi</label>
          <input
            type="date"
            className="form-control mb-3"
            name="warrantyEndDate"
            placeholder="Garanti Bitiş Tarihi *"
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          className="form-control mb-3"
          name="maintenanceSchedule"
          placeholder="Bakım Periyotları *"
          onChange={handleChange}
          required
        />

        <h5 className="fw-bold text-dark custom-brand">💰 Finansal Bilgiler (Opsiyonel)</h5>
        <div className="mb-3">
          <label className="custom-label">Fatura Tarihi</label>
          <input
            type="date"
            className="form-control mb-3"
            name="purchaseDate"
            placeholder="Satın Alma Tarihi"
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className="form-control mb-3"
          name="invoiceNumber"
          placeholder="Fatura Numarası"
          onChange={handleChange}
        />
        <input
          type="number"
          className="form-control mb-3"
          name="cost"
          placeholder="Maliyet (₺)"
          onChange={handleChange}
        />
        <input
          type="text"
          className="form-control mb-3"
          name="supplier"
          placeholder="Tedarikçi"
          onChange={handleChange}
        />

        <h5 className="fw-bold text-dark custom-brand">⚙️ Teknik Bilgiler (Opsiyonel)</h5>
        <input
          type="text"
          className="form-control mb-3"
          name="hardwareSpecs"
          placeholder="Donanım Özellikleri"
          onChange={handleChange}
        />
        <input
          type="text"
          className="form-control mb-3"
          name="softwareInfo"
          placeholder="Yazılım & Lisans Bilgileri"
          onChange={handleChange}
        />

        <h5 className="fw-bold text-dark custom-brand">📂 Dosya Yükleme (Opsiyonel)</h5>
        <p className="mb-1">Cihaz Resimleri (PNG ve/veya JPG) - En fazla 5 dosya</p>
        <input
          type="file"
          multiple
          className="form-control mb-3"
          accept=".png,.jpg,.jpeg"
          onChange={(e) => handleFileChange(e, "image")}
        />
        <p className="mb-1">Kullanım Kılavuzu ve Garanti Belgesi (Yalnızca PDF) - En fazla 3 dosya</p>
        <input
          type="file"
          multiple
          className="form-control mb-3"
          accept=".pdf"
          onChange={(e) => handleFileChange(e, "pdf")}
        />

        {error && <div className="alert alert-danger">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold"
          disabled={loading}
          style={{ borderRadius: "10px", backgroundColor: "#362870", borderColor: "#362870" }}
        >
          {loading ? "⏳ Kaydediliyor..." : "💾 Kaydet"}
        </button>
      </form>
    </div>
  );
};

export default AddDevice;
