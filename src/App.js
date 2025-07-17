import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Editor from './Editor';
import History from './History';
import RoomHistory from "./RoomHistory";
import ChakraHome from './ChakraHome';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

// Optional: Custom themes if needed
const chakraTheme = extendTheme({});
const muiTheme = createTheme({});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login without any provider for simplicity */}
        <Route path="/" element={<Login />} />

        {/* Dashboard in MUI theme only */}
        <Route 
          path="/dashboard"
          element={
            <ThemeProvider theme={muiTheme}>
              <CssBaseline />
              <Dashboard />
            </ThemeProvider>
          }
        />
        
        {/* RoomHistory - you can use Chakra or MUI or plain, yahan example ke liye Chakra diya hai */}
        <Route
          path="/history"
          element={
            <ChakraProvider theme={chakraTheme}>
              <RoomHistory />
            </ChakraProvider>
          }
        />

        {/* History - agar yeh bhi Chakra/MUI chahiye toh waise hi wrap karo, yahan plain */}
        <Route path="/history-plain" element={<History />} />

        {/* Editor, plain */}
        <Route path="/editor/:roomId" element={<Editor />} />

        {/* ChakraHome - only Chakra themed */}
        <Route
          path="/chakra"
          element={
            <ChakraProvider theme={chakraTheme}>
              <ChakraHome />
            </ChakraProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
