import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GUEST_MODE: '@iofd:guest_mode',
  HAS_LAUNCHED: '@iofd:has_launched',
};

export const StorageService = {
  async setGuestMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GUEST_MODE, JSON.stringify(enabled));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode invité:', error);
    }
  },

  async getGuestMode(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Erreur lors de la récupération du mode invité:', error);
      return false;
    }
  },

  async clearGuestMode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    } catch (error) {
      console.error('Erreur lors de la suppression du mode invité:', error);
    }
  },

  // Premier lancement
  async setHasLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut de lancement:', error);
    }
  },

  async getHasLaunched(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
      return value === 'true';
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de lancement:', error);
      return false;
    }
  },
};

