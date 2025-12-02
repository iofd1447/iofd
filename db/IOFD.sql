 CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

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
  calcium_mg numeric,
  fibres_g numeric,
  sodium_mg numeric,
  water_ml numeric,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS halal_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  halal_status text NOT NULL CHECK (halal_status IN ('mustahab', 'halal', 'haram', 'douteux')),
  certification_body text, 
  certificate_number text,
  certified_date date,
  expiry_date date,
  notes text,
  verified_by_community boolean DEFAULT false,
  verification_count integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  halal_status text CHECK (halal_status IN ('halal', 'haram', 'douteux', 'variable')),
  category text 
);

CREATE TABLE IF NOT EXISTS product_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  position integer, 
  percentage numeric, 
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, ingredient_id)
);

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

CREATE TABLE IF NOT EXISTS product_additives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  additive_id uuid NOT NULL REFERENCES additives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, additive_id)
);

CREATE TABLE IF NOT EXISTS allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, 
  description text
);

CREATE TABLE IF NOT EXISTS product_allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  allergen_id uuid NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  presence_type text CHECK (presence_type IN ('contient', 'traces', 'peut_contenir')),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, 
  description text,
  logo_url text
);

CREATE TABLE IF NOT EXISTS product_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, label_id)
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS product_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  change_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

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