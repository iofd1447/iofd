import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  Searchbar,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';

const STEPS = [
  { title: 'Informations', value: 1 },
  { title: 'Statut Halal', value: 2 },
  { title: 'Composition', value: 3 },
  { title: 'Nutrition', value: 4 },
];

const HALAL_STATUSES = [
  { value: 'halal', label: 'Halal', icon: 'check-circle', color: '#4CAF50' },
  { value: 'haram', label: 'Haram', icon: 'close-circle', color: '#F44336' },
  { value: 'mashbuh', label: 'Mashbuh', icon: 'help-circle', color: '#FF9800' },
];

const CERTIFICATION_BODIES = [
  'AVS',
  'Halal Monitoring Committee',
  'Taiwan Halal Integrity Development Association',
  'Autre',
];

const NUTRITION_FIELDS = [
  { key: 'calories_kcal', label: 'Calories', suffix: 'kcal', icon: 'fire' },
  { key: 'protein_g', label: 'Protéines', suffix: 'g', icon: 'food' },
  { key: 'carbs_g', label: 'Glucides', suffix: 'g', icon: 'grain' },
  { key: 'sugars_g', label: 'Sucres', suffix: 'g', icon: 'candy' },
  { key: 'fats_g', label: 'Lipides', suffix: 'g', icon: 'oil' },
  { key: 'saturated_fats_g', label: 'Graisses saturées', suffix: 'g', icon: 'food-drumstick' },
  { key: 'fibres_g', label: 'Fibres', suffix: 'g', icon: 'leaf' },
  { key: 'sodium_mg', label: 'Sodium', suffix: 'mg', icon: 'shaker' },
  { key: 'calcium_mg', label: 'Calcium', suffix: 'mg', icon: 'egg' },
];

const ADDITIVE_FILTER_STATUSES = [
  { value: 'halal', label: 'Halal', color: '#4CAF50', icon: 'check-circle' },
  { value: 'haram', label: 'Haram', color: '#F44336', icon: 'close-circle' },
  { value: 'mashbuh', label: 'Mashbuh', color: '#FF9800', icon: 'help-circle' },
];

