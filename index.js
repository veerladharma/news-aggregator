import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Admin from './Admin';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (window.location.pathname === '/admin') {
  root.render(
    <React.StrictMode>
      <Admin />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}