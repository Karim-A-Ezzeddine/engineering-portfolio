import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './case.css';
import './styles.css';
import './v2-case.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
