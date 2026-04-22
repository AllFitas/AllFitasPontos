import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, CheckCircle, AlertCircle, Loader2, X, Minus, Plus, Zap } from 'lucide-react';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SquareRedeemModal = ({ customer, cart, onConfirm, onCancel, loading }) => {
  const totalCost = cart.reduce((acc, item) => acc + (item.points_required * item.quantity), 0);
  
  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)', padding: '20px'
      }}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        style={{ borderRadius: '0', border: '1px solid rgba(255,255,255,0.1)' }}
        className="glass-card !p-10 flex flex-col items-center gap-8 max-w-[400px] w-full shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <ShoppingBag size={32} />
        </div>

        <div className="text-center space-y-4 w-full">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Confirmar Carrinho</h3>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] opacity-60 mt-1">Resumo do Pedido</p>
          </div>

          <div className="bg-white/[0.03] rounded-2xl p-6 space-y-4 border border-white/5">
            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-white/60 truncate pr-4 text-left">{item.quantity}x {item.name}</span>
                  <span className="text-primary whitespace-nowrap">{ (item.points_required * item.quantity).toLocaleString() } PTS</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Total Geral</span>
              <span className="text-lg font-black text-white shadow-primary-glow">{ totalCost.toLocaleString() } PTS</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/5 py-3 rounded-xl border border-white/5">
            <User size={14} className="text-primary" />
            <span className="text-[10px] font-black text-white uppercase truncate px-2">{customer.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 w-full gap-3 mt-2">
          <button 
            onClick={onConfirm} 
            disabled={loading}
            style={{ backgroundColor: '#000', color: '#fff', borderRadius: '0', border: '1px solid rgba(255,255,255,0.1)' }}
            className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} className="text-primary" />}
            {loading ? 'PROCESSANDO...' : 'CONFIRMAR TUDO'}
          </button>
          <button 
            onClick={onCancel} 
            disabled={loading}
            style={{ backgroundColor: '#000', color: '#fff', borderRadius: '0', border: '1px solid rgba(255,255,255,0.05)' }}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all disabled:opacity-50"
          >
            CANCELAR
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const IndustrialFitasModal = ({ isOpen, onClose, cart, customer, onUpdateQuantity, onRemove, onFinalize, loading }) => {
  const totalCost = cart.reduce((acc, item) => acc + (item.points_required * item.quantity), 0);
  const remaining = customer ? customer.balance - totalCost : 0;
  const isOverLimit = customer && remaining < 0;

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} 
    >
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', backgroundColor: 'rgba(0,0,0,0.95)' }}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }}
        style={{ 
          width: 'min(620px, 95vw)', 
          height: 'min(680px, 90vh)', 
          backgroundColor: '#050505', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        className="shadow-[0_50px_200px_rgba(0,0,0,1)]"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        `}} />
        {/* Global Close Button - OUTSIDE the header flow */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 9999 }}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={20} />
        </button>

        {/* Header - Industrial Style */}
        <div className="px-8 py-8 border-b border-white/10 flex flex-col items-center justify-center bg-white/[0.02] relative">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] text-center">RESUMO DO RESGATE</h3>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">{cart.length} materiais selecionados</p>
        </div>

        {/* Content Section - Horizontal Row Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-black">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <ShoppingBag size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">O carrinho está<br/>vazio no momento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} 
                  className="px-6 py-4 flex items-center justify-between group hover:border-white/10 transition-all gap-4"
                >
                  {/* Name & Sub-info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-wider truncate group-hover:text-primary transition-colors leading-none">{item.name}</p>
                    <p style={{ fontSize: '8px' }} className="text-white/20 font-black uppercase tracking-[0.3em] mt-1.5">
                      {item.points_required.toLocaleString()} PTS / UN
                    </p>
                  </div>


                  {/* Total Points for this item */}
                  <div className="text-right px-4 shrink-0">
                    <span className="text-[13px] font-black text-primary">{(item.points_required * item.quantity).toLocaleString()}</span>
                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest ml-1.5">PTS</span>
                  </div>

                  {/* Quantity Selector - Editable */}
                  <div className="flex items-center shrink-0">
                    <div style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} className="flex items-center rounded-none overflow-hidden">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)} 
                        style={{ width: '36px', height: '36px' }}
                        className="flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all font-black border-r border-white/10 rounded-none"
                      >
                        <Minus size={12} />
                      </button>
                      <input 
                        type="text"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const num = parseInt(val) || 0;
                          onUpdateQuantity(item.id, num - item.quantity);
                        }}
                        style={{ width: '45px', textAlign: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', fontWeight: '900', outline: 'none' }}
                        className="appearance-none m-0"
                      />
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)} 
                        style={{ width: '36px', height: '36px' }}
                        className="flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all font-black border-l border-white/10 rounded-none"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button - Standardized Industrial Format & Color */}
                  <button 
                    onClick={() => onRemove(item.id)} 
                    style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} 
                    className="flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0 rounded-none ml-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Sumary - Industrial Metrics Style */}
        <div className="p-8 border-t border-white/10 bg-white/[0.02] space-y-6">
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div className="p-4 flex flex-col items-center justify-center border-r border-white/5">
              <p className="text-[7px] font-black text-white/30 tracking-widest mb-1 uppercase">Custo Total</p>
              <p className="text-xl font-black text-white">{totalCost.toLocaleString()} <span className="text-[10px] text-primary">PTS</span></p>
            </div>
            <div className={`p-4 flex flex-col items-center justify-center ${isOverLimit ? 'bg-error/5' : 'bg-primary/5'}`}>
              <p className="text-[7px] font-black text-white/30 tracking-widest mb-1 uppercase">Saldo Final</p>
              <p className={`text-xl font-black ${isOverLimit ? 'text-error' : 'text-primary'}`}>{remaining.toLocaleString()} <span className="text-[10px] opacity-40">PTS</span></p>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={onFinalize}
            disabled={isOverLimit || !customer || loading || cart.length === 0}
            style={{ height: '60px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59, 130, 246, 0.4)' }}
            className={`w-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${
              isOverLimit || !customer || loading || cart.length === 0
              ? 'opacity-20 grayscale cursor-not-allowed'
              : 'text-white hover:bg-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)]'
            }`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} className="text-primary" />}
            {loading ? 'Processando...' : 'CONFIRMAR CARRINHO'}
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
const MaterialRow = ({ product, cartItem, remainingBudget, selectedCustomer, onSetQuantity }) => {
  const [draftQty, setDraftQty] = useState(cartItem ? cartItem.quantity : 0);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  useEffect(() => {
    if (quantityInCart > 0 && draftQty === 0) setDraftQty(quantityInCart);
  }, [quantityInCart]);

  const canAffordOneMore = remainingBudget >= product.points_required;

  const handleMaxLocal = () => {
    if (!selectedCustomer) { toast.error('Selecione um cliente'); return; }
    const additionalPossible = Math.floor(remainingBudget / product.points_required);
    if (additionalPossible <= 0 && quantityInCart === 0) {
      toast.error('Saldo insuficiente');
      return;
    }
    setDraftQty(quantityInCart + Math.max(0, additionalPossible));
  };

  const handleApply = () => {
    if (draftQty === quantityInCart && draftQty > 0) { toast.error('Esta quantidade já está no pedido'); return; }
    onSetQuantity(product, draftQty);
    if (draftQty > 0) toast.success(`${draftQty}x ${product.name} no pedido`);
    else toast.success('Removido do pedido');
  };

  const isChanged = draftQty !== quantityInCart;

  // Um item só está "bloqueado total" se não estiver no carrinho E não houver saldo para ele
  const isFullyLocked = selectedCustomer && !canAffordOneMore && quantityInCart === 0;
  
  // Se estiver no carrinho mas não houver saldo para MAIS, desabilitamos o aumento
  const cannotIncrease = selectedCustomer && !canAffordOneMore;

  return (
    <motion.tr 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className={`transition-colors hover:bg-white/[0.02] group ${quantityInCart > 0 ? 'bg-primary/[0.04]' : ''} ${isFullyLocked ? 'opacity-20 grayscale pointer-events-none' : ''}`}
    >
      <td className="py-5 text-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="flex items-center justify-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${quantityInCart > 0 ? 'bg-primary text-white shadow-primary-glow scale-110' : 'bg-white/5 text-primary group-hover:scale-105'}`}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
            <AnimatePresence>
              {quantityInCart > 0 && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block"
                >
                  No pedido: {quantityInCart}x
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
      
      <td className="py-5 px-4 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[13px] font-black text-primary">{product.points_required.toLocaleString()}</span>
          <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">PTS</span>
        </div>
      </td>

      <td className="py-5" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px' }} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              {/* Controle de Quantidade */}
              <div style={{ height: '36px' }} className={`flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl transition-all ${isChanged ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/[0.02]' : ''}`}>
                <button 
                  onClick={() => setDraftQty(q => Math.max(0, q - 1))}
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex items-center justify-center text-white hover:bg-white/10 border-r border-white/10 rounded-l-xl transition-all"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <input 
                  type="text" 
                  value={draftQty} 
                  onChange={e => {
                    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                    // Se tentar aumentar sem saldo, avisamos
                    if (val > draftQty && cannotIncrease) {
                      toast.error('Saldo insuficiente para aumentar', { id: 'budget-limit' });
                    } else {
                      setDraftQty(val);
                    }
                  }}
                  style={{ width: '60px' }}
                  className="bg-transparent border-none text-center text-sm font-black text-white p-0 focus:ring-0"
                />
                <button 
                  onClick={() => setDraftQty(q => q + 1)}
                  disabled={cannotIncrease}
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className={`flex items-center justify-center border-l border-white/10 rounded-r-xl transition-all ${cannotIncrease ? 'opacity-20 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleMaxLocal}
                disabled={cannotIncrease && quantityInCart === 0}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', height: '36px' }}
                className={`px-6 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${cannotIncrease && quantityInCart === 0 ? 'opacity-20 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
              >
                <Zap size={12} className="fill-current" />
                MAX
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={!isChanged && quantityInCart === 0}
                style={{ 
                  height: '36px', 
                  backgroundColor: isChanged ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)' 
                }}
                className={`px-8 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border ${
                  isChanged 
                  ? 'border-primary/50 text-white shadow-lg shadow-primary/10' 
                  : 'border-white/5 text-white/60 cursor-not-allowed'
                }`}
              >
                <CheckCircle size={14} className={isChanged ? "text-white" : "text-white/30"} />
                {quantityInCart > 0 ? 'ATUALIZAR' : 'ADD'}
              </motion.button>
            </div>
            
            {/* Mensagem de Saldo (Opcional, apenas se estiver no limite) */}
            {cannotIncrease && quantityInCart > 0 && (
              <span className="text-[8px] font-black text-error uppercase tracking-widest animate-pulse">
                Saldo insuficiente para adicionar mais
              </span>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

const StorePage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { redeemPointsFIFO, loading: isProcessing } = useSupabaseSync();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: orderData } = await supabase
      .from('orders')
      .select('customer_name, points_remaining');

    setProducts(prodData || []);

    const customerMap = {};
    orderData?.forEach(o => {
      if (!customerMap[o.customer_name]) customerMap[o.customer_name] = { name: o.customer_name, balance: 0 };
      customerMap[o.customer_name].balance += o.points_remaining;
    });

    const customerList = Object.values(customerMap).sort((a, b) => b.balance - a.balance);
    setCustomers(customerList);

    if (location.state?.selectedCustomer) {
      const found = customerList.find(c => c.name === location.state.selectedCustomer);
      if (found) setSelectedCustomer(found);
    }
    setLoading(false);
  };

  const setCartQuantity = (product, quantity) => {
    const requestedQty = Math.max(0, quantity);
    
    // Check budget and show alert, but allow adding to cart
    const otherItemsCost = cart
      .filter(item => item.id !== product.id)
      .reduce((acc, item) => acc + (item.points_required * item.quantity), 0);
    
    const balance = selectedCustomer ? selectedCustomer.balance : Infinity;
    const totalWithNew = otherItemsCost + (product.points_required * requestedQty);
    
    if (selectedCustomer && totalWithNew > balance && requestedQty > 0) {
      toast.error(`Atenção: Saldo insuficiente para esta quantidade!`, { 
        id: 'budget-error',
        icon: '⚠️',
        style: { background: '#7f1d1d', color: '#fff', border: '1px solid #dc2626' }
      });
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (requestedQty === 0) return prev.filter(item => item.id !== product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: requestedQty } : item);
      return [...prev, { ...product, quantity: requestedQty }];
    });
  };

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const itemInCart = cart.find(item => item.id === productId);
    const currentQty = itemInCart ? itemInCart.quantity : 0;
    setCartQuantity(product, currentQty + delta);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleRedeem = async () => {
    try {
      for (const item of cart) {
        const totalPoints = item.points_required * item.quantity;
        // redeemPointsFIFO returns a boolean true/false
        const success = await redeemPointsFIFO(selectedCustomer.name, item.id, totalPoints, item.quantity);
        if (!success) throw new Error(`Falha ao resgatar item: ${item.name}`);
      }
      
      // Full screen reset - Immediate response
      setShowConfirm(false);
      setIsCartOpen(false);
      setCart([]);
      setSelectedCustomer(null);
      
      toast.success('Todos os resgates efetuados com sucesso!', { 
        icon: '💎',
        style: { borderRadius: '2px', background: '#050505', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      
      await fetchData();
    } catch (err) {
      console.error('Redeem Error:', err);
      toast.error('Ocorreu um erro no processamento. Verifique se o saldo é suficiente.');
    }
  };

  const totalCartCost = cart.reduce((acc, item) => acc + (item.points_required * item.quantity), 0);
  const remainingBudget = selectedCustomer ? selectedCustomer.balance - totalCartCost : 0;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20 flex flex-col items-center w-full min-h-[80vh] justify-start relative px-4">
      
      {/* TOP SECTION: Header + Global Selector (High Stacking Context) */}
      <div className="w-full relative z-[100] flex flex-col items-center">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 no-print mb-4 mt-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_20px_var(--primary-glow)]" />
            <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.05em] text-white uppercase">Loja de Prêmios</h2>
          </div>
          <p className="text-[10px] sm:text-xs text-text-muted font-bold uppercase tracking-[0.2em] opacity-60">
            Gerenciamento horizontal de materiais
          </p>
        </div>

      {/* NEW: Global Customer Selector at the Top */}
      <div className="w-full max-w-4xl mx-auto z-[200] space-y-4 relative">
        {!selectedCustomer ? (
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-all" size={20} />
            <input 
              type="text" 
              placeholder="PESQUISAR CLIENTE PARA RESGATE..." 
              className="pl-16 pr-6 py-6 w-full text-[11px] font-black tracking-[0.2em] bg-white/[0.02] border border-white/5 rounded-2xl focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all outline-none uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <AnimatePresence>
              {searchTerm && (
                <motion.div 
                  key="customer-results-solid-final"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  style={{ 
                    backgroundColor: '#000000', 
                    opacity: 1, 
                    zIndex: 1000000,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    overflowY: 'auto',
                    maxHeight: '450px',
                    boxShadow: '0 40px 100px rgba(0,0,0,1)',
                    pointerEvents: 'auto',
                    touchAction: 'pan-y'
                  }}
                  className="custom-scrollbar transform-gpu"
                >
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setSelectedCustomer(c); setSearchTerm(''); }}
                        style={{ backgroundColor: 'transparent', padding: '22px 24px' }}
                        className="w-full flex items-center hover:bg-white/10 transition-all border-b border-white/[0.05] last:border-0 group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-all">
                          <User size={18} style={{ color: '#00ffff' }} />
                        </div>
                        <div className="flex-1">
                          <p style={{ color: '#ffff00', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase' }}>{c.name}</p>
                          <p style={{ color: '#00ff00', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>{c.balance.toLocaleString()} PTS DISPONÍVEIS</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div style={{ color: 'rgba(255,255,255,0.3)', padding: '40px', textAlign: 'center', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Nenhum cliente cadastrado</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Active Customer Panel */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
            <div className="glass-card !p-5 border-primary/30 bg-primary/5 flex items-center justify-between gap-6 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-0.5">Cliente Ativo</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{selectedCustomer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-0.5">Saldo Disponível</p>
                  <p className={`text-base font-black ${remainingBudget < 0 ? 'text-error' : 'text-primary shadow-primary-glow font-black'}`}>
                    {remainingBudget.toLocaleString()} <span className="text-[10px] opacity-40">PTS</span>
                  </p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                {/* v2.6 Final Sync */}
                <button 
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCart([]);
                  }}
                  style={{ height: '36px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                  className="px-6 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/10"
                >
                  <X size={14} /> ALTERAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Cart Summary - Tighter padding */}
      {cart.length > 0 && (
        <div className="sticky top-0 z-30 w-full max-w-4xl pt-2">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card !p-3 border-primary/40 bg-primary/10 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4 ml-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <ShoppingBag size={14} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{cart.length} materiais no pedido</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[8px] font-black uppercase text-white/40 block tracking-widest">Total do Resgate</span>
                <span className="text-sm font-black text-white">
                  {totalCartCost.toLocaleString()} <span className="text-[9px] text-primary">PTS</span>
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(true)} 
                style={{ height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                className="px-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <ShoppingBag size={14} className="text-primary" />
                Finalizar Pedido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>

      {/* BOTTOM SECTION: Integrated Material Data Grid (Negative Z to stay below search) */}
      <div className="w-full relative z-[-1] mt-12 border-t border-white/[0.03] bg-white/[0.01]">
        <div className="w-full max-w-6xl mx-auto border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse bg-black/20">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Material</th>
                <th className="py-6 px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Pontos / Un</th>
                <th className="py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Ações de Resgate</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <MaterialRow 
                  key={p.id}
                  product={p}
                  cartItem={cart.find(item => item.id === p.id)}
                  remainingBudget={remainingBudget}
                  selectedCustomer={selectedCustomer}
                  onSetQuantity={setCartQuantity}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        <IndustrialFitasModal 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          customer={selectedCustomer}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onFinalize={() => {
            if (selectedCustomer) {
              setShowConfirm(true);
              setIsCartOpen(false);
            } else {
              toast.error('Selecione um cliente');
            }
          }}
          loading={isProcessing}
        />
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <SquareRedeemModal 
            customer={selectedCustomer}
            cart={cart}
            onConfirm={handleRedeem}
            onCancel={() => setShowConfirm(false)}
            loading={isProcessing}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StorePage;
