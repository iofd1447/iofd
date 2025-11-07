import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Text, useTheme } from 'react-native-paper';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data);
      router.push({
        pathname: '/product/[barcode]',
        params: { barcode: data },
      });
      setTimeout(() => {
        setScanned(false);
        setBarcode(null);
      }, 2000);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Appbar.Header>
          <Appbar.Content title="Scanner" />
        </Appbar.Header>
        <View style={styles.permissionContainer}>
          <Text variant="titleLarge" style={styles.permissionTitle}>
            Permission caméra requise
          </Text>
          <Text variant="bodyMedium" style={[styles.permissionText, { color: theme.colors.onSurfaceVariant }]}>
            Nous avons besoin d'accéder à votre caméra pour scanner les codes-barres
          </Text>
          <Button
            mode="contained"
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            Autoriser l'accès
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Appbar.Header>
        <Appbar.Content title="Scanner un produit" />
        <Appbar.Action 
          icon="magnify" 
          onPress={() => router.push('/search')}
        />
      </Appbar.Header>
      
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text variant="bodyLarge" style={styles.instruction}>
            Positionnez le code-barres dans le cadre
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/search')}
            style={styles.searchButton}
            icon="magnify"
            contentStyle={styles.searchButtonContent}
          >
            Rechercher manuellement
          </Button>
        </View>
      </CameraView>

      {scanned && (
        <View style={styles.scannedContainer}>
          <Text variant="bodyMedium" style={styles.scannedText}>
            Code-barres scanné : {barcode}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 150,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instruction: {
    color: '#fff',
    marginTop: 32,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    borderRadius: 12,
  },
  scannedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  scannedText: {
    color: '#fff',
    textAlign: 'center',
  },
  searchButton: {
    marginTop: 24,
    borderRadius: 12,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
});

