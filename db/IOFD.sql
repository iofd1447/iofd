-- 1. Table categories  
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

-- 2. Table products  
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode varchar(13) UNIQUE,
  name text NOT NULL,
  brand text,
  portion_description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Table nutrition_facts  
CREATE TABLE IF NOT EXISTS nutrition_facts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  calories_kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  sugars_g numeric,
  fats_g numeric,
  saturated_fats_g numeric,
  trans_fats_g numeric,
  cholesterol_mg numeric,
  fibres_g numeric,
  sodium_mg numeric,
  water_ml numeric,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id)
);

-- 4. Table halal_certifications (nouvelle)
CREATE TABLE IF NOT EXISTS halal_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  halal_status text NOT NULL CHECK (halal_status IN ('halal', 'haram', 'douteux', 'non_verifie')),
  certification_body text, -- Organisme certificateur (AVS, SFCVH, etc.)
  certificate_number text,
  certified_date date,
  expiry_date date,
  notes text,
  verified_by_community boolean DEFAULT false,
  verification_count integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Table ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  halal_status text CHECK (halal_status IN ('halal', 'haram', 'douteux', 'variable')),
  category text 
);

-- 6. Table product_ingredients 
CREATE TABLE IF NOT EXISTS product_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  position integer, 
  percentage numeric, 
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, ingredient_id)
);

-- 7. Table additives 
CREATE TABLE IF NOT EXISTS additives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE, 
  name text NOT NULL,
  description text,
  halal_status text CHECK (halal_status IN ('halal', 'haram', 'douteux', 'variable')),
  origin_type text,
  function text, 
  health_concerns text
);

-- 8. Table product_additives
CREATE TABLE IF NOT EXISTS product_additives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  additive_id uuid NOT NULL REFERENCES additives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, additive_id)
);

-- 9. Table allergens
CREATE TABLE IF NOT EXISTS allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, 
  description text
);

-- 10. Table product_allergens
CREATE TABLE IF NOT EXISTS product_allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  allergen_id uuid NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  presence_type text CHECK (presence_type IN ('contient', 'traces', 'peut_contenir')),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, allergen_id)
);

-- 11. Table labels 
CREATE TABLE IF NOT EXISTS labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, 
  description text,
  logo_url text
);

-- 12. Table product_labels 
CREATE TABLE IF NOT EXISTS product_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, label_id)
);

-- 13. Table users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY, 
  email text NOT NULL UNIQUE,
  username text,
  role text DEFAULT 'user', 
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Trigger pour updated_at sur users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Table product_contributors
CREATE TABLE IF NOT EXISTS product_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  change_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- 16. Table community_reviews
CREATE TABLE IF NOT EXISTS community_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  halal_vote text CHECK (halal_vote IN ('halal', 'haram', 'douteux')),
  comment text,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_halal_certifications_product ON halal_certifications(product_id);
CREATE INDEX IF NOT EXISTS idx_halal_certifications_status ON halal_certifications(halal_status);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_additives_product ON product_additives(product_id);
CREATE INDEX IF NOT EXISTS idx_product_allergens_product ON product_allergens(product_id);
CREATE INDEX IF NOT EXISTS idx_community_reviews_product ON community_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_community_reviews_user ON community_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_contributors_user ON product_contributors(user_id);
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_facts_updated_at BEFORE UPDATE ON nutrition_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_halal_certifications_updated_at BEFORE UPDATE ON halal_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_reviews_updated_at BEFORE UPDATE ON community_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
