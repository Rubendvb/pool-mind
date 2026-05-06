-- Tabela de produtos químicos do usuário
CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  category        text NOT NULL,
  manufacturer    text,
  concentration   numeric(5,2),    -- percentual, ex: 90.00 para 90%
  unit            text NOT NULL DEFAULT 'g',
  quantity        numeric(10,2),   -- quantidade disponível (null = ilimitado)
  expiration_date date,
  notes           text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own products"
  ON products FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
