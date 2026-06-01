import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';

type AuthFooterLinksProps = {
  prompt: string;
  linkLabel: string;
  onLinkPress: () => void;
  showLegalLinks?: boolean;
  compact?: boolean;
  linkColor?: string;
};

export function AuthFooterLinks({
  prompt,
  linkLabel,
  onLinkPress,
  showLegalLinks = false,
  compact = false,
  linkColor = AuthColors.brandIndigo,
}: AuthFooterLinksProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.prompt}>
        {prompt}{' '}
        <Text style={[styles.link, { color: linkColor }]} onPress={onLinkPress}>
          {linkLabel}
        </Text>
      </Text>
      {showLegalLinks ? (
        <View style={styles.legalRow}>
          <Pressable>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>
          <View style={styles.dot} />
          <Pressable>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 49,
    marginTop: AuthSpacing.lg,
    paddingHorizontal: AuthSpacing.screenHorizontal,
  },
  containerCompact: {
    gap: 0,
    marginTop: AuthSpacing.xs,
    paddingHorizontal: 0,
  },
  prompt: {
    ...AuthTypography.footer,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  link: {
    fontFamily: AuthTypography.footer.fontFamily,
    fontWeight: '700',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AuthSpacing.md,
  },
  legalLink: {
    ...AuthTypography.footerBold,
    color: AuthColors.textMuted,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: AuthColors.dot,
  },
});
