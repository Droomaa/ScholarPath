import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantDecisionModalProps = {
  visible: boolean;
  action: 'accept' | 'reject' | null;
  applicantName: string;
  step: 1 | 2;
  onCancel: () => void;
  onContinue: () => void;
  onConfirm: () => void;
};

export function ApplicantDecisionModal({
  visible,
  action,
  applicantName,
  step,
  onCancel,
  onContinue,
  onConfirm,
}: ApplicantDecisionModalProps) {
  if (!visible || !action) {
    return null;
  }

  const isAccept = action === 'accept';
  const title =
    step === 1
      ? isAccept
        ? 'Accept Applicant'
        : 'Reject Applicant'
      : 'Confirm Again';

  const message =
    step === 1
      ? `Are you sure you want to ${isAccept ? 'accept' : 'reject'} ${applicantName}?`
      : isAccept
        ? `Please confirm that accepting ${applicantName} is the right decision for this program.`
        : `Please confirm that rejecting ${applicantName} is the right decision. This action should be reviewed carefully.`;

  const primaryLabel = step === 1 ? 'Continue' : isAccept ? 'Yes, Accept' : 'Yes, Reject';
  const secondaryLabel = step === 1 ? 'Cancel' : 'Go Back';

  return (
    <View style={styles.portal} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityRole="button" />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={[styles.iconWrap, isAccept ? styles.iconAccept : styles.iconReject]}>
            <Ionicons
              name={isAccept ? 'checkmark-circle' : 'close-circle'}
              size={28}
              color={isAccept ? '#16A34A' : '#BA1A1A'}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryButton}
              onPress={onCancel}>
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, !isAccept && styles.primaryReject]}
              onPress={step === 1 ? onContinue : onConfirm}>
              <Text style={styles.primaryText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 27, 35, 0.45)',
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  iconAccept: {
    backgroundColor: '#DCFCE7',
  },
  iconReject: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E9E6F3',
  },
  secondaryText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.textPrimary,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#4648D4',
  },
  primaryReject: {
    backgroundColor: '#BA1A1A',
  },
  primaryText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
});
