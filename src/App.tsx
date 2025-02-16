import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddDevice from "./pages/AddDevice";
import FloorDensity from "./pages/FloorDensity";
import Schedule from "./pages/Schedule";
import UpdateDevice from "./pages/UpdateDevice";
import Logs from "./pages/Logs";
import BackupRestore from "./pages/BackupRestore";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-device" element={<AddDevice />} />
        <Route path="/floor-density" element={<FloorDensity />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/update-device" element={<UpdateDevice />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/backup-restore" element={<BackupRestore />} />
      </Routes>
    </Router>
  );
}

export default App;
