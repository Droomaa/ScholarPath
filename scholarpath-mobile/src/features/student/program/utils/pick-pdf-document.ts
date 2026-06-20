import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

import { MAX_PDF_SIZE_BYTES, type UploadedDocument } from '@/src/types/shared/program-registration';

export async function pickPdfDocument(): Promise<UploadedDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const size = asset.size ?? 0;
  const mimeType = asset.mimeType ?? 'application/pdf';

  if (mimeType !== 'application/pdf') {
    Alert.alert('Format tidak valid', 'Hanya file PDF yang diperbolehkan.');
    return null;
  }

  if (size > MAX_PDF_SIZE_BYTES) {
    Alert.alert('Ukuran file terlalu besar', 'Ukuran maksimal file PDF adalah 100 MB.');
    return null;
  }

  return {
    name: asset.name,
    size,
    uri: asset.uri,
  };
}
