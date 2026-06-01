import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type StatCardProps = {
  label: string;
  value: string | number;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
};

export function StatCard({ label, value, badge, badgeBg, badgeColor }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {badge ? (
          <View style={[styles.badge, badgeBg ? { backgroundColor: badgeBg } : null]}>
            <Text style={[styles.badgeText, badgeColor ? { color: badgeColor } : null]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: '#565E74',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  value: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.72,
    color: '#4648D4',
  },
  badge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    color: '#059669',
  },
});
