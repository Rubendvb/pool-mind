CREATE TABLE IF NOT EXISTS product_dosage_rules (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id            UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name                  TEXT          NOT NULL,
  usage_type            TEXT          NOT NULL CHECK (usage_type IN (
                          'maintenance', 'shock',
                          'low_turbidity', 'medium_turbidity', 'high_turbidity',
                          'ph_correction', 'alkalinity_correction',
                          'clarification', 'custom'
                        )),
  amount                NUMERIC(10,3) NOT NULL CHECK (amount > 0),
  unit                  TEXT          NOT NULL,
  reference_volume_liters NUMERIC(10,2) NOT NULL CHECK (reference_volume_liters > 0),
  condition_label       TEXT,
  notes                 TEXT,
  is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE product_dosage_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_dosage_rules"
  ON product_dosage_rules
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fast lookup when calcDosages scans rules for a specific product
CREATE INDEX product_dosage_rules_product_idx
  ON product_dosage_rules (product_id)
  WHERE is_active = TRUE;
