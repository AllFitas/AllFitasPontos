import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://ldgzzmnlyxyoxaouivos.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3p6bW5seXh5b3hhb3Vpdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjY5MjUsImV4cCI6MjA5MjAwMjkyNX0.gRQcsG1i0Ar966NcqWzrljFD33UKzlRTaTFRAQioGSk';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function checkRedemptions() {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, products(name)')
    .ilike('customer_name', '%INNOVARE%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching redemptions:', error);
    return;
  }

  console.log('Redemptions for INNOVARE:');
  console.table(data.map(r => ({
    id: r.id,
    customer: r.customer_name,
    product: r.products?.name,
    points: r.points_spent,
    qty: r.quantity,
    date: r.created_at
  })));
}

checkRedemptions();
