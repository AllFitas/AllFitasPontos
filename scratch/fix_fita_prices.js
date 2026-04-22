import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = 'https://ldgzzmnlyxyoxaouivos.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3p6bW5seXh5b3hhb3Vpdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjY5MjUsImV4cCI6MjA5MjAwMjkyNX0.gRQcsG1i0Ar966NcqWzrljFD33UKzlRTaTFRAQioGSk';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function fixPrices() {
  const { data: products } = await supabase.from('products').select('*').ilike('name', 'Fita Branca');
  const fitaId = products[0].id;

  const { data: redemptions } = await supabase
    .from('redemptions')
    .select('*')
    .eq('product_id', fitaId);

  const needsFix = redemptions.filter(r => r.points_spent !== (r.quantity * 1000));

  console.log(`Fixing ${needsFix.length} records...`);

  for (const r of needsFix) {
    const shouldBe = r.quantity * 1000;
    const diff = r.points_spent - shouldBe;

    // 1. Update Redemption
    await supabase.from('redemptions').update({ points_spent: shouldBe }).eq('id', r.id);

    // 2. Refund points to orders
    // We add the points back to the most recent order of this customer
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_name', r.customer_name)
      .order('order_date', { ascending: false })
      .limit(1);

    if (orders && orders.length > 0) {
      const order = orders[0];
      await supabase.from('orders')
        .update({ points_remaining: order.points_remaining + diff })
        .eq('id', order.id);
      console.log(`Refunded ${diff} pts to ${r.customer_name} (Order ${order.order_number})`);
    }
  }

  console.log('Cleanup complete.');
}

fixPrices();
