import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ConfirmationModal = ({ customer, product, onConfirm, onCancel, loading }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl"
  >
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="glass w-full max-w-[480px] p-6 sm:p-10 space-y-6 sm:space-y-8 rounded-3xl sm:rounded-[2.5rem] border-white/5 shadow-2xl"
    >
      <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-white">
        <ShoppingBag size={34} />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black tracking-tighter text-white">Confirmar Resgate?</h3>
        <p className="text-sm text-text-muted font-medium px-4">
          Você irá resgatar <span className="text-white font-bold">{product.name}</span> para <span className="text-white font-bold">{customer.name}</span> por <span className="text-white font-black">{product.points_required.toLocaleString()} PTS</span>.
        </p>
      </div>

      <div className="flex gap-4 pt-10">
        <button 
          onClick={onCancel} disabled={loading}
          className="btn btn-ghost flex-1 py-4 text-xs font-black uppercase tracking-widest border-white/5"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm} disabled={loading}
          className="btn btn-primary flex-1 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-white/5"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Processar Resgate'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const StorePage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { redeemPointsFIFO, loading: isProcessing } = useSupabaseSync();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: prodData } = await supabase.from('products').select('*');
    const { data: orderData } = await supabase
      .from('orders')
      .select('customer_name, points_remaining')
      .gte('order_date', isoThreshold)
      .gt('points_remaining', 0);

    setProducts(prodData || []);

    const customerMap = {};
    orderData?.forEach(o => {
      if (!customerMap[o.customer_name]) customerMap[o.customer_name] = { name: o.customer_name, balance: 0 };
      customerMap[o.customer_name].balance += o.points_remaining;
    });

    const customerList = Object.values(customerMap).filter(c => c.balance > 0);
    setCustomers(customerList);

    if (location.state?.selectedCustomer) {
      const found = customerList.find(c => c.name === location.state.selectedCustomer);
      if (found) setSelectedCustomer(found);
    }
    setLoading(false);
  };

  const handleRedeem = async () => {
    try {
      const success = await redeemPointsFIFO(
        selectedCustomer.name, 
        selectedProduct.id, 
        selectedProduct.points_required
      );

      if (!success) throw new Error('Falha no processamento');

      toast.success('Resgate efetuado com sucesso!', { 
        icon: '💎',
        style: { borderRadius: '24px', background: '#020617', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      
      setShowConfirm(false);
      setSelectedProduct(null);
      fetchData();
    } catch (err) {
      toast.error('Ocorreu um erro técnico.');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-20">
      <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 no-print mb-8 sm:mb-16">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.05em] text-white">Loja de Prêmios</h2>
        </div>
        <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] opacity-60">
          {!selectedCustomer ? 'Passo 1: Selecione o Cliente' : 'Passo 2: Escolha o Prêmio'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCustomer ? (
          <motion.div 
            key="customer-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-xl mx-auto w-full space-y-8"
          >
            <div className="glass-card !p-6 sm:!p-12 space-y-6 sm:space-y-10 border-primary/10 shadow-[0_0_80px_rgba(59,130,246,0.05)]">
              <div className="relative group/search">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/search:text-primary transition-colors duration-500" size={20} />
                <input 
                  type="text" 
                  placeholder="PROCURAR CLIENTE..." 
                  className="pl-14 sm:pl-16 pr-6 sm:pr-8 py-4 sm:py-5 w-full text-xs sm:text-sm font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedCustomer(c)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-white/[0.03] hover:bg-primary/[0.08] transition-all border border-white/5 hover:border-primary/20 group text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">{c.name}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-wider">Saldo Ativo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-black text-primary">{c.balance.toLocaleString()}</p>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">PONTOS</p>
                    </div>
                  </button>
                )) : (
                  <div className="py-12 text-center">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">Nenhum cliente com saldo</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="product-step"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            {/* Selected Customer Banner - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-card !p-6 sm:!p-8 border-primary/20 bg-primary/5">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group cursor-pointer" onClick={() => setSelectedCustomer(null)}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full sm:rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <User size={20} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Cliente Selecionado</p>
                  <p className="text-lg sm:text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2 uppercase">
                    {selectedCustomer.name}
                    <X size={14} className="text-white/20 group-hover:text-error" />
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 sm:bg-transparent border sm:border-none border-primary/20 rounded-2xl sm:rounded-none px-6 py-4 sm:p-0 text-center sm:text-right w-full sm:w-auto">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60">Saldo em Conta</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{selectedCustomer.balance.toLocaleString()} <span className="text-xs sm:text-sm text-primary/40">PTS</span></p>
              </div>
            </div>

            {/* Product Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {products.map((p, i) => {
                const canAfford = selectedCustomer.balance >= p.points_required;
                return (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass p-6 sm:p-10 flex flex-col items-center text-center gap-6 sm:gap-8 border-white/5 relative overflow-hidden group ${!canAfford ? 'grayscale opacity-60' : 'hover:border-primary/30'}`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <ShoppingBag size={28} sm:size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{p.name}</h4>
                      <div className="flex flex-col items-center">
                        <span className="text-xl sm:text-2xl font-black text-primary">{p.points_required.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Custo em Pontos</span>
                      </div>
                    </div>
                    
                    <button
                      disabled={!canAfford}
                      onClick={() => { setSelectedProduct(p); setShowConfirm(true); }}
                      className={`w-full py-4 sm:py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${canAfford ? 'bg-primary/10 hover:bg-primary text-primary hover:text-white' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
                    >
                      {canAfford ? 'Resgatar Agora' : 'Saldo Insuficiente'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <ConfirmationModal 
            customer={selectedCustomer}
            product={selectedProduct}
            loading={isProcessing}
            onConfirm={handleRedeem}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StorePage;
