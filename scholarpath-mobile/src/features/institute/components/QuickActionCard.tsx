import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type QuickActionCardProps = {
  icon: 'clipboard' | 'chart' | 'settings';
  label: string;
  onPress?: () => void;
};

const ICONS = {
  clipboard: { family: 'material' as const, name: 'clipboard-edit-outline' as const },
  chart: { family: 'material' as const, name: 'chart-line' as const },
  settings: { family: 'ionicons' as const, name: 'settings-outline' as const },
};

export function QuickActionCard({ icon, label, onPress }: QuickActionCardProps) {
  const config = ICONS[icon];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        {config.family === 'material' ? (
          <MaterialCommunityIcons
            name={config.name}
            size={20}
            color={AuthColors.profileBrand}
          />
        ) : (
          <Ionicons name={config.name} size={20} color={AuthColors.profileBrand} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={AuthColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
});
