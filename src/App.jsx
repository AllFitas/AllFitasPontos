import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Placeholder Pages
const Dashboard = () => (
  <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="glass-card">
      <h3 className="text-text-muted text-sm mb-1">Total de Clientes</h3>
      <p className="text-3xl font-bold">0</p>
    </div>
    <div className="glass-card">
      <h3 className="text-text-muted text-sm mb-1">Pontos Distribuídos (30d)</h3>
      <p className="text-3xl font-bold">0</p>
    </div>
    <div className="glass-card">
      <h3 className="text-text-muted text-sm mb-1">Resgates Realizados</h3>
      <p className="text-3xl font-bold">0</p>
    </div>
  </div>
);

const UploadPage = () => (
  <div className="animate-fade-in glass p-12 flex flex-col items-center justify-center border-dashed border-2 border-border border-spacing-4 rounded-3xl">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <div className="text-primary">📁</div>
    </div>
    <h2 className="text-2xl font-bold mb-2">Importar Vendas</h2>
    <p className="text-text-muted mb-8 text-center max-w-md">
      Arraste seu arquivo CSV de pedidos aqui ou clique para selecionar. 
      O sistema irá filtrar automaticamente as vendas dos últimos 30 dias.
    </p>
    <button className="btn btn-primary">Selecionar Arquivo CSV</button>
  </div>
);

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/clientes" element={<div className="glass p-6">Página de Clientes (Em breve)</div>} />
          <Route path="/loja" element={<div className="glass p-6">Página de Loja (Em breve)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
