-- Phase 2: Custom dosage formula per product
-- Fields allow users to configure: "X [unit] of this product in Y liters changes parameter by Z"
-- Formula: required_amount = ceil((delta / effect_value) * reference_amount * (pool_volume / reference_liters))
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS dosage_reference_amount  numeric(10,3),
  ADD COLUMN IF NOT EXISTS dosage_reference_liters  numeric(10,2),
  ADD COLUMN IF NOT EXISTS dosage_effect_value      numeric(10,4),
  ADD COLUMN IF NOT EXISTS dosage_effect_type       text;

-- dosage_effect_type allowed values: 'ph_delta' | 'chlorine_ppm' | 'alkalinity_ppm' | 'hardness_ppm'
