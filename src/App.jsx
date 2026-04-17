import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import CSVImporter from './components/CSVImporter';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import CustomersPage from './pages/CustomersPage';
import StorePage from './pages/StorePage';
import LoginPage from './pages/LoginPage';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer, Download, History, Award, Users, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';

// Placeholder Pages
const Dashboard = () => {
  const [stats, setStats] = useState({ customers: 0, points: 0, redemptions: 0 });
  const [chartData, setChartData] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];

        // Total Clientes e Pontos
        const { data: orders } = await supabase
          .from('orders')
          .select('customer_name, points, points_remaining, order_date')
          .gte('order_date', isoThreshold);
        
        const uniqueCustomers = new Set(orders?.map(o => o.customer_name)).size;
        const totalPoints = orders?.reduce((acc, curr) => acc + (curr.points_remaining || 0), 0) || 0;

        // Gráfico de linha
        const dailyMap = {};
        orders?.forEach(o => {
          const date = o.order_date;
          dailyMap[date] = (dailyMap[date] || 0) + o.points;
        });
        const sortedDaily = Object.entries(dailyMap)
          .map(([date, pts]) => ({ date: date.split('-').slice(1).reverse().join('/'), pts }))
          .sort((a,b) => a.date.localeCompare(b.date));
        setChartData(sortedDaily);

        // Clientes com pontos expirando em 3 dias ou menos
        const today = new Date();
        today.setHours(0,0,0,0);
        const expiringMap = {};
        
        orders?.forEach(o => {
          const orderDate = new Date(o.order_date);
          orderDate.setHours(0,0,0,0);
          const expiryDate = new Date(orderDate);
          expiryDate.setDate(orderDate.getDate() + 30);
          
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (o.points_remaining > 0 && diffDays >= 0 && diffDays <= 3) {
            if (!expiringMap[o.customer_name]) {
              expiringMap[o.customer_name] = { 
                name: o.customer_name, 
                points: 0, 
                daysLeft: diffDays 
              };
            }
            expiringMap[o.customer_name].points += o.points_remaining;
            expiringMap[o.customer_name].daysLeft = Math.min(expiringMap[o.customer_name].daysLeft, diffDays);
          }
        });
        
        setExpiringSoon(Object.values(expiringMap).sort((a,b) => a.daysLeft - b.daysLeft));

        // Buscar contagem de resgates para o card de estatística
        const { count } = await supabase
          .from('redemptions')
          .select('*', { count: 'exact', head: true });

        setStats({
          customers: uniqueCustomers,
          points: totalPoints,
          redemptions: count || 0
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#00d2ff', '#3a7bd5', '#9d50bb'];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1,2,3].map(i => <div key={i} className="glass-card h-24 skeleton" />)}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 no-print sm:gap-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.05em] text-white">Análise Geral</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Fidelidade & Performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Clientes Ativos', value: stats.customers, delay: 0 },
          { label: 'Saldo em Pontos', value: stats.points.toLocaleString(), delay: 0.1 },
          { label: 'Resgates', value: stats.redemptions, delay: 0.15 },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: item.delay, duration: 0.8 }}
            className="glass px-4 py-3 sm:px-6 sm:py-4 border border-white/5 flex items-center gap-2 group hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}:</span>
            <span className="text-lg sm:text-xl font-black text-white">{item.value}</span>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <div className="glass-card" style={{ padding: '0', height: 'auto', minHeight: '400px', display: 'flex', flexDirection: 'column', borderRadius: '0', overflow: 'hidden' }}>
          {/* Header - Industrial Style */}
          <div style={{ padding: '20px 24px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} className="text-error animate-pulse" />
              <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Atenção: Pontos a Expirar</h3>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 10px', fontSize: '9px', fontWeight: 900, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {expiringSoon.length} EM RISCO
            </div>
          </div>

          {/* List Content */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {expiringSoon.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="dashboard-alert-item hover:bg-white/[0.05] group"
              >
                <div className="alert-icon" style={{ color: item.daysLeft === 0 ? 'var(--error)' : 'rgba(255, 255, 255, 0.2)' }}>
                  <Clock size={18} />
                </div>
                
                <div className="alert-name">
                  <p style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', margin: 0 }}>{item.name}</p>
                </div>

                <div className="alert-status" style={{ textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: '8px', 
                    fontWeight: 900, 
                    padding: '3px 6px', 
                    background: item.daysLeft === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: item.daysLeft === 0 ? 'var(--error)' : 'var(--text-muted)',
                    border: item.daysLeft === 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent'
                  }}>
                    {item.daysLeft === 0 ? 'EXPIRA HOJE' : `EM ${item.daysLeft} DIA${item.daysLeft > 1 ? 'S' : ''}`}
                  </span>
                </div>

                <div className="alert-points" style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>{item.points.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}

            {expiringSoon.length === 0 && (
              <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                <Award size={64} />
                <p style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', marginTop: '24px' }}>Nenhum ponto expirando</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadPage = () => {
  const [processedCustomers, setProcessedCustomers] = useState([]);
  const { syncOrders, loading, error: syncError } = useSupabaseSync();
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleDataProcessed = async (data) => {
    setProcessedCustomers(data);
    setSyncSuccess(false);
    
    const success = await syncOrders(data);
    if (success) {
      setSyncSuccess(true);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <CSVImporter onDataProcessed={handleDataProcessed} />
      
      {loading && (
        <div className="glass p-4 flex items-center justify-center gap-3 text-primary">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Sincronizando com Banco de Dados...</span>
        </div>
      )}

      {syncSuccess && (
        <div className="glass p-4 bg-success/10 border-success/20 text-success text-sm text-center">
          Dados sincronizados com sucesso no Supabase!
        </div>
      )}

      {syncError && (
        <div className="glass p-4 bg-error/10 border-error/20 text-error text-sm text-center">
          Erro ao sincronizar: {syncError}
        </div>
      )}

      {processedCustomers.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-bold mb-4">Prévia dos Dados ({processedCustomers.length} clientes encontrados)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-text-muted text-sm border-b border-border">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium text-right">Pontos Ganhos (30d)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {processedCustomers.slice(0, 10).map((customer, i) => (
                  <tr key={i}>
                    <td className="py-3">{customer.name}</td>
                    <td className="py-3 text-right font-bold text-primary">{customer.points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {processedCustomers.length > 10 && (
              <p className="mt-4 text-xs text-text-muted text-center italic">
                Mostrando os primeiros 10 clientes de {processedCustomers.length}...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage />
      </>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px'
          }
        }}
      />
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/loja" element={<StorePage />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </Router>
  );
};

export default App;
