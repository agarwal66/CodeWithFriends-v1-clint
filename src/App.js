import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Editor from './Editor';
import History from './History';
import LandingPage from "./LandingPage";
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import PrivateRoute from "./PrivateRoute";
import About from "./About";
import Contact from "./Contact";
// ✅ Import this
import RoomHistory from "./RoomHistory"; // ⬅️ Add this import
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//          <Route
//         path="/dashboard"
//         element={ <PrivateRoute>
//           <ThemeProvider theme={createTheme()}>
//             <CssBaseline />
//             <Dashboard />
//           </ThemeProvider>
//           </PrivateRoute>
//         }
//       />
//       <Route path="/" element={<LandingPage />} />
//         <Route path="/editor/:roomId" element={<PrivateRoute><Editor /></PrivateRoute>} />
//        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
//         <Route path="/history" element={<PrivateRoute><RoomHistory /></PrivateRoute>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ThemeProvider theme={createTheme()}>
                <CssBaseline />
                <Dashboard />
              </ThemeProvider>
            </PrivateRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/editor/:roomId" element={<PrivateRoute><Editor /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/roomhistory" element={<PrivateRoute><RoomHistory /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;