import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';
import { UserRole } from '@/src/types/shared/auth';

type RoleSelectorProps = {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  variant?: 'register' | 'login';
};

export function RoleSelector({ role, onRoleChange, variant = 'register' }: RoleSelectorProps) {
  const isLogin = variant === 'login';

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.option,
          isLogin ? styles.optionLogin : styles.optionRegister,
          role === 'student' && (isLogin ? styles.optionLoginActive : styles.optionRegisterActive),
        ]}
        onPress={() => onRoleChange('student')}>
        <Text
          style={[
            styles.optionText,
            role === 'student' && (isLogin ? styles.optionTextLoginActive : styles.optionTextRegisterActive),
          ]}>
          Student
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.option,
          isLogin ? styles.optionLogin : styles.optionRegister,
          role === 'institute' && (isLogin ? styles.optionLoginActive : styles.optionRegisterActive),
        ]}
        onPress={() => onRoleChange('institute')}>
        <Text
          style={[
            styles.optionText,
            role === 'institute' && (isLogin ? styles.optionTextLoginActive : styles.optionTextRegisterActive),
          ]}>
          Institute
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: AuthColors.toggleBackground,
    borderRadius: AuthSpacing.toggleRadius,
    padding: AuthSpacing.xs,
    gap: AuthSpacing.xs,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: AuthSpacing.md,
    borderRadius: AuthSpacing.toggleItemRadius,
  },
  optionRegister: {
    paddingVertical: 10,
  },
  optionLogin: {
    paddingVertical: AuthSpacing.sm,
  },
  optionRegisterActive: {
    backgroundColor: AuthColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  optionLoginActive: {
    backgroundColor: AuthColors.brandPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  optionText: {
    ...AuthTypography.button,
    color: AuthColors.textSecondary,
  },
  optionTextRegisterActive: {
    color: AuthColors.brandIndigo,
  },
  optionTextLoginActive: {
    color: AuthColors.white,
  },
});
