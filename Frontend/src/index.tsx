import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './services/testUtils'; // Make TestUtils available in console

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