export default function ContributeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAdditives, setLoadingAdditives] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAdditivesDialog, setShowAdditivesDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdProductId, setCreatedProductId] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [additives, setAdditives] = useState<any[]>([]);
  const [allergensList, setAllergensList] = useState<any[]>([]);
  const [labelsList, setLabelsList] = useState<any[]>([]);

  const [form, setForm] = useState({
    barcode: '',
    name: '',
    brand: '',
    category_id: null as string | null,
    portion_description: '',
    image_url: '',
    halal_status: 'halal',
    certification_body: '',
    certificate_number: '',
    certified_date: '',
    expiry_date: '',
    halal_notes: '',
    nutrition: {
      calories_kcal: '',
      protein_g: '',
      carbs_g: '',
      sugars_g: '',
      fats_g: '',
      saturated_fats_g: '',
      fibres_g: '',
      sodium_mg: '',
      calcium_mg: '',
      water_ml: '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [displayBarcode, setDisplayBarcode] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [selectedAdditives, setSelectedAdditives] = useState<any[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Additives dialog state
  const [additiveSearchQuery, setAdditiveSearchQuery] = useState('');
  const [selectedAdditiveFilter, setSelectedAdditiveFilter] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadAdditives();
    loadAllergens();
    loadLabels();
  }, []);

  const cleanBarcode = (v: string) => (v || '').toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 32);

  const formatBarcode = (value: string) => {
    const raw = cleanBarcode(value);
    if (!raw) return '';
    if (/^[0-9]+$/.test(raw)) {
      const d = raw;
      if (d.length <= 3) return d;
      if (d.length <= 7) return d.replace(/^(\d{3})(\d+)/, '$1 $2');
      if (d.length <= 12) return d.replace(/^(\d{3})(\d{4})(\d+)/, '$1 $2 $3');
      return d.replace(/^(\d{3})(\d{4})(\d{5})(\d{1})/, '$1 $2 $3 $4');
    }
    return raw.match(/.{1,4}/g)?.join(' ') ?? raw;
  };

  const handleBarcodeChange = (text: string) => {
    const cleaned = cleanBarcode(text);
    setForm({ ...form, barcode: cleaned });
    setDisplayBarcode(formatBarcode(text));
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadAdditives = async () => {
    setLoadingAdditives(true);
    try {
      const { data, error } = await supabase
        .from('additives')
        .select('id, code, name, description, halal_status')
        .order('code');

      if (error) throw error;
      setAdditives(data || []);
    } catch (error) {
      console.error('Error loading additives:', error);
    } finally {
      setLoadingAdditives(false);
    }
  };

  const loadAllergens = async () => {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAllergensList(data || []);
    } catch (error) {
      console.error('Error loading allergens:', error);
    }
  };

  const loadLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('labels')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setLabelsList(data || []);
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageFile(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setImageFile(null);
    setForm({ ...form, image_url: '' });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.uri.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Convertir l'URI en blob
      const response = await fetch(imageFile.uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type || `image/${fileExt}`,
        });

      if (error) {
        console.error('Upload error:', error);
        setErrorMessage('Échec de l\'upload');
        setErrorSnackbar(true);
        return null;
      }

      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl ?? null;

      if (!publicUrl) {
        setErrorMessage('Image uploadée mais URL publique introuvable');
        setErrorSnackbar(true);
        return null;
      }

      return publicUrl;
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setErrorMessage(err?.message || 'Erreur inattendue');
      setErrorSnackbar(true);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const getAdditiveColor = (additive: any) => {
    if (typeof additive === 'object' && additive.halal_status) {
      const colors: Record<string, string> = {
        halal: '#4CAF50',
        haram: '#F44336',
        mashbuh: '#FF9800',
      };
      return colors[additive.halal_status] || '#9E9E9E';
    }
    return '#9E9E9E';
  };

  const getAdditiveIcon = (additive: any) => {
    if (typeof additive === 'object' && additive.halal_status) {
      const icons: Record<string, string> = {
        halal: 'check-circle',
        haram: 'close-circle',
        mashbuh: 'help-circle',
      };
      return icons[additive.halal_status] || 'circle';
    }
    return 'circle';
  };

  const filteredAdditives = additives.filter((a) => {
    if (additiveSearchQuery) {
      const query = additiveSearchQuery.toLowerCase();
      if (!a.code.toLowerCase().includes(query) && !a.name.toLowerCase().includes(query) &&
        !(a.description && a.description.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (selectedAdditiveFilter) {
      return a.halal_status === selectedAdditiveFilter;
    }
    return true;
  });

  const isAdditiveSelected = (additive: any) => {
    return selectedAdditives.some(
      (sel) =>
        typeof sel === 'object' && typeof additive === 'object' ? sel.id === additive.id : sel === additive
    );
  };

  const toggleAdditive = (additive: any) => {
    const index = selectedAdditives.findIndex(
      (sel) =>
        typeof sel === 'object' && typeof additive === 'object' ? sel.id === additive.id : sel === additive
    );

    if (index > -1) {
      setSelectedAdditives(selectedAdditives.filter((_, i) => i !== index));
    } else {
      setSelectedAdditives([...selectedAdditives, additive]);
    }
  };

  const removeAdditive = (additive: any) => {
    setSelectedAdditives(
      selectedAdditives.filter(
        (sel) =>
          typeof sel === 'object' && typeof additive === 'object' ? sel.id !== additive.id : sel !== additive
      )
    );
  };

  const isStep1Valid = () => {
    return !!(form.name && form.category_id);
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const logContribution = async (productId: string, email: string, changeType: 'create' | 'update', changeData: any) => {
    try {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase());

      if (userError) {
        console.error('Erreur lors de la récupération de l\'utilisateur', userError);
        return;
      }

      if (!users || users.length === 0) {
        console.error('Aucun utilisateur trouvé avec cet email');
        return;
      }

      const userId = users[0].id;

      const { error: productError } = await supabase
        .from('product_contributors')
        .insert([{ product_id: productId, user_id: userId, change_type: changeType, change_data: changeData }]);

      if (productError) {
        console.error('Erreur logContribution:', productError);
      }
    } catch (error) {
      console.error('Error logging contribution:', error);
    }
  };

  const submitProduct = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter un produit');
      router.push('/(auth)/login');
      return;
    }

    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      let imageUrl = form.image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .upsert(
          [
            {
              barcode: form.barcode || null,
              name: form.name,
              brand: form.brand || null,
              category_id: form.category_id,
              portion_description: form.portion_description || null,
              image_url: imageUrl,
            },
          ],
          { onConflict: 'barcode', ignoreDuplicates: false }
        )
        .select()
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Le produit existe déjà ou création impossible');

      const productId = product.id;
      setCreatedProductId(productId);

      const isUpdate = product.updated_at !== product.created_at;

      const { error: halalError } = await supabase.from('halal_certifications').upsert(
        [
          {
            product_id: productId,
            halal_status: form.halal_status,
            certification_body: form.certification_body || null,
            certificate_number: form.certificate_number || null,
            certified_date: form.certified_date || null,
            expiry_date: form.expiry_date || null,
            notes: form.halal_notes || null,
          },
        ],
        { onConflict: 'product_id', ignoreDuplicates: true }
      );
      if (halalError) throw halalError;

      const hasNutritionData = Object.values(form.nutrition).some(
        (v) => v !== null && v !== undefined && v !== ''
      );
      if (hasNutritionData) {
        const nutritionData: any = { product_id: productId };
        Object.keys(form.nutrition).forEach((key) => {
          const value = form.nutrition[key as keyof typeof form.nutrition];
          if (value !== '' && value !== null && value !== undefined) {
            nutritionData[key] = parseFloat(value as string);
          }
        });

        const { error: nutritionError } = await supabase
          .from('nutrition_facts')
          .upsert([nutritionData], { onConflict: 'product_id', ignoreDuplicates: true });
        if (nutritionError) throw nutritionError;
      }

      const ingredientMappings = [];
      const ingredients = ingredientsInput.split(',').map((s) => s.trim()).filter(Boolean);
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientName = ingredients[i];
        const { data: existing } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredientName)
          .single();
        if (existing) {
          ingredientMappings.push({ product_id: productId, ingredient_id: existing.id, position: i + 1 });
        } else {
          const { data: newIngredient, error } = await supabase
            .from('ingredients')
            .insert([{ name: ingredientName }])
            .select()
            .single();
          if (error) continue;
          ingredientMappings.push({ product_id: productId, ingredient_id: newIngredient.id, position: i + 1 });
        }
      }
      if (ingredientMappings.length) {
        await supabase.from('product_ingredients').upsert(ingredientMappings, { ignoreDuplicates: true });
      }

      const additiveMappings = [];
      for (const additive of selectedAdditives) {
        let additiveId: string;
        if (typeof additive === 'string') {
          const code = additive.toUpperCase();
          const { data: existingAdditive } = await supabase
            .from('additives')
            .select('id')
            .eq('code', code)
            .single();
          if (existingAdditive) {
            additiveId = existingAdditive.id;
          } else {
            const { data: newAdditive, error } = await supabase
              .from('additives')
              .insert([{ code, name: code }])
              .select()
              .single();
            if (error) continue;
            additiveId = newAdditive.id;
          }
        } else {
          additiveId = additive.id;
        }
        additiveMappings.push({ product_id: productId, additive_id: additiveId });
      }
      if (additiveMappings.length) {
        await supabase.from('product_additives').upsert(additiveMappings, { ignoreDuplicates: true });
      }

      if (selectedAllergens.length > 0) {
        const allergenMappings = selectedAllergens.map((id) => ({
          product_id: productId,
          allergen_id: id,
          presence_type: 'contient',
        }));
        await supabase.from('product_allergens').upsert(allergenMappings, { ignoreDuplicates: true });
      }

      if (selectedLabels.length > 0) {
        const labelMappings = selectedLabels.map((id) => ({ product_id: productId, label_id: id }));
        await supabase.from('product_labels').upsert(labelMappings, { ignoreDuplicates: true });
      }

      if (!currentUser.email) {
        throw new Error("L'utilisateur n'a pas d'email, impossible de loguer la contribution");
      }

      await logContribution(product.id, currentUser.email, isUpdate ? 'update' : 'create', { ...form });

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error submitting product:', error);
      setErrorMessage(error.message || 'Erreur lors de la création du produit');
      setErrorSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = () => {
    setShowSuccessDialog(false);
    router.push(`/product/${createdProductId}`);
  };

  const addAnother = () => {
    setShowSuccessDialog(false);
    resetForm();
    setStep(1);
  };

  const resetForm = () => {
    setForm({
      barcode: '',
      name: '',
      brand: '',
      category_id: null,
      portion_description: '',
      image_url: '',
      halal_status: 'halal',
      certification_body: '',
      certificate_number: '',
      certified_date: '',
      expiry_date: '',
      halal_notes: '',
      nutrition: {
        calories_kcal: '',
        protein_g: '',
        carbs_g: '',
        sugars_g: '',
        fats_g: '',
        saturated_fats_g: '',
        fibres_g: '',
        sodium_mg: '',
        calcium_mg: '',
        water_ml: '',
      },
    });
    setImagePreview('');
    setImageFile(null);
    setDisplayBarcode('');
    setIngredientsInput('');
    setSelectedAdditives([]);
    setSelectedAllergens([]);
    setSelectedLabels([]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Appbar.Header>
          <Appbar.Content title="Contribuer" />
        </Appbar.Header>
        <View style={styles.notLoggedIn}>
          <Text variant="titleLarge" style={{ marginBottom: 16, textAlign: 'center' }}>
            Connexion requise
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 8, textAlign: 'center' }}>
            Connectez-vous pour ajouter un produit à la base de données
          </Text>
          <Text
            variant="bodySmall"
            style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onSurfaceVariant }}
          >
            En mode invité, vous pouvez consulter les produits mais pas en ajouter
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.button}
          >
            Se connecter
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.button}
          >
            Créer un compte
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Nouveau produit" />
        <Appbar.Action icon="help-circle" onPress={() => setShowHelpDialog(true)} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stepper */}
        <View style={styles.stepper}>
          {STEPS.map((s, index) => (
            <React.Fragment key={s.value}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: step >= s.value ? theme.colors.primary : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: step >= s.value ? '#fff' : theme.colors.onSurfaceVariant,
                      fontWeight: 'bold',
                    }}
                  >
                    {s.value}
                  </Text>
                </View>
                <Text
                  variant="labelSmall"
                  style={{
                    marginTop: 4,
                    color: step >= s.value ? theme.colors.primary : theme.colors.onSurfaceVariant,
                  }}
                >
                  {s.title}
                </Text>
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: step > s.value ? theme.colors.primary : theme.colors.surfaceVariant },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Step 1: Informations de base */}
        {step === 1 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="package-variant" size={32} iconColor={theme.colors.primary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Informations de base
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Commençons par les détails essentiels
                  </Text>
                </View>
              </View>

              <TextInput
                label="Code-barres"
                value={displayBarcode}
                onChangeText={handleBarcodeChange}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="barcode" />}
                placeholder="3017620422003"
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: -12, marginBottom: 8 }}>
                Jusqu'à 32 caractères
              </Text>

              <TextInput
                label="Nom du produit *"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="tag" />}
                placeholder="Coca-Cola Zero"
              />

              <TextInput
                label="Marque"
                value={form.brand}
                onChangeText={(text) => setForm({ ...form, brand: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="store" />}
                placeholder="Coca-Cola"
              />

              <TouchableOpacity onPress={() => setShowCategoryDialog(true)}>
                <TextInput
                  label="Catégorie *"
                  value={categories.find((c) => c.id === form.category_id)?.name || ''}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="shape" />}
                  placeholder="Sélectionnez une catégorie"
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                />
              </TouchableOpacity>

              <TextInput
                label="Description de la portion"
                value={form.portion_description}
                onChangeText={(text) => setForm({ ...form, portion_description: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="scale" />}
                placeholder="100g, 330ml, 1 pièce..."
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: -12, marginBottom: 8 }}>
                Précisez la taille de référence pour les valeurs nutritionnelles
              </Text>

              <Text variant="labelMedium" style={{ marginBottom: 8, marginTop: 8 }}>
                Photo du produit
              </Text>
              {uploadingImage ? (
                <View style={styles.imageUploadContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={{ marginTop: 8 }}>Upload en cours...</Text>
                </View>
              ) : !imagePreview ? (
                <TouchableOpacity style={styles.imageUploadContainer} onPress={selectImage}>
                  <IconButton icon="image-plus" size={48} iconColor={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyLarge" style={{ marginBottom: 4 }}>
                    Ajouter une photo
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    PNG, JPG jusqu'à 5MB
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                  <IconButton
                    icon="close"
                    size={24}
                    iconColor="#fff"
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  />
                </View>
              )}
            </Card.Content>

            <Card.Actions>
              <Button
                mode="contained"
                onPress={nextStep}
                disabled={!isStep1Valid()}
                style={styles.nextButton}
              >
                Continuer
              </Button>
            </Card.Actions>
          </Card>
        )}

        {/* Step 2: Statut Halal */}
        {step === 2 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="shield-check" size={32} iconColor={theme.colors.primary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Statut Halal
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Informations sur la certification halal
                  </Text>
                </View>
              </View>

              <Text variant="labelMedium" style={{ marginBottom: 12, marginTop: 8 }}>
                Statut Halal *
              </Text>
              <View style={styles.halalStatusContainer}>
                {HALAL_STATUSES.map((status) => (
                  <Chip
                    key={status.value}
                    selected={form.halal_status === status.value}
                    onPress={() => setForm({ ...form, halal_status: status.value })}
                    icon={status.icon}
                    style={[
                      styles.halalChip,
                      form.halal_status === status.value && { backgroundColor: status.color },
                    ]}
                    textStyle={{
                      color: form.halal_status === status.value ? '#fff' : theme.colors.onSurface,
                    }}
                  >
                    {status.label}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Organisme certificateur"
                value={form.certification_body}
                onChangeText={(text) => setForm({ ...form, certification_body: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="certificate" />}
                placeholder="AVS, SFCVH..."
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: -12, marginBottom: 8 }}>
                Laissez vide si non certifié
              </Text>

              <TextInput
                label="Notes additionnelles"
                value={form.halal_notes}
                onChangeText={(text) => setForm({ ...form, halal_notes: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="note-text" />}
                placeholder="Informations complémentaires sur la certification..."
                multiline
                numberOfLines={3}
              />
            </Card.Content>

            <Card.Actions>
              <Button mode="text" onPress={prevStep} style={styles.prevButton}>
                Retour
              </Button>
              <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
                Continuer
              </Button>
            </Card.Actions>
          </Card>
        )}

        {/* Step 3: Composition */}
        {step === 3 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="flask" size={32} iconColor={theme.colors.secondary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Ingrédients & Additifs
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Composition détaillée du produit
                  </Text>
                </View>
              </View>

              <TextInput
                label="Ingrédients"
                value={ingredientsInput}
                onChangeText={setIngredientsInput}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="leaf" />}
                placeholder="Eau, sucre, arômes..."
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: -12, marginBottom: 8 }}>
                Séparez par des virgules. Dans l'ordre de la liste
              </Text>

              <Text variant="labelMedium" style={{ marginBottom: 8, marginTop: 8 }}>
                Additifs
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowAdditivesDialog(true)}
                style={styles.additivesButton}
                icon="flask-outline"
              >
                {selectedAdditives.length === 0
                  ? 'Sélectionner des additifs'
                  : `${selectedAdditives.length} additif${selectedAdditives.length > 1 ? 's' : ''} sélectionné${selectedAdditives.length > 1 ? 's' : ''}`}
              </Button>
              {selectedAdditives.length > 0 && (
                <View style={styles.chipsContainer}>
                  {selectedAdditives.map((additive, idx) => (
                    <Chip
                      key={idx}
                      onClose={() => removeAdditive(additive)}
                      icon={getAdditiveIcon(additive)}
                      style={[styles.chip, { backgroundColor: getAdditiveColor(additive) }]}
                      textStyle={{ color: '#fff' }}
                    >
                      {typeof additive === 'object' ? additive.code : additive}
                    </Chip>
                  ))}
                </View>
              )}

              <Text variant="labelMedium" style={{ marginBottom: 8, marginTop: 16 }}>
                Allergènes
              </Text>
              <View style={styles.chipsContainer}>
                {allergensList.map((allergen) => (
                  <Chip
                    key={allergen.id}
                    selected={selectedAllergens.includes(allergen.id)}
                    onPress={() => {
                      if (selectedAllergens.includes(allergen.id)) {
                        setSelectedAllergens(selectedAllergens.filter((id) => id !== allergen.id));
                      } else {
                        setSelectedAllergens([...selectedAllergens, allergen.id]);
                      }
                    }}
                    style={styles.chip}
                  >
                    {allergen.name}
                  </Chip>
                ))}
              </View>

              <Text variant="labelMedium" style={{ marginBottom: 8, marginTop: 16 }}>
                Labels & Certifications
              </Text>
              <View style={styles.chipsContainer}>
                {labelsList.map((label) => (
                  <Chip
                    key={label.id}
                    selected={selectedLabels.includes(label.id)}
                    onPress={() => {
                      if (selectedLabels.includes(label.id)) {
                        setSelectedLabels(selectedLabels.filter((id) => id !== label.id));
                      } else {
                        setSelectedLabels([...selectedLabels, label.id]);
                      }
                    }}
                    style={styles.chip}
                  >
                    {label.name}
                  </Chip>
                ))}
              </View>
            </Card.Content>

            <Card.Actions>
              <Button mode="text" onPress={prevStep} style={styles.prevButton}>
                Retour
              </Button>
              <Button mode="contained" onPress={nextStep} style={styles.nextButton}>
                Continuer
              </Button>
            </Card.Actions>
          </Card>
        )}

        {/* Step 4: Nutrition */}
        {step === 4 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="nutrition" size={32} iconColor={theme.colors.tertiary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Valeurs nutritionnelles
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Pour {form.portion_description || '100g'}
                  </Text>
                </View>
              </View>

              {NUTRITION_FIELDS.map((field) => (
                <TextInput
                  key={field.key}
                  label={`${field.label} (${field.suffix})`}
                  value={form.nutrition[field.key as keyof typeof form.nutrition] as string}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      nutrition: { ...form.nutrition, [field.key]: text },
                    })
                  }
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon={field.icon as any} />}
                  keyboardType="decimal-pad"
                />
              ))}
            </Card.Content>

            <Card.Actions>
              <Button mode="text" onPress={prevStep} style={styles.prevButton}>
                Retour
              </Button>
              <Button
                mode="contained"
                onPress={submitProduct}
                loading={loading}
                style={styles.nextButton}
              >
                Publier le produit
              </Button>
            </Card.Actions>
          </Card>
        )}
      </ScrollView>

      {/* Success Dialog */}
      <Portal>
        <Dialog visible={showSuccessDialog} onDismiss={() => setShowSuccessDialog(false)}>
          <Dialog.Content>
            <View style={styles.successDialog}>
              <IconButton icon="check-circle" size={64} iconColor="#4CAF50" />
              <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
                Produit ajouté !
              </Text>
              <Text variant="bodyMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
                Merci pour votre contribution. Le produit a été ajouté avec succès.
              </Text>
              <Button mode="contained" onPress={goToProduct} style={styles.dialogButton}>
                Voir le produit
              </Button>
              <Button mode="text" onPress={addAnother} style={styles.dialogButton}>
                Ajouter un autre produit
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Additives Dialog */}
      <Portal>
        <Dialog
          visible={showAdditivesDialog}
          onDismiss={() => setShowAdditivesDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Sélectionner des additifs</Dialog.Title>
          <Dialog.Content>
            <Searchbar
              placeholder="Rechercher par code (E330) ou nom..."
              onChangeText={setAdditiveSearchQuery}
              value={additiveSearchQuery}
              style={styles.searchbar}
            />
            <View style={styles.filterChips}>
              {ADDITIVE_FILTER_STATUSES.map((status) => (
                <Chip
                  key={status.value}
                  selected={selectedAdditiveFilter === status.value}
                  onPress={() =>
                    setSelectedAdditiveFilter(
                      selectedAdditiveFilter === status.value ? null : status.value
                    )
                  }
                  icon={status.icon}
                  style={[
                    styles.filterChip,
                    selectedAdditiveFilter === status.value && { backgroundColor: status.color },
                  ]}
                >
                  {status.label}
                </Chip>
              ))}
            </View>
            <Text variant="bodySmall" style={{ marginBottom: 8, marginTop: 8 }}>
              {filteredAdditives.length} additif{filteredAdditives.length > 1 ? 's' : ''} trouvé
              {filteredAdditives.length > 1 ? 's' : ''}
            </Text>
            <ScrollView style={styles.additivesList}>
              {filteredAdditives.map((additive) => (
                <Surface key={additive.id} style={styles.additiveItem}>
                  <Checkbox
                    status={isAdditiveSelected(additive) ? 'checked' : 'unchecked'}
                    onPress={() => toggleAdditive(additive)}
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Chip
                        style={[
                          styles.additiveChip,
                          { backgroundColor: getAdditiveColor(additive) },
                        ]}
                        textStyle={{ color: '#fff', fontSize: 10 }}
                      >
                        {additive.code}
                      </Chip>
                      <Text variant="bodyMedium" style={{ marginLeft: 8, flex: 1 }}>
                        {additive.name}
                      </Text>
                    </View>
                    {additive.description && (
                      <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onSurfaceVariant }}>
                        {additive.description}
                      </Text>
                    )}
                  </View>
                </Surface>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAdditivesDialog(false)}>Annuler</Button>
            <Button mode="contained" onPress={() => setShowAdditivesDialog(false)}>
              Valider ({selectedAdditives.length})
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Category Dialog */}
      <Portal>
        <Dialog visible={showCategoryDialog} onDismiss={() => setShowCategoryDialog(false)}>
          <Dialog.Title>Sélectionner une catégorie</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 400 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => {
                    setForm({ ...form, category_id: category.id });
                    setShowCategoryDialog(false);
                  }}
                  style={styles.categoryItem}
                >
                  <Text variant="bodyLarge">{category.name}</Text>
                  {form.category_id === category.id && (
                    <IconButton icon="check" size={24} iconColor={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCategoryDialog(false)}>Annuler</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Help Dialog */}
      <Portal>
        <Dialog visible={showHelpDialog} onDismiss={() => setShowHelpDialog(false)}>
          <Dialog.Title>Aide</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Comment trouver le code-barres ?
            </Text>
            <Text variant="bodySmall" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              Le code-barres (EAN-13) est généralement situé au dos du produit. Il se compose de 13
              chiffres. Vous pouvez le scanner avec votre appareil photo ou le saisir manuellement.
            </Text>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Qu'est-ce qu'un additif ?
            </Text>
            <Text variant="bodySmall" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              Les additifs sont des substances ajoutées aux aliments (colorants, conservateurs, etc.).
              Ils sont identifiés par un code E suivi de chiffres (ex: E471, E330).
            </Text>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Comment vérifier le statut halal ?
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Vérifiez si le produit possède une certification halal reconnue (AVS, SFCVH, etc.). En
              cas de doute, marquez-le comme "Douteux" et ajoutez des notes explicatives.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowHelpDialog(false)}>Fermer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={errorSnackbar}
        onDismiss={() => setErrorSnackbar(false)}
        duration={5000}
        action={{
          label: 'Fermer',
          onPress: () => setErrorSnackbar(false),
        }}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    maxWidth: 60,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 150,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  halalStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  halalChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  additivesButton: {
    marginBottom: 16,
  },
  nextButton: {
    marginLeft: 'auto',
  },
  prevButton: {
    marginRight: 'auto',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  button: {
    marginTop: 12,
    width: '100%',
    maxWidth: 300,
  },
  dialog: {
    maxHeight: '80%',
  },
  searchbar: {
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  additivesList: {
    maxHeight: 300,
  },
  additiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  additiveChip: {
    height: 24,
  },
  successDialog: {
    alignItems: 'center',
    padding: 16,
  },
  dialogButton: {
    marginTop: 8,
    width: '100%',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
