import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Editor from './Editor';
import History from './History';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import PrivateRoute from "./PrivateRoute";
// ✅ Import this
import RoomHistory from "./RoomHistory"; // ⬅️ Add this import
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route
        path="/dashboard"
        element={ <PrivateRoute>
          <ThemeProvider theme={createTheme()}>
            <CssBaseline />
            <Dashboard />
          </ThemeProvider>
          </PrivateRoute>
        }
      />
        <Route path="/editor/:roomId" element={<PrivateRoute><Editor /></PrivateRoute>} />
       <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><RoomHistory /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
