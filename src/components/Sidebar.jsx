import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Users, ShoppingBag, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/upload', icon: <Upload size={20} />, label: 'Importar CSV' },
    { path: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { path: '/loja', icon: <ShoppingBag size={20} />, label: 'Loja de Prêmios' },
  ];

  return (
    <aside className="glass flex-col p-6 w-64 h-[calc(100vh-2rem)] sticky top-4 ml-4">
      <div className="mb-8 px-2">
        <h2 className="gradient-text text-xl">All Fitas</h2>
        <p className="text-xs text-text-muted">Sistema de Pontos</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `btn flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-text-muted hover:bg-white/5 hover:text-text'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <button className="btn btn-outline w-full flex items-center gap-3">
          <Settings size={18} />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
