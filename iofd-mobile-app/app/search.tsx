import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Button, Card, Chip, Text, TextInput, useTheme } from 'react-native-paper';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchProducts();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setProducts([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const query = `%${searchQuery}%`;
      
      // Recherche dans nom, marque et code-barres
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .or(`name.ilike.${query},brand.ilike.${query},barcode.ilike.${query}`)
        .limit(50)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la recherche:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: any) => {
    // Utiliser le code-barres si disponible, sinon l'ID
    const identifier = product.barcode || product.id;
    router.push({
      pathname: '/product/[barcode]',
      params: { barcode: identifier },
    });
  };

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Rechercher un produit" />
      </Appbar.Header>

      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <TextInput
          label="Rechercher par nom, marque ou code-barres"
          value={searchQuery}
          onChangeText={setSearchQuery}
          mode="outlined"
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon 
                icon="close" 
                onPress={() => {
                  setSearchQuery('');
                  setProducts([]);
                  setHasSearched(false);
                }}
              />
            ) : null
          }
          autoFocus
          returnKeyType="search"
          onSubmitEditing={searchProducts}
        />

        {loading && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}

        {!loading && hasSearched && searchQuery.length >= 2 && (
          <Text variant="bodyMedium" style={[styles.resultCount, { color: theme.colors.onSurfaceVariant }]}>
            {products.length} résultat{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
          </Text>
        )}

        {!loading && hasSearched && products.length === 0 && searchQuery.length >= 2 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleLarge" style={styles.emptyTitle}>
                Aucun résultat
              </Text>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                Aucun produit trouvé pour "{searchQuery}"
              </Text>
              <Button
                mode="outlined"
                onPress={() => router.push('/(tabs)/contribute')}
                style={styles.addButton}
                icon="plus"
              >
                Ajouter ce produit
              </Button>
            </Card.Content>
          </Card>
        )}

        {!loading && products.map((product) => (
          <TouchableOpacity
            key={product.id}
            onPress={() => handleProductPress(product)}
            activeOpacity={0.7}
          >
            <Card style={styles.productCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                {product.brand && (
                  <Text variant="bodyMedium" style={[styles.productBrand, { color: theme.colors.onSurfaceVariant }]}>
                    {product.brand}
                  </Text>
                )}
                <View style={styles.productMeta}>
                  {product.category && (
                    <Chip
                      icon="tag"
                      style={styles.categoryChip}
                      mode="outlined"
                      compact
                    >
                      {product.category.name}
                    </Chip>
                  )}
                  {product.barcode && (
                    <Text variant="bodySmall" style={[styles.barcode, { color: theme.colors.onSurfaceVariant }]}>
                      Code: {product.barcode}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 32,
  },
  resultCount: {
    marginBottom: 16,
    fontWeight: '500',
  },
  productCard: {
    marginBottom: 12,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  barcode: {
    fontFamily: 'monospace',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
});

