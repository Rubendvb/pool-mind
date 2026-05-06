-- Phase 3: Financial intelligence — price fields on products + application history

-- Financial fields for products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price           numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_unit      text,
  ADD COLUMN IF NOT EXISTS package_quantity numeric(10,3);

-- price          → total price of the package (BRL)
-- price_unit     → unit of package_quantity ('g','kg','ml','L')
-- package_quantity → how many [price_unit] per package (e.g. 10 for a 10kg bag)

-- Immutable application history log
CREATE TABLE IF NOT EXISTS product_applications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        REFERENCES auth.users NOT NULL,
  product_id     uuid        REFERENCES products(id) ON DELETE SET NULL,
  product_name   text        NOT NULL,
  measurement_id uuid        REFERENCES measurements(id) ON DELETE SET NULL,
  quantity_used  numeric(10,3) NOT NULL,
  unit           text        NOT NULL,
  cost           numeric(10,4),
  applied_at     timestamptz NOT NULL DEFAULT now(),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own applications"
  ON product_applications FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id      ON product_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_product_id   ON product_applications(product_id);
CREATE INDEX IF NOT EXISTS idx_applications_measurement  ON product_applications(measurement_id);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at   ON product_applications(applied_at DESC);

-- Transactional RPC: validates ownership, checks stock, deducts, inserts log atomically.
CREATE OR REPLACE FUNCTION apply_product_usage(
  p_user_id        uuid,
  p_product_id     uuid,
  p_quantity_used  numeric,
  p_unit           text,
  p_cost           numeric,
  p_measurement_id uuid,
  p_notes          text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product   products%ROWTYPE;
  v_app_id    uuid;
BEGIN
  -- Lock product row to prevent concurrent race conditions
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado ou sem permissão';
  END IF;

  -- Check stock when it is tracked (not null = unlimited)
  IF v_product.quantity IS NOT NULL THEN
    IF v_product.quantity < p_quantity_used THEN
      RAISE EXCEPTION 'Estoque insuficiente: disponível %, necessário %',
        v_product.quantity, p_quantity_used;
    END IF;

    UPDATE products
       SET quantity = quantity - p_quantity_used
     WHERE id = p_product_id AND user_id = p_user_id;
  END IF;

  -- Insert immutable application record
  INSERT INTO product_applications (
    user_id, product_id, product_name,
    measurement_id, quantity_used, unit,
    cost, applied_at, notes
  ) VALUES (
    p_user_id, p_product_id, v_product.name,
    p_measurement_id, p_quantity_used, p_unit,
    p_cost, now(), p_notes
  )
  RETURNING id INTO v_app_id;

  RETURN v_app_id;
END;
$$;
