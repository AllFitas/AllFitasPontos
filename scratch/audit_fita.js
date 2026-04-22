import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://ldgzzmnlyxyoxaouivos.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3p6bW5seXh5b3hhb3Vpdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjY5MjUsImV4cCI6MjA5MjAwMjkyNX0.gRQcsG1i0Ar966NcqWzrljFD33UKzlRTaTFRAQioGSk';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function auditFitaBranca() {
  const { data: products } = await supabase.from('products').select('*').ilike('name', 'Fita Branca');
  const fitaId = products[0].id;

  const { data: redemptions, error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('product_id', fitaId);

  if (error) {
    console.error(error);
    return;
  }

  const needsFix = redemptions.filter(r => r.points_spent !== (r.quantity * 1000));
  
  console.log('Redemptions needing fix (Price is not 1000):');
  console.table(needsFix.map(r => ({
    id: r.id,
    customer: r.customer_name,
    actual_pts: r.points_spent,
    qty: r.quantity,
    should_be: r.quantity * 1000,
    diff: r.points_spent - (r.quantity * 1000)
  })));
}

auditFitaBranca();
