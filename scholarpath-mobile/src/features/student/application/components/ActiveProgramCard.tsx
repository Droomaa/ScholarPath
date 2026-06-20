import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActiveProgram } from '@/src/types/shared/application';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ActiveProgramCardProps = {
  program: ActiveProgram;
  onCompleteDocumentsPress?: () => void;
  onPress?: () => void;
  onRemovePress?: () => void;
};

export function ActiveProgramCard({
  program,
  onCompleteDocumentsPress,
  onPress,
  onRemovePress,
}: ActiveProgramCardProps) {
  if (program.status === 'incomplete_documents') {
    return (
      <View style={styles.incompleteCard}>
        <View style={styles.incompleteHeader}>
          <View style={styles.incompleteTextCol}>
            <Text style={styles.title}>{program.title}</Text>
            {program.daysLeft ? (
              <Text style={styles.deadline}>Sisa waktu: {program.daysLeft}</Text>
            ) : null}
          </View>
          <Pressable style={styles.removeButton} onPress={onRemovePress} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={AuthColors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.warningRow}>
          <Ionicons name="alert-circle" size={16} color="#BA1A1A" />
          <Text style={styles.warningText}>Dokumen Belum Lengkap</Text>
        </View>

        <Pressable style={styles.completeButton} onPress={onCompleteDocumentsPress}>
          <Text style={styles.completeButtonText}>Lengkapi Dokumen</Text>
        </Pressable>
      </View>
    );
  }

  const statusConfig =
    program.status === 'applied'
      ? {
          icon: 'checkmark-circle' as const,
          label: 'Applied',
          labelColor: AuthColors.profileBrand,
          labelWeight: FontFamily.bold,
        }
      : {
          icon: 'time-outline' as const,
          label: 'Belum Selesai',
          labelColor: '#444749',
          labelWeight: FontFamily.medium,
        };

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Pressable style={styles.cardLeft} onPress={onPress}>
          <View style={styles.thumbnail}>
            <MaterialCommunityIcons name="school-outline" size={24} color={AuthColors.textMuted} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{program.title}</Text>
            <Text style={styles.provider}>{program.provider}</Text>
            <View style={styles.statusRow}>
              <Ionicons
                name={statusConfig.icon}
                size={14}
                color={
                  program.status === 'applied' ? AuthColors.profileBrand : AuthColors.textSecondary
                }
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: statusConfig.labelColor, fontFamily: statusConfig.labelWeight },
                ]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </Pressable>
        <View style={styles.actionsCol}>
          <Pressable style={styles.chevronButton} onPress={onPress} hitSlop={8}>
            <Ionicons name="chevron-forward" size={16} color={AuthColors.textSecondary} />
          </Pressable>
          <Pressable style={styles.removeButtonSmall} onPress={onRemovePress} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={AuthColors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#E4E1ED',
    borderRadius: 16,
    padding: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  actionsCol: {
    alignItems: 'center',
    gap: 4,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
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
  provider: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  chevronButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incompleteCard: {
    backgroundColor: '#F5F2FE',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    overflow: 'hidden',
  },
  incompleteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  incompleteTextCol: {
    flex: 1,
    gap: 4,
  },
  deadline: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  warningText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: '#BA1A1A',
  },
  completeButton: {
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  completeButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.white,
  },
});
