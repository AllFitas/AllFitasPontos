import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen p-4 gap-4">
      <Sidebar />
      <main className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <header className="glass p-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Bem-vindo, Lojista</h1>
            <p className="text-sm text-text-muted">Gerencie os pontos dos seus clientes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs font-medium">Sistema Online</span>
            </div>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
