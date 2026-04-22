import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncOrders = async (customers) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Coletar todos os pedidos processados em uma lista única
      const allOrders = customers.flatMap(customer => 
        customer.orders.map(order => {
          const datePart = order.date.split(' ')[0];
          const [day, month, year] = datePart.split('/');
          const isoDate = `${year}-${month}-${day}`;

          return {
            order_number: order.id,
            customer_name: customer.name,
            order_date: isoDate,
            points: order.points,
            points_remaining: order.points // Começa cheio
          };
        })
      );

      // 2. Inserir no Supabase (Upsert baseado no número do pedido)
      const { error: syncError } = await supabase
        .from('orders')
        .upsert(allOrders, { onConflict: 'order_number' });

      if (syncError) throw syncError;

      return true;
    } catch (err) {
      console.error('Erro na sincronização:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCustomerBalance = async (customerName) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoThreshold = thirtyDaysAgo.toISOString().split('T')[0];

      // NOVO: Soma apenas o que restou (points_remaining) nos últimos 30 dias
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('points_remaining')
        .eq('customer_name', customerName)
        .gte('order_date', isoThreshold);

      if (ordersError) throw ordersError;

      const totalAvailable = orders.reduce((acc, curr) => acc + curr.points_remaining, 0);
      return totalAvailable;
    } catch (err) {
      console.error('Erro ao buscar saldo:', err);
      return 0;
    }
  };

  const redeemPointsFIFO = async (customerName, productId, pointsToRedeem, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Chama a função inteligente do banco de dados (RPC)
      const { error: rpcError } = await supabase.rpc('redeem_points_fifo', {
        p_customer_name: customerName,
        p_product_id: productId,
        p_points_to_redeem: pointsToRedeem,
        p_quantity: quantity
      });

      if (rpcError) throw rpcError;
      return true;
    } catch (err) {
      console.error('Erro no resgate FIFO:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { syncOrders, getCustomerBalance, redeemPointsFIFO, loading, error };
};
