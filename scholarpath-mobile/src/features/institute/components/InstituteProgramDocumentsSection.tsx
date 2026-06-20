import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type InstituteProgramDocument } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProgramDocumentsSectionProps = {
  documents: InstituteProgramDocument[];
  onDocumentPress: (document: InstituteProgramDocument) => void;
};

export function InstituteProgramDocumentsSection({
  documents,
  onDocumentPress,
}: InstituteProgramDocumentsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Required Documents</Text>
      <View style={styles.card}>
        {documents.map((document, index) => (
          <TouchableOpacity
            key={document.id}
            activeOpacity={0.85}
            style={[styles.item, index > 0 && styles.itemBorder]}
            onPress={() => onDocumentPress(document)}>
            <View style={styles.iconWrap}>
              <Ionicons name={document.icon} size={20} color={AuthColors.profileBrand} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{document.title}</Text>
              <Text style={styles.description}>{document.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={AuthColors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#C7C4D7',
    borderRadius: 16,
    padding: 17,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FCF8FF',
    borderRadius: 12,
    padding: 17,
  },
  itemBorder: {
    marginTop: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
  },
});
