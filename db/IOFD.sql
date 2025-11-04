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

-- 13. Table users (doit être créée avant les références)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY, -- identique à l'ID généré par Supabase Auth
  email text NOT NULL UNIQUE,
  username text,
  role text DEFAULT 'user', -- admin / user / contributor
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Trigger pour updated_at sur users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Table product_contributors (optionnelle)  
CREATE TABLE IF NOT EXISTS product_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  change_data jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- 16. Table community_reviews (nouvelle - avis communautaires)
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

-- Pré-remplissage table additives - E-numbers avec statuts Halal
INSERT INTO additives (code, name, description, halal_status, origin_type, function, health_concerns)
VALUES

('E100', 'Curcumine', 'Colorant jaune extrait du curcuma', 'mashbuh', 'végétal', 'colorant', NULL),
('E101', 'Riboflavine', 'Vitamine B2, colorant jaune', 'mashbuh', 'végétal/animal', 'colorant', NULL),
('E102', 'Tartrazine', 'Colorant jaune synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E104', 'Jaune de quinoléine', 'Colorant jaune synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E110', 'Jaune orangé S', 'Colorant orange synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E120', 'Cochenille', 'Colorant rouge extrait d''insectes', 'haram', 'animal', 'colorant', NULL),
('E122', 'Carmoisine', 'Colorant rouge synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E123', 'Amaranth', 'Colorant rouge synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E124', 'Ponceau 4R', 'Colorant rouge synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E127', 'Erythrosine', 'Colorant rouge synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E131', 'Bleu patenté V', 'Colorant bleu synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E132', 'Indigotine', 'Colorant bleu synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E140', 'Chlorophylle', 'Colorant vert naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E141', 'Complexe cuivrique de chlorophylle', 'Colorant vert dérivé', 'mashbuh', 'végétal', 'colorant', NULL),
('E142', 'Vert S', 'Colorant vert synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E150a', 'Caramel nature', 'Colorant brun', 'halal', 'végétal', 'colorant', NULL),
('E150b', 'Caramel de sulfite caustique', 'Colorant brun', 'halal', 'végétal', 'colorant', NULL),
('E150c', 'Caramel ammoniacal', 'Colorant brun', 'halal', 'végétal', 'colorant', NULL),
('E150d', 'Caramel au sulfite d''ammonium', 'Colorant brun', 'halal', 'végétal', 'colorant', NULL),
('E151', 'Noir brillant BN', 'Colorant noir synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),
('E153', 'Charbon végétal', 'Colorant noir naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E160a', 'Carotènes', 'Colorant orange naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E160b', 'Rocou', 'Colorant orange naturel', 'halal', 'végétal', 'colorant', NULL),
('E160c', 'Capsanthine', 'Colorant rouge naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E160d', 'Lycopène', 'Colorant rouge naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E160e', 'Beta-apo-8-caroténal', 'Colorant orange', 'mashbuh', 'végétal', 'colorant', NULL),
('E160f', 'Ester éthylique de l''acide beta-apo-8-caroténoïque', 'Colorant orange', 'mashbuh', 'végétal', 'colorant', NULL),
('E161a', 'Flavoxanthine', 'Colorant jaune naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161b', 'Lutéine', 'Colorant jaune naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161c', 'Cryptoxanthine', 'Colorant jaune naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161d', 'Rubixanthine', 'Colorant jaune naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161e', 'Violaxanthine', 'Colorant jaune naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161f', 'Rhodoxanthine', 'Colorant rouge naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E161g', 'Canthaxanthine', 'Colorant orange naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E162', 'Rouge de betterave', 'Colorant rouge naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E163', 'Anthocyanes', 'Colorant rouge/bleu naturel', 'mashbuh', 'végétal', 'colorant', NULL),
('E170', 'Carbonate de calcium', 'Colorant blanc minéral', 'mashbuh', 'minéral', 'colorant', NULL),
('E171', 'Dioxyde de titane', 'Colorant blanc minéral', 'halal', 'minéral', 'colorant', NULL),
('E172', 'Oxydes et hydroxydes de fer', 'Colorants minéraux', 'halal', 'minéral', 'colorant', NULL),
('E173', 'Aluminium', 'Colorant métallique', 'halal', 'minéral', 'colorant', NULL),
('E174', 'Argent', 'Colorant métallique', 'halal', 'minéral', 'colorant', NULL),
('E175', 'Or', 'Colorant métallique', 'halal', 'minéral', 'colorant', NULL),
('E180', 'Pigment rubine', 'Colorant rouge synthétique', 'mashbuh', 'synthétique', 'colorant', NULL),

-- Conservateurs (E200-E283)
('E200', 'Acide sorbique', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E201', 'Sorbate de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E202', 'Sorbate de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E203', 'Sorbate de calcium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E210', 'Acide benzoïque', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E211', 'Benzoate de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E212', 'Benzoate de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E213', 'Benzoate de calcium', 'Conservateur', 'mashbuh', 'minéral', 'conservateur', NULL),
('E214', 'Ethyl 4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E215', 'Dérivé sodique de l''éthyl-4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E216', 'Propyl 4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E217', 'Dérivé sodique du propyl-4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E218', 'Méthyl 4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E219', 'Dérivé sodique du méthyl-4-hydroxybenzoate', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E220', 'Dioxyde de soufre', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E221', 'Sulfite de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E222', 'Bisulfite de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E223', 'Métabisulfite de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E224', 'Métabisulfite de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E226', 'Sulfite de calcium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E227', 'Bisulfite de calcium', 'Conservateur', 'mashbuh', 'minéral', 'conservateur', NULL),
('E230', 'Biphényle', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E231', '2-Hydroxybiphényle', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E232', 'Orthophénylphénate de sodium', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E233', 'Thiabendazole', 'Conservateur', 'mashbuh', 'synthétique', 'conservateur', NULL),
('E239', 'Hexaméthylènetétramine', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E249', 'Nitrite de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E250', 'Nitrite de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E251', 'Nitrate de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E252', 'Nitrate de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E260', 'Acide acétique', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E261', 'Acétate de potassium', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E262', 'Diacétate de potassium', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E263', 'Acétate de calcium', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E270', 'Acide lactique', 'Acidifiant', 'mashbuh', 'synthétique', 'acidifiant', NULL),
('E280', 'Acide propionique', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E281', 'Propionate de sodium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),
('E282', 'Propionate de calcium', 'Conservateur', 'mashbuh', 'minéral', 'conservateur', NULL),
('E283', 'Propionate de potassium', 'Conservateur', 'halal', 'synthétique', 'conservateur', NULL),

-- Antioxydants (E300-E321)
('E290', 'Dioxyde de carbone', 'Agent gazéifiant', 'halal', 'synthétique', 'divers', NULL),
('E296', 'Acide malique', 'Acide organique', 'halal', 'végétal/synthétique', NULL),
('E300', 'Acide ascorbique', 'Vitamine C, antioxydant', 'halal', 'synthétique', 'antioxydant', NULL),
('E301', 'Ascorbate de sodium', 'Sel de vitamine C', 'halal', 'synthétique', 'antioxydant', NULL),
('E302', 'Ascorbate de calcium', 'Sel de vitamine C', 'mashbuh', 'minéral', 'antioxydant', NULL),
('E304', 'Palmitate d''ascorbyle', 'Dérivé de vitamine C', 'mashbuh', 'végétal/animal', 'antioxydant', NULL),
('E306', 'Extraits riches en tocophérols', 'Vitamine E naturelle', 'mashbuh', 'végétal/animal', 'antioxydant', NULL),
('E307', 'Alpha-tocophérol synthétique', 'Vitamine E synthétique', 'mashbuh', 'synthétique', 'antioxydant', NULL),
('E308', 'Gamma-tocophérol synthétique', 'Vitamine E synthétique', 'mashbuh', 'synthétique', 'antioxydant', NULL),
('E309', 'Delta-tocophérol synthétique', 'Vitamine E synthétique', 'mashbuh', 'synthétique', 'antioxydant', NULL),
('E310', 'Gallate de propyle', 'Antioxydant', 'halal', 'synthétique', 'antioxydant', NULL),
('E311', 'Gallate d''octyle', 'Antioxydant', 'mashbuh', 'végétal', 'antioxydant', NULL),
('E312', 'Gallate de dodécyle', 'Antioxydant', 'mashbuh', 'végétal', 'antioxydant', NULL),
('E320', 'BHA', 'Antioxydant synthétique', 'mashbuh', 'synthétique', 'antioxydant', NULL),
('E321', 'BHT', 'Antioxydant synthétique', 'mashbuh', 'synthétique', 'antioxydant', NULL),

-- Émulsifiants (E322-E483)
('E322', 'Lécithine', 'Émulsifiant', 'mashbuh', 'végétal/animal', 'émulsifiant', NULL),
('E325', 'Lactate de sodium', 'Régulateur d''acidité', 'mashbuh', 'synthétique', 'acidifiant', NULL),
('E326', 'Lactate de potassium', 'Régulateur d''acidité', 'mashbuh', 'synthétique', 'acidifiant', NULL),
('E327', 'Lactate de calcium', 'Régulateur d''acidité', 'mashbuh', 'synthétique', 'acidifiant', NULL),
('E330', 'Acide citrique', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E331', 'Citrate de sodium', 'Régulateur d''acidité', 'halal', 'synthétique', 'acidifiant', NULL),
('E332', 'Citrate de potassium', 'Régulateur d''acidité', 'halal', 'synthétique', 'acidifiant', NULL),
('E333', 'Citrate de calcium', 'Régulateur d''acidité', 'mashbuh', 'minéral', 'acidifiant', NULL),
('E334', 'Acide tartrique', 'Acidifiant', 'mashbuh', 'végétal', 'acidifiant', NULL),
('E335', 'Tartrate de sodium', 'Régulateur d''acidité', 'mashbuh', 'végétal', 'acidifiant', NULL),
('E336', 'Tartrate de potassium', 'Régulateur d''acidité', 'mashbuh', 'végétal', 'acidifiant', NULL),
('E337', 'Tartrate double de sodium et potassium', 'Régulateur d''acidité', 'mashbuh', 'végétal', 'acidifiant', NULL),
('E338', 'Acide phosphorique', 'Acidifiant', 'halal', 'synthétique', 'acidifiant', NULL),
('E339', 'Phosphate de sodium', 'Régulateur d''acidité', 'halal', 'synthétique', 'acidifiant', NULL),
('E340', 'Phosphate de potassium', 'Régulateur d''acidité', 'halal', 'synthétique', 'acidifiant', NULL),
('E341', 'Phosphate de calcium', 'Régulateur d''acidité', 'mashbuh', 'minéral', 'acidifiant', NULL),
('E400', 'Acide alginique', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E401', 'Alginate de sodium', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E402', 'Alginate de potassium', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E403', 'Alginate d''ammonium', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E404', 'Alginate de calcium', 'Épaississant', 'mashbuh', 'végétal', 'épaississant', NULL),
('E405', 'Alginate de propane-1,2-diol', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E406', 'Agar-agar', 'Gélifiant', 'halal', 'végétal', 'gélifiant', NULL),
('E407', 'Carraghénane', 'Gélifiant', 'halal', 'végétal', 'gélifiant', NULL),
('E410', 'Gomme de caroube', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E412', 'Gomme guar', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E413', 'Gomme adragante', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E414', 'Gomme arabique', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E415', 'Gomme xanthane', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E420', 'Sorbitol', 'Édulcorant', 'halal', 'synthétique', 'édulcorant', NULL),
('E421', 'Mannitol', 'Édulcorant', 'halal', 'synthétique', 'édulcorant', NULL),
('E422', 'Glycérol', 'Humectant', 'mushbooh', 'végétal/animal', 'humectant', NULL),
('E440a', 'Pectine', 'Gélifiant', 'halal', 'végétal', 'gélifiant', NULL),
('E440b', 'Pectine amidée', 'Gélifiant', 'halal', 'végétal', 'gélifiant', NULL),
('E441', 'Gélatine', 'Gélifiant', 'mashbuh', 'végétal', 'gélifiant', NULL),
('E450a', 'Diphosphate disodique', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E450b', 'Diphosphate trisodique', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E450c', 'Diphosphate tétrasodique', 'Émulsifiant', 'halal', 'synthétique', 'émulsifiant', NULL),
('E460', 'Cellulose', 'Agent de charge', 'halal', 'végétal', 'épaississant', NULL),
('E461', 'Méthylcellulose', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E463', 'Hydroxypropylcellulose', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E464', 'Hydroxypropylméthylcellulose', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E465', 'Éthylméthylcellulose', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E466', 'Carboxyméthylcellulose', 'Épaississant', 'halal', 'végétal', 'épaississant', NULL),
('E470', 'Sels d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E471', 'Mono et diglycérides d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E472', 'Esters d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E473', 'Sucroesters d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E474', 'Sucroglycérides', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E475', 'Esters polyglycériques d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E477', 'Esters du propane-1,2-diol d''acides gras', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E481', 'Stéaroyl-2-lactylate de sodium', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E482', 'Stéaroyl-2-lactylate de calcium', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL),
('E483', 'Tartrate de stéaryle', 'Émulsifiant', 'mushbooh', 'végétal/animal', 'émulsifiant', NULL);