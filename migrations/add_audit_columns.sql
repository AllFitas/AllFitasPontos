-- 1. ADICIONA COLUNA DE USUÁRIO NA TABELA DE PEDIDOS (ORDERS)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. ADICIONA COLUNA DE USUÁRIO NA TABELA DE RESGATES (REDEMPTIONS)
ALTER TABLE redemptions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. ATUALIZA A FUNÇÃO DE RESGATE (FIFO) PARA SUPORTAR O ID DO USUÁRIO
CREATE OR REPLACE FUNCTION redeem_points_fifo(
  p_customer_name TEXT,
  p_product_id UUID,
  p_points_to_redeem INTEGER,
  p_quantity INTEGER DEFAULT 1,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_remaining_to_redeem INTEGER := p_points_to_redeem;
  v_order_record RECORD;
  v_deduction INTEGER;
BEGIN
  -- Busca pedidos com saldo, ordenados por data (FIFO), dentro da validade de 30 dias
  FOR v_order_record IN 
    SELECT id, points_remaining 
    FROM orders 
    WHERE customer_name = p_customer_name 
      AND points_remaining > 0
      AND order_date >= (CURRENT_DATE - INTERVAL '30 days')
    ORDER BY order_date ASC, id ASC
  LOOP
    IF v_remaining_to_redeem <= 0 THEN
      EXIT;
    END IF;

    -- Calcula quanto podemos tirar deste pedido específico
    v_deduction := LEAST(v_order_record.points_remaining, v_remaining_to_redeem);

    -- Atualiza o saldo do pedido
    UPDATE orders 
    SET points_remaining = points_remaining - v_deduction 
    WHERE id = v_order_record.id;

    -- Diminui o que ainda falta resgatar
    v_remaining_to_redeem := v_remaining_to_redeem - v_deduction;
  END LOOP;

  -- Verifica se conseguiu resgatar tudo
  IF v_remaining_to_redeem > 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente nos últimos 30 dias para completar o resgate.';
  END IF;

  -- REGISTRA A SAÍDA NO HISTÓRICO COM O USUÁRIO RESPONSÁVEL
  INSERT INTO redemptions (customer_name, product_id, points_spent, quantity, created_at, created_by)
  VALUES (p_customer_name, p_product_id, p_points_to_redeem, p_quantity, NOW(), p_user_id);

END;
$$ LANGUAGE plpgsql;
