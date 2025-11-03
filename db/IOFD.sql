-- Assurer qu'on est dans le schéma public  
SET search_path = public;

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

-- 5. Table ingredients (nouvelle)
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  halal_status text CHECK (halal_status IN ('halal', 'haram', 'douteux', 'variable')),
  category text -- végétal, animal, synthétique, etc.
);

-- 6. Table product_ingredients (relation many-to-many)
CREATE TABLE IF NOT EXISTS product_ingredients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  position integer, -- ordre dans la liste d'ingrédients
  percentage numeric, -- pourcentage si connu
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, ingredient_id)
);

-- 7. Table additives (nouvelle)
CREATE TABLE IF NOT EXISTS additives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE, -- E120, E471, etc.
  name text NOT NULL,
  description text,
  halal_status text CHECK (halal_status IN ('halal', 'haram', 'douteux', 'variable')),
  origin_type text, -- animal, végétal, synthétique, minéral
  function text, -- colorant, conservateur, émulsifiant, etc.
  health_concerns text
);

-- 8. Table product_additives (relation many-to-many)
CREATE TABLE IF NOT EXISTS product_additives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  additive_id uuid NOT NULL REFERENCES additives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, additive_id)
);

-- 9. Table allergens (nouvelle)
CREATE TABLE IF NOT EXISTS allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- gluten, lactose, arachides, etc.
  description text
);

-- 10. Table product_allergens (relation many-to-many)
CREATE TABLE IF NOT EXISTS product_allergens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  allergen_id uuid NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  presence_type text CHECK (presence_type IN ('contient', 'traces', 'peut_contenir')),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, allergen_id)
);

-- 11. Table labels (nouvelle)
CREATE TABLE IF NOT EXISTS labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- Bio, Sans OGM, Commerce équitable, etc.
  description text,
  logo_url text
);

-- 12. Table product_labels (relation many-to-many)
CREATE TABLE IF NOT EXISTS product_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(product_id, label_id)
);

-- 15. Table product_contributors (optionnelle)  
CREATE TABLE IF NOT EXISTS product_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
  change_type text NOT NULL,
  change_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- 16. Table community_reviews (nouvelle - avis communautaires)
