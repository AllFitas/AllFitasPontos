import { createClient } from '@supabase/supabase-js';
const VITE_SUPABASE_URL = 'https://ldgzzmnlyxyoxaouivos.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3p6bW5seXh5b3hhb3Vpdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjY5MjUsImV4cCI6MjA5MjAwMjkyNX0.gRQcsG1i0Ar966NcqWzrljFD33UKzlRTaTFRAQioGSk';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%FITA BRANCA%');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Products matching "FITA BRANCA":');
  console.table(data);
}

checkProducts();
