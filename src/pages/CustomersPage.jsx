import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Search, User, Award, ArrowRight, X, Clock, ShoppingBag, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryModal = ({ customer, onClose }) => {
  const [history, setHistory] = useState({ orders: [], redemptions: [] });
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ total: 0, used: 0, returned: 0, expired: 0, available: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Fetch ALL time orders (to calculate expired and total)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_name', customer.name)
        .order('order_date', { ascending: false });
      
      const { data: red } = await supabase
        .from('redemptions')
        .select('*, products(name)')
        .eq('customer_name', customer.name)
        .order('created_at', { ascending: false });

      const allOrders = orders || [];
      const allRedemptions = red || [];

      // 2. Calculations
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalAccumulated = allOrders.filter(o => o.points > 0).reduce((acc, o) => acc + o.points, 0);
      const totalReturned = allOrders.filter(o => o.points < 0).reduce((acc, o) => acc + Math.abs(o.points), 0);
      const totalUsed = allRedemptions.reduce((acc, r) => acc + r.points_spent, 0);
      
      // Expired: positive orders > 30 days that still have points_remaining
      const expired = allOrders
        .filter(o => o.points > 0 && new Date(o.order_date) < thirtyDaysAgo)
        .reduce((acc, o) => acc + o.points_remaining, 0);
      
      const available = Math.max(0, totalAccumulated - totalUsed - totalReturned - expired);

      setMetrics({ total: totalAccumulated, used: totalUsed, returned: totalReturned, expired, available });
      setHistory({ orders: allOrders, redemptions: allRedemptions });
      setLoading(false);
    };
    fetchHistory();
  }, [customer]);

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/60"
      style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="glass shadow-2xl border-white/10 flex flex-col"
        style={{ 
          width: 'min(700px, 95vw)', 
          height: 'min(700px, 90vh)', 
          overflow: 'hidden', 
          borderRadius: '0' 
        }}
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-center bg-white/[0.03]" style={{ position: 'relative' }}>
          <h3 className="text-lg font-black tracking-tight text-white uppercase text-center">{customer.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all" style={{ position: 'absolute', right: '16px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-6 custom-scrollbar" style={{ overflowY: 'auto' }}>
          
          {/* Metrics Dashboard - Responsive Grid */}
          <div className="history-metrics-grid" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
            {[
              { label: 'ACUMULADO', value: metrics.total },
              { label: 'USADO', value: metrics.used },
              { label: 'DEVOLVIDO', value: metrics.returned, isReturn: true },
              { label: 'EXPIRADO', value: metrics.expired },
              { label: 'SALDO', value: metrics.available, highlight: true },
            ].map((m, i) => (
              <div key={i} className={`p-4 flex flex-col items-center justify-center ${i < 4 ? 'border-r border-white/5' : ''} ${m.highlight ? 'bg-primary/5' : ''}`}>
                <p className="text-[7px] font-black text-white/30 tracking-widest mb-1.5 text-center">{m.label}</p>
                <p className={`text-base font-black text-center ${m.highlight ? 'text-primary' : m.isReturn ? 'text-error' : 'text-white'}`}>{m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 16px', borderLeft: '2px solid var(--primary)', textAlign: 'center' }}>
              <h4 className="text-[9px] font-black uppercase tracking-widest text-white/70">Extrato de Movimentações</h4>
            </div>
            
            <div style={{ border: '1px solid rgba(255, 255, 255, 0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 900 }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Evento</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Data</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Valor</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Resp.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                    {/* Orders */}
                    {history.orders.map((o, i) => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      const isExpired = o.points > 0 && new Date(o.order_date) < thirtyDaysAgo;
                      const isReturn = o.points < 0;
                      return (
                        <tr key={`o-${i}`} className="hover:bg-white/[0.04] transition-colors">
                          <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: isReturn ? 'var(--error)' : 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
                            <span className="block text-center">{isReturn ? `Devolução #${o.order_number}` : `Pedido #${o.order_number}`}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                            <span className="block text-center">{new Date(o.order_date).toLocaleDateString()}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: isReturn ? 'var(--error)' : 'var(--success)', fontWeight: 900 }}>
                            <span className="block text-center">{o.points > 0 ? `+${o.points}` : o.points}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, fontSize: '12px', borderRight: '1px solid rgba(255,255,255,0.05)', color: isReturn ? 'var(--error)' : (o.points_remaining > 0 ? (isExpired ? 'var(--error)' : 'var(--primary)') : 'rgba(255,255,255,0.1)') }}>
                            <span className="block text-center">{isReturn ? 'DEBITADO' : (o.points_remaining > 0 ? (isExpired ? 'EXP.' : `${o.points_remaining} DISP.`) : 'USADO')}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>
                            <span className="block text-center">{o.processed_by || 'SISTEMA'}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Redemptions */}
                    {history.redemptions.map((r, i) => (
                      <tr key={`r-${i}`} className="bg-indigo-500/[0.05] hover:bg-indigo-500/[0.1] transition-colors">
                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: '#a5b4fc', fontWeight: 'bold' }}>
                          <span className="block text-center text-[10px]">Resgate: {r.products?.name || 'Prêmio'}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: 'rgba(165,180,252,0.3)' }}>
                          <span className="block text-center">{new Date(r.created_at).toLocaleDateString()}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', color: '#818cf8', fontWeight: 900 }}>
                          <span className="block text-center">-{r.points_spent}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 900, fontSize: '12px', borderRight: '1px solid rgba(255,255,255,0.05)', color: 'rgba(129,140,248,0.2)' }}>
                          <span className="block text-center">RESGATADO</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '10px', color: 'rgba(129,140,248,0.4)', fontWeight: 'bold' }}>
                          <span className="block text-center">{r.processed_by || 'SISTEMA'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{ __html: `
        .history-metrics-grid { display: grid; grid-template-columns: repeat(5, 1fr); }
        @media (max-width: 640px) {
          .history-metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}} />
    </motion.div>,
    document.body
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, points_remaining')
        .gte('order_date', isoThreshold);
      
      const customerMap = {};
      orders?.forEach(order => {
        if (!customerMap[order.customer_name]) {
          customerMap[order.customer_name] = { name: order.customer_name, balance: 0 };
        }
        customerMap[order.customer_name].balance += order.points_remaining;
      });

      setCustomers(Object.values(customerMap).sort((a, b) => b.balance - a.balance));
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-8 no-print">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.05em] text-white">Gestão de Clientes</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Base de Lealdade Ativa
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="PROCURAR CLIENTE PELO NOME..." 
              className="pl-16 pr-8 py-5 w-full text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="glass overflow-hidden">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.4)' }}>Cliente</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255, 255, 255, 0.4)' }}>Saldo Disponível</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan="3" style={{ padding: '24px' }}><div className="h-8 w-full bg-white/5 animate-pulse rounded" /></td></tr>
                ))
              ) : filteredCustomers.map((customer, i) => (
                <motion.tr 
                  key={i} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-all group"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td style={{ padding: '20px 24px' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <User size={18} />
                      </div>
                      <span className="font-bold text-sm text-white/80 uppercase">{customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">{customer.balance.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">PTS</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/loja', { state: { selectedCustomer: customer.name } }); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-primary/50 hover:bg-primary hover:text-white rounded-full text-primary font-black text-[10px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_var(--primary-glow)] group/btn"
                      >
                        <ShoppingBag size={14} className="group-hover/btn:scale-110 transition-transform" /> 
                        <span>Resgatar</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-full text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                      >
                        <Clock size={14} />
                        <span>Histórico</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredCustomers.length === 0 && (
          <div className="p-20 text-center space-y-4 opacity-40">
            <User size={40} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest text-white">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <HistoryModal 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomersPage;
