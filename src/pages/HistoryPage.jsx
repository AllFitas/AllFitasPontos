import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { History, Package, User, Clock, Search, Loader2 } from 'lucide-react';

const HistoryPage = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouping logic (same customer, same product, same minute)
      const grouped = (data || []).reduce((acc, current) => {
        const date = new Date(current.created_at);
        const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        const key = `${minuteKey}_${current.customer_name}_${current.product_id}`;
        
        if (!acc[key]) {
          acc[key] = { ...current };
        } else {
          acc[key].quantity = (acc[key].quantity || 0) + (current.quantity || 1);
          acc[key].points_spent = (acc[key].points_spent || 0) + (current.points_spent || 0);
        }
        return acc;
      }, {});

      setRedemptions(Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = redemptions.filter(r => 
    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8 pb-20"
    >
      {/* Header Industrial */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.05em] text-white uppercase">Histórico</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-5">
            Registro Cronológico de Saídas de Materiais
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="BUSCAR NO HISTÓRICO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 py-4 pl-12 pr-6 text-[11px] font-black tracking-widest text-white uppercase focus:outline-none focus:border-primary/30 transition-all rounded-none"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card !p-0 overflow-hidden rounded-none border border-white/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-white/[0.05]">
                <th style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-center">Data</th>
                <th style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-center">Material / Produto</th>
                <th style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-center">Cliente</th>
                <th style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-center">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-32 text-center text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={24} className="text-primary animate-spin" />
                      <span>Processando Histórico...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((r, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    key={r.id} 
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* DATA */}
                    <td style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-white/80 leading-none">
                          {new Date(r.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[8px] font-bold text-white/20 mt-1">
                          {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* MATERIAL */}
                    <td style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                          {r.products?.name || 'MATERIAL EXCLUÍDO'}
                        </span>
                      </div>
                    </td>

                    {/* CLIENTE */}
                    <td style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white/40 uppercase">
                          {r.customer_name}
                        </span>
                      </div>
                    </td>

                    {/* QUANTIDADE */}
                    <td style={{ border: '1px solid rgba(255,255,255,0.15)' }} className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[14px] font-black text-white leading-none">
                          {r.quantity || 1} <span className="text-[8px] text-white/30 tracking-widest font-bold">UN</span>
                        </span>
                        <span className="text-[8px] font-black text-primary/40 mt-1 uppercase tracking-tighter">
                          -{r.points_spent.toLocaleString()} PTS
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History size={48} />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Nenhum Registro Encontrado</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryPage;
