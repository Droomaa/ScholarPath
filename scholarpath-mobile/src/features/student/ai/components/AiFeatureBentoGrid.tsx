import type { ReactNode } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  fullWidth?: boolean;
};

function FeatureCard({ icon, title, description, fullWidth }: FeatureCardProps) {
  if (fullWidth) {
    return (
      <View style={[styles.card, styles.cardFullWidth]}>
        {icon}
        <View style={styles.cardTextCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function AiFeatureBentoGrid() {
  return (
    <View style={styles.grid}>
      <FeatureCard
        fullWidth
        icon={
          <View style={[styles.iconWrap, styles.iconWrapPurple]}>
            <MaterialCommunityIcons
              name="heart-multiple-outline"
              size={20}
              color={AuthColors.profileBrand}
            />
          </View>
        }
        title="Minat & Passion"
        description="Menyelaraskan jurusan dengan apa yang benar-benar kamu cintai."
      />

      <View style={styles.row}>
        <FeatureCard
          icon={
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="brain" size={22} color={AuthColors.textMuted} />
            </View>
          }
          title="Keahlian"
          description={'Menganalisis profil\nskill kamu.'}
        />
        <FeatureCard
          icon={
            <View style={styles.iconWrap}>
              <Ionicons name="flag-outline" size={22} color={AuthColors.textMuted} />
            </View>
          }
          title="Tujuan Karir"
          description={'Jalur pasti menuju\nimpianmu.'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#F5F2FE',
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 8,
  },
  cardFullWidth: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  cardTextCol: {
    flex: 1,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPurple: {
    backgroundColor: 'rgba(96, 99, 238, 0.12)',
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  description: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
  },
});
