import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Editor from './Editor';
import History from './History';
// ✅ Import this
import RoomHistory from "./RoomHistory"; // ⬅️ Add this import
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:roomId" element={<Editor />} />
       <Route path="/history" element={<History />} />
        <Route path="/history" element={<RoomHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
