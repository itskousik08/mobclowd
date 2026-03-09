import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111120',
            color: '#e2e8f0',
            border: '1px solid #1e1e38',
            fontSize: '13px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#111120' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#111120' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
