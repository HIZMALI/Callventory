import { useNavigate } from "react-router-dom";

const Maintenance = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      {/* Geri Dön Butonu */}
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/dashboard")}>
        ◀ Geri
      </button>

      <h2 className="text-center text-success">🛠 Bakım ve Garanti Takibi</h2>

      <p className="text-center mt-4">Burada bakım ve garanti işlemlerini takip edebilirsiniz.</p>
    </div>
  );
};

export default Maintenance;
