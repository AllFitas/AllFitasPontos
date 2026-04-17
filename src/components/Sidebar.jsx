import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, Users, ShoppingBag, Settings, Award, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Painel' },
    { path: '/upload', icon: Upload, label: 'Importar' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/loja', icon: ShoppingBag, label: 'Loja' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar-wrapper no-print m-only-hide">
        <div className="sidebar-panel">
          <div className="p-0 mb-0 overflow-hidden" style={{ borderRadius: '2.5rem 2.5rem 0 0', position: 'relative' }}>
            <div className="flex flex-col items-center">
              <img 
                src={logo} 
                alt="All Fitas Logo" 
                className="w-full h-auto transition-all duration-500 hover:scale-105"
                style={{ marginTop: '-75px', marginBottom: '-40px' }}
              />
            </div>
          </div>

          <nav className="flex-1 p-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                  </div>
                  <span>{item.label === 'Painel' ? 'Painel de Controle' : item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) toast.error('Erro ao sair');
              }}
              className="nav-item"
              style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginTop: '8px', color: 'rgba(239, 68, 68, 0.6)' }}
            >
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="m-only-show no-print" style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: '70px', 
        background: 'rgba(10, 15, 31, 0.85)', 
        backdropFilter: 'blur(20px)', 
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        padding: '0 10px'
      }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s'
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'rgba(239, 68, 68, 0.6)',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Sair</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 769px) {
          main { padding-bottom: 0 !important; }
          .w-full.flex-1 { padding: 2rem !important; }
          .m-only-show { display: none !important; }
        }
        @media (max-width: 768px) {
          .m-only-hide { display: none !important; }
          .sidebar-wrapper { display: none; }
        }
      `}} />
    </>
  );
};

export default Sidebar;
