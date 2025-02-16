import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Giriş başarısız! Kullanıcı adı veya şifre yanlış.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <style>{`
        .custom-brand {
          color: #362870 !important;
        }
        .custom-from {
          color: #5b45b5 !important;
        }
      `}</style>
      <div
        className="card shadow-lg p-4"
        style={{ width: "400px", borderRadius: "10px", backgroundColor: "#cbc5f4" }}
      >
        <h2 className="text-center custom-brand mb-3">Callventory</h2>
        <h5 className="text-center custom-from mb-4">from Matiricie</h5>
        {error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold custom-from">Kullanıcı Adı</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold custom-from">Şifre</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            style={{ backgroundColor: "#362870", borderColor: "#362870" }}
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
