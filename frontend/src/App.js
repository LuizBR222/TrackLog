import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NovoPedido } from './pages/NovoPedido';
import { Dashboard } from './pages/Dashboard';
import './nimbus-tokens.css';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background-color: var(--nb-neutral-50);
    font-family: var(--nb-font);
    color: var(--nb-neutral-700);
    -webkit-font-smoothing: antialiased;
  }

  @keyframes pulsar {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.92); }
  }

  @keyframes slideIn {
    from { transform: translateX(110%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  select option { background-color: var(--nb-neutral-0); color: var(--nb-neutral-700); }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--nb-blue-500) !important;
    box-shadow: 0 0 0 3px var(--nb-blue-100) !important;
  }

  button:focus-visible {
    outline: 2px solid var(--nb-blue-500);
    outline-offset: 2px;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--nb-neutral-100); }
  ::-webkit-scrollbar-thumb { background: var(--nb-neutral-300); border-radius: 3px; }
`;

function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<NovoPedido />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
