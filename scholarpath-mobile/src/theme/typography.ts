import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const AuthTypography = {
  brandTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: 28,
    lineHeight: 36,
  },
  tagline: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  screenTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
  },
  screenSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
  },
  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
  },
  buttonLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
  },
  divider: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  footer: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  footerBold: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14,
  },
  profileTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  profileSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  profileLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  profileInput: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  profileChip: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  profileSaveButton: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  profileTipsTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  profileTipsBody: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  profileHeaderBrand: {
    fontFamily: FontFamily.extraBold,
    fontSize: 24,
    lineHeight: 24,
  },
} as const satisfies Record<string, TextStyle>;
