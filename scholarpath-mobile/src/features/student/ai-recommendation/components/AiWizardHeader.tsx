import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type AiWizardHeaderProps = {
  rightLabel?: string;
  showProcessing?: boolean;
};

export function AiWizardHeader({ rightLabel, showProcessing = false }: AiWizardHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="creation" size={24} color="#2563EB" />
        <Text style={styles.logoText}>
          ScholarPath <Text style={styles.logoAccent}>AI</Text>
        </Text>
      </View>

      {rightLabel ? (
        <View style={styles.rightCol}>
          <Text style={styles.rightLabel}>{rightLabel}</Text>
          {showProcessing ? (
            <View style={styles.processingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E1ED',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    lineHeight: 33,
    letterSpacing: -0.55,
    color: '#2563EB',
  },
  logoAccent: {
    color: AuthColors.textPrimary,
  },
  spacer: {
    width: 40,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rightLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: AuthColors.textSecondary,
    textTransform: 'uppercase',
  },
  processingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
});
