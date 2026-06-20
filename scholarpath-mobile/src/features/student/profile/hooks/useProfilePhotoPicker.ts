import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';

export function useProfilePhotoPicker() {
  const { updateProfile } = useStudentSession();

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Izin Diperlukan',
        'Izinkan akses galeri untuk mengunggah foto profil.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ profilePhotoUri: result.assets[0].uri });
    }
  };

  return { pickPhoto };
}
