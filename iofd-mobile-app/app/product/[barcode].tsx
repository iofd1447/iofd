import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Dimensions, Image } from 'react-native';
import { Appbar, Button, Card, Chip, Text, useTheme, Divider, List, IconButton, ProgressBar, Surface } from 'react-native-paper';

const { width } = Dimensions.get('window');

// Fonctions utilitaires
const getHalalColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'halal': return '#4CAF50';
    case 'haram': return '#F44336';
    case 'mashbuh': 
    case 'douteux': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const getHalalIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'halal': return 'check-circle';
    case 'haram': return 'close-circle';
    case 'mashbuh':
    case 'douteux': return 'help-circle';
    default: return 'information';
  }
};

const getIngredientColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'halal': return '#4CAF50';
    case 'haram': return '#F44336';
    case 'douteux': return '#FF9800';
    default: return '#9E9E9E';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export default function ProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [portionSize, setPortionSize] = useState(100);

  useEffect(() => {
    if (barcode) {
      fetchProduct();
    }
  }, [barcode]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          nutrition:nutrition_facts!nutrition_facts_product_id_fkey(*),
          halal_certification:halal_certifications(*),
          product_ingredients(ingredient:ingredients(name, description, halal_status)),
          product_additives(additive:additives(code, name, halal_status, origin_type, function)),
          product_allergens(allergen:allergens(name, description, presence_type)),
          product_labels(label:labels(name)),
          community_reviews(rating, user_name, user_email, halal_vote, comment, helpful_count, created_at)
        `);

      const isBarcode = /^\d+$/.test(barcode);
      
      if (isBarcode) {
        query = query.eq('barcode', barcode);
      } else {
        query = query.eq('id', barcode);
      }

      const { data, error: fetchError } = await query.single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Produit non trouvé');
        } else {
          throw fetchError;
        }
      } else {
        // Formater les données
        const reviews = (data.community_reviews || []).map((r: any) => ({
          rating: r.rating ?? 0,
          user_name: r.user_name ?? 'Utilisateur',
          halal_vote: r.halal_vote ?? '',
          comment: r.comment ?? '',
          created_at: r.created_at
        }));

        const avgRating = reviews.length
          ? reviews.reduce((a: any, b: any) => a + (b.rating || 0), 0) / reviews.length
          : 0;

        setProduct({
          ...data,
          category: data.category?.name || 'Autre',
          halal_status: data.halal_certification?.[0]?.halal_status || data.halal_certification?.halal_status,
          certification: data.halal_certification?.[0] || null,
          nutrition: data.nutrition?.[0] || data.nutrition || {},
          ingredients: (data.product_ingredients || [])
            .filter((i: any) => i.ingredient?.name)
            .map((i: any) => i.ingredient),
          additives: (data.product_additives || []).map((a: any) => a.additive),
          allergens: (data.product_allergens || []).map((a: any) => ({
            ...a.allergen,
            presence_type: a.presence_type
          })),
          labels: (data.product_labels || []).map((l: any) => l.label),
          reviews,
          rating: avgRating,
          reviews_count: reviews.length
        });
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la récupération du produit');
    } finally {
      setLoading(false);
    }
  };

  const scaledNutrition = (key: string) => {
    const value = product?.nutrition?.[key] || 0;
    return ((value * portionSize) / 100).toFixed(1);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Produit" />
        </Appbar.Header>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
            Chargement du produit...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Produit" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="titleLarge" style={styles.errorTitle}>
            {error || 'Produit non trouvé'}
          </Text>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
            Le produit avec le code-barres {barcode} n'a pas été trouvé dans la base de données.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)/contribute')}
            style={styles.button}
          >
            Ajouter ce produit
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
        <Appbar.Content title={product.name} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image et statut halal */}
        <Card style={styles.heroCard}>
          {product.image_url && (
            <Card.Cover 
              source={{ uri: product.image_url }} 
              style={styles.productImage}
            />
          )}
          <Card.Content style={styles.heroContent}>
            <Chip
              icon={getHalalIcon(product.halal_status)}
              style={[styles.halalChip, { backgroundColor: getHalalColor(product.halal_status) }]}
              textStyle={{ color: 'white', fontWeight: 'bold' }}
            >
              {product.halal_status?.toUpperCase() || 'NON CERTIFIÉ'}
            </Chip>
          </Card.Content>
        </Card>

        {/* Informations principales */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.ratingContainer}>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {product.rating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ({product.reviews_count} avis)
              </Text>
            </View>

            <Text variant="headlineMedium" style={styles.productName}>
              {product.name}
            </Text>
            {product.brand && (
              <Text variant="titleMedium" style={[styles.productBrand, { color: theme.colors.onSurfaceVariant }]}>
                {product.brand}
              </Text>
            )}

            <View style={styles.chipsContainer}>
              {product.category && (
                <Chip icon="tag" mode="outlined" style={styles.chip}>
                  {product.category}
                </Chip>
              )}
              {product.barcode && (
                <Chip icon="barcode" mode="outlined" style={styles.chip}>
                  {product.barcode}
                </Chip>
              )}
            </View>

            {product.labels?.length > 0 && (
              <View style={styles.labelsContainer}>
                <Text variant="labelMedium" style={styles.sectionLabel}>
                  Labels & Certifications
                </Text>
                <View style={styles.chipsContainer}>
                  {product.labels.map((label: any, idx: number) => (
                    <Chip
                      key={idx}
                      icon="check-decagram"
                      mode="flat"
                      style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}
                    >
                      {label.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Certification Halal */}
        {product.certification && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="certificate" size={32} iconColor={theme.colors.primary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Certification Halal
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Informations de certification
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Organisme
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {product.certification.certification_body}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Numéro
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {product.certification.certificate_number}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Certification
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {formatDate(product.certification.certified_date)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Expiration
                  </Text>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                    {formatDate(product.certification.expiry_date)}
                  </Text>
                </View>
              </View>

              {product.certification.verified_by_community && (
                <Surface style={[styles.verifiedBanner, { backgroundColor: theme.colors.primaryContainer }]}>
                  <IconButton icon="account-check" size={20} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      Vérifié par la communauté
                    </Text>
                    <Text variant="bodySmall">
                      {product.certification.verification_count} vérifications
                    </Text>
                  </View>
                </Surface>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Valeurs nutritionnelles */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <IconButton icon="nutrition" size={32} iconColor={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Valeurs nutritionnelles
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Pour {portionSize}g
                </Text>
              </View>
              <IconButton
                icon={showAllNutrients ? 'chevron-up' : 'chevron-down'}
                onPress={() => setShowAllNutrients(!showAllNutrients)}
              />
            </View>

            <View style={styles.macrosGrid}>
              {/* Calories */}
              <Surface style={[styles.macroCard, { borderLeftColor: '#F44336', borderLeftWidth: 4 }]}>
                <IconButton icon="fire" size={28} iconColor="#F44336" />
                <Text variant="headlineSmall" style={{ color: '#F44336', fontWeight: 'bold' }}>
                  {scaledNutrition('calories_kcal')}
                </Text>
                <Text variant="bodySmall">kcal</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Énergie
                </Text>
              </Surface>

              {/* Protéines */}
              <Surface style={[styles.macroCard, { borderLeftColor: '#2196F3', borderLeftWidth: 4 }]}>
                <IconButton icon="dumbbell" size={28} iconColor="#2196F3" />
                <Text variant="headlineSmall" style={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {scaledNutrition('protein_g')}
                </Text>
                <Text variant="bodySmall">g</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Protéines
                </Text>
              </Surface>

              {/* Glucides */}
              <Surface style={[styles.macroCard, { borderLeftColor: '#FF9800', borderLeftWidth: 4 }]}>
                <IconButton icon="grain" size={28} iconColor="#FF9800" />
                <Text variant="headlineSmall" style={{ color: '#FF9800', fontWeight: 'bold' }}>
                  {scaledNutrition('carbs_g')}
                </Text>
                <Text variant="bodySmall">g</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Glucides
                </Text>
              </Surface>

              {/* Lipides */}
              <Surface style={[styles.macroCard, { borderLeftColor: '#9C27B0', borderLeftWidth: 4 }]}>
                <IconButton icon="water" size={28} iconColor="#9C27B0" />
                <Text variant="headlineSmall" style={{ color: '#9C27B0', fontWeight: 'bold' }}>
                  {scaledNutrition('fats_g')}
                </Text>
                <Text variant="bodySmall">g</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Lipides
                </Text>
              </Surface>
            </View>

            {showAllNutrients && (
              <View style={{ marginTop: 16 }}>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Détails nutritionnels
                </Text>
                
                {[
                  { key: 'sugars_g', label: 'dont Sucres', unit: 'g', max: 50, color: '#F44336' },
                  { key: 'saturated_fats_g', label: 'dont Acides gras saturés', unit: 'g', max: 20, color: '#FF9800' },
                  { key: 'fibres_g', label: 'Fibres', unit: 'g', max: 15, color: '#4CAF50' },
                  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', max: 2000, color: '#9E9E9E' },
                  { key: 'calcium_mg', label: 'Calcium', unit: 'mg', max: 900, color: '#2196F3' },
                ].map((nutrient) => (
                  <View key={nutrient.key} style={styles.nutrientRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{nutrient.label}</Text>
                      <ProgressBar
                        progress={Math.min((Number(scaledNutrition(nutrient.key)) / nutrient.max), 1)}
                        color={nutrient.color}
                        style={{ marginTop: 4, height: 6, borderRadius: 3 }}
                      />
                    </View>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginLeft: 12 }}>
                      {scaledNutrition(nutrient.key)} {nutrient.unit}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Ingrédients */}
        {product.ingredients?.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="format-list-bulleted" size={32} iconColor={theme.colors.secondary} />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Ingrédients
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {product.ingredients.length} ingrédients détectés
                  </Text>
                </View>
              </View>
              
              <Text variant="bodyMedium" style={{ lineHeight: 24, marginTop: 8 }}>
                {product.ingredients.map((i: any) => i.name).join(', ')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Additifs */}
        {product.additives?.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="flask" size={32} iconColor="#FF9800" />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Additifs
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {product.additives.length} additifs détectés
                  </Text>
                </View>
              </View>

              {product.additives.map((additive: any, idx: number) => (
                <List.Item
                  key={idx}
                  title={additive.name}
                  description={`${additive.function} • ${additive.origin_type}`}
                  left={() => (
                    <View style={[styles.additiveCode, { backgroundColor: getIngredientColor(additive.halal_status) }]}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                        {additive.code}
                      </Text>
                    </View>
                  )}
                  right={() => (
                    <Chip
                      style={{ backgroundColor: getIngredientColor(additive.halal_status) }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      {additive.halal_status}
                    </Chip>
                  )}
                  style={styles.listItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Allergènes */}
        {product.allergens?.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="alert-circle" size={32} iconColor="#F44336" />
                <View>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    Allergènes
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Informations sur les allergènes
                  </Text>
                </View>
              </View>

              {product.allergens.map((allergen: any, idx: number) => (
                <Surface
                  key={idx}
                  style={[styles.allergenCard, { backgroundColor: theme.colors.errorContainer }]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
                      {allergen.name}
                    </Text>
                    <Chip>
                      {allergen.presence_type || 'Présent'}
                    </Chip>
                  </View>
                  {allergen.description && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {allergen.description}
                    </Text>
                  )}
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <IconButton icon="comment-multiple" size={32} iconColor={theme.colors.tertiary} />
              <View style={{ flex: 1 }}>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Avis de la communauté
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {product.reviews_count} avis
                </Text>
              </View>
              <Button mode="contained-tonal" compact>
                + Avis
              </Button>
            </View>

            {product.reviews?.length > 0 ? (
              product.reviews.map((review: any, idx: number) => (
                <Surface key={idx} style={[styles.reviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {review.user_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {review.user_name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDate(review.created_at)}
                      </Text>
                    </View>
                    <Chip
                      style={{ backgroundColor: getHalalColor(review.halal_vote) }}
                      textStyle={{ color: 'white' }}
                    >
                      {review.halal_vote}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium">{review.comment}</Text>
                </Surface>
              ))
            ) : (
              <Surface style={[styles.emptyState, { backgroundColor: theme.colors.surfaceVariant }]}>
                <IconButton icon="comment-outline" size={48} />
                <Text variant="bodyMedium">
                  Aucun avis pour le moment. Soyez le premier à donner votre avis !
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
  heroCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    height: 250,
  },
  heroContent: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  halalChip: {
    elevation: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  labelsContainer: {
    marginTop: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  additiveCode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  allergenCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
});