import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      // Mapping username to email as discussed with admin
      const email = `${username.toLowerCase().trim()}@allfitas.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Bem-vindo ao sistema!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '24px', position: 'relative', overflow: 'hidden', background: '#020617', justifyContent: 'center' }}>
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(120px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '50%', filter: 'blur(120px)' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}
      >
        <div className="glass-card" style={{ padding: '48px', borderRadius: '0', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(10, 15, 31, 0.8)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
              <LogIn size={42} strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#fff', margin: 0 }}>All Fitas</h1>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px', color: 'rgba(255, 255, 255, 0.3)', marginTop: '8px' }}>Acesso Restrito</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.4)' }}>Usuário</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.2)' }} />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px 14px 14px 44px', color: '#fff', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.4)' }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.2)' }} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '14px 14px 14px 44px', color: '#fff', fontSize: '14px', fontWeight: 700, outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                background: 'var(--primary)', 
                color: '#fff', 
                border: 'none', 
                padding: '16px', 
                fontSize: '12px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                cursor: 'pointer', 
                transition: 'all 0.3s',
                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.2)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; e.target.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Sistema
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255, 255, 255, 0.2)', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>Sistema Interno All Fitas v2.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
