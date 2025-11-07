import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Card, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';

export default function ContributeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    barcode: '',
    name: '',
    brand: '',
    category_id: '',
    description: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter un produit');
      router.push('/(auth)/login');
      return;
    }

    if (!form.name || !form.category_id) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Insérer le produit
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          barcode: form.barcode || null,
          name: form.name,
          brand: form.brand || null,
          category_id: form.category_id,
          description: form.description || null,
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Logger la contribution
      if (user.email) {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email.toLowerCase())
          .single();

        if (users) {
          await supabase.from('product_contributors').insert([{
            product_id: product.id,
            user_id: users.id,
            change_type: 'create',
            change_data: form,
          }]);
        }
      }

      setShowSuccess(true);
      // Réinitialiser le formulaire
      setForm({
        barcode: '',
        name: '',
        brand: '',
        category_id: '',
        description: '',
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'ajout du produit');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <Text variant="bodySmall" style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
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
        <Appbar.Content title="Contribuer" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Ajouter un produit
            </Text>
            <Text variant="bodyMedium" style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Partagez vos connaissances avec la communauté
            </Text>

            <TextInput
              label="Code-barres (optionnel)"
              value={form.barcode}
              onChangeText={(text: string) => setForm({ ...form, barcode: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="barcode" />}
            />

            <TextInput
              label="Nom du produit *"
              value={form.name}
              onChangeText={(text:string) => setForm({ ...form, name: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="tag" />}
            />

            <TextInput
              label="Marque (optionnel)"
              value={form.brand}
              onChangeText={(text: string) => setForm({ ...form, brand: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="store" />}
            />

            <TextInput
              label="Catégorie *"
              value={form.category_id}
              onChangeText={(text: string) => setForm({ ...form, category_id: text })}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="shape" />}
              placeholder="Sélectionnez une catégorie"
            />

            <TextInput
              label="Description (optionnel)"
              value={form.description}
              onChangeText={(text: string) => setForm({ ...form, description: text })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              left={<TextInput.Icon icon="text" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              Ajouter le produit
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.primary }}
      >
        Produit ajouté avec succès !
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
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
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
});

