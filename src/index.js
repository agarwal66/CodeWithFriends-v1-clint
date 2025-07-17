import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const chakraTheme = extendTheme({});
const muiTheme = createTheme({});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