CREATE TABLE IF NOT EXISTS community_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
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

  CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY, -- identique à l'ID généré par Supabase Auth
  email text NOT NULL UNIQUE,
  username text,
  role text DEFAULT 'user', -- admin / user / contributor
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Trigger pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pré-remplissage table additives jusqu'à E999 (version publique simplifiée)
INSERT INTO additives (code, name, description, halal_status, origin_type, function, health_concerns)
VALUES
('E100', 'Curcumine', 'Colorant jaune extrait du curcuma', 'halal', 'végétal', 'colorant', NULL),
('E101', 'Riboflavine', 'Vitamine B2, colorant jaune', 'halal', 'végétal', 'colorant', NULL),
('E120', 'Cochineal', 'Colorant rouge d’origine animale', 'haram', 'animal', 'colorant', 'allergies possibles'),
('E122', 'Azorubine', 'Colorant synthétique rouge', 'douteux', 'synthétique', 'colorant', 'allergies, hyperactivité'),
('E124', 'Ponceau 4R', 'Colorant synthétique rouge', 'douteux', 'synthétique', 'colorant', 'allergies, hyperactivité'),
('E129', 'Allura Red', 'Colorant synthétique rouge', 'douteux', 'synthétique', 'colorant', 'allergies, hyperactivité'),
('E131', 'Bleu Patenté V', 'Colorant synthétique bleu', 'douteux', 'synthétique', 'colorant', 'allergies, hyperactivité'),
('E132', 'Indigo Carmine', 'Colorant bleu synthétique', 'halal', 'synthétique', 'colorant', 'allergies'),
('E133', 'Bleu brillant FCF', 'Colorant bleu synthétique', 'douteux', 'synthétique', 'colorant', 'allergies, hyperactivité'),
('E140', 'Chlorophylles', 'Colorant vert végétal', 'halal', 'végétal', 'colorant', NULL),
('E141', 'Chlorophylles cuivre', 'Colorant vert végétal modifié', 'halal', 'végétal', 'colorant', NULL),
('E150a', 'Caramel simple', 'Colorant brun caramel', 'halal', 'végétal', 'colorant', NULL),
('E150b', 'Caramel caustique', 'Colorant brun caramel', 'halal', 'végétal', 'colorant', NULL),
('E150c', 'Caramel acide sulfite', 'Colorant brun caramel', 'halal', 'végétal', 'colorant', NULL),
('E150d', 'Caramel ammoniacal', 'Colorant brun caramel', 'douteux', 'végétal', 'colorant', NULL),
('E151', 'Noir brillant BN', 'Colorant noir synthétique', 'douteux', 'synthétique', 'colorant', 'allergies'),
('E160a', 'α-Carotène', 'Colorant orange naturel', 'halal', 'végétal', 'colorant', NULL),
('E160c', 'Extrait de paprika', 'Colorant rouge-orange végétal', 'halal', 'végétal', 'colorant', NULL),
('E160d', 'Lycopène', 'Colorant rouge naturel', 'halal', 'végétal', 'colorant', NULL),
('E160e', 'β-Apo-8’-caroténal', 'Colorant orange naturel', 'halal', 'végétal', 'colorant', NULL),
('E161b', 'Lutéine', 'Colorant jaune végétal', 'halal', 'végétal', 'colorant', NULL),
('E162', 'Bêta-rouge de betterave', 'Colorant rouge végétal', 'halal', 'végétal', 'colorant', NULL),
('E163', 'Anthocyanes', 'Colorant rouge-violet végétal', 'halal', 'végétal', 'colorant', NULL),
('E200', 'Acide sorbique', 'Conservateur', 'halal', 'végétal', 'conservateur', NULL),
('E202', 'Sorbate de potassium', 'Conservateur', 'halal', 'végétal', 'conservateur', NULL),
('E210', 'Acide benzoïque', 'Conservateur', 'halal', 'synthétique', 'conservateur', 'allergies'),
('E211', 'Benzoate de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', 'allergies'),
('E220', 'Anhydride sulfureux', 'Conservateur', 'douteux', 'synthétique', 'conservateur', 'allergies'),
('E221', 'Sulfite de sodium', 'Conservateur', 'douteux', 'synthétique', 'conservateur', 'allergies'),
('E250', 'Nitrite de sodium', 'Conservateur', 'haram', 'synthétique', 'conservateur', 'risque nitrosamines'),
('E251', 'Nitrite de potassium', 'Conservateur', 'haram', 'synthétique', 'conservateur', 'risque nitrosamines'),
('E260', 'Acide acétique', 'Conservateur', 'halal', 'végétal', 'conservateur', NULL),
('E270', 'Acide lactique', 'Conservateur', 'halal', 'végétal', 'conservateur', NULL),
('E300', 'Acide ascorbique', 'Antioxydant', 'halal', 'végétal', 'antioxydant', NULL),
('E301', 'Ascorbate de sodium', 'Antioxydant', 'halal', 'synthétique', 'antioxydant', NULL),
('E330', 'Acide citrique', 'Antioxydant', 'halal', 'végétal', 'antioxydant', NULL),
('E331', 'Citrate de sodium', 'Antioxydant', 'halal', 'synthétique', 'antioxydant', NULL),
('E339', 'Phosphate de sodium', 'Additif minéral', 'halal', 'minéral', 'stabilisant', NULL),
('E341', 'Phosphate de calcium', 'Additif minéral', 'halal', 'minéral', 'stabilisant', NULL),
('E407', 'Carraghénanes', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', 'troubles digestifs'),
('E412', 'Gomme de guar', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', NULL),
('E415', 'Gomme xanthane', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', NULL),
('E416', 'Gomme de karaya', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', NULL),
('E417', 'Gomme tara', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', NULL),
('E418', 'Gomme de caroube', 'Épaississant végétal', 'halal', 'végétal', 'stabilisant', NULL),
('E422', 'Glycérol', 'Humectant et émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E430', 'Polyoxyéthylène sorbitan monostéarate', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E432', 'Polysorbate 40', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E433', 'Polysorbate 60', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E434', 'Polysorbate 65', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E435', 'Polysorbate 80', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E440', 'Pectines', 'Épaississant naturel', 'halal', 'végétal', 'stabilisant', NULL),
('E441', 'Gélatine', 'Épaississant animal', 'haram', 'animal', 'stabilisant', NULL),
('E442', 'Glycérol estérifié de colza', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E450', 'Diphosphates', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E451', 'Triphosphates', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E452', 'Polyphosphates', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E460', 'Cellulose', 'Agent de charge', 'halal', 'végétal', 'stabilisant', NULL),
('E461', 'Carboxyméthylcellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E462', 'Acétate de cellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E463', 'Hydroxypropylcellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E464', 'Hydroxypropylméthylcellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E465', 'Méthylcellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E466', 'Carboxypropylcellulose', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E467', 'Hydroxypropylcellulose phénylée', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E468', 'Hydroxypropylcellulose succinylée', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E469', 'Xanthane modifié', 'Épaississant', 'halal', 'végétal', 'stabilisant', NULL),
('E470a', 'Sels de calcium d’acides gras', 'Émulsifiant', 'halal', 'animal/végétal', 'émulsifiant', NULL),
('E470b', 'Sels de sodium, potassium et ammonium d’acides gras', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E471', 'Mono- et diglycérides d’acides gras', 'Émulsifiant', 'variable', 'animal/végétal', 'émulsifiant', NULL),
('E472a', 'Acétyl citrate de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E472b', 'Esters lactiques de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E472c', 'Esters mono- et diglycérides d’acides citriques', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E472e', 'Lactylates de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E473', 'Sucroesters de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E474', 'Sels de sucroesters', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E475', 'Esters polyglycérides d’acides gras', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E476', 'Polyglycérides d’acides gras estérifiés', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E477', 'Stéaroyl lactylates de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E478', 'Tartate de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E479b', 'Sorbitan tristearate', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E480', 'Dérivés succiniques de mono- et diglycérides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E481', 'Stéaroyl-2-lactylates de sodium', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E482', 'Stéaroyl-2-lactylates de calcium', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E483', 'Stéaroyl-2-lactylates de potassium', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E484', 'Stearylated mono- and diglycerides', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E491', 'Sodium stearoyl lactylate', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E492', 'Sucrose esters of fatty acids', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E493', 'Sorbitan monostearate', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E494', 'Sorbitan tristearate', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E495', 'Polyglycerol esters of fatty acids', 'Émulsifiant', 'halal', 'végétal', 'émulsifiant', NULL),
('E500', 'Carbonate de sodium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E501', 'Carbonate de potassium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E503', 'Carbonate d’ammonium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E504', 'Carbonate de calcium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E507', 'Acide chlorhydrique', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E508', 'Chlorure de potassium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL),
('E509', 'Chlorure de calcium', 'Régulateur de pH', 'halal', 'minéral', 'stabilisant', NULL)
ON CONFLICT (code) DO NOTHING;
