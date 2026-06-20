import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteTeam } from '@/src/context/institute/InstituteTeamContext';
import { InstituteTeamAdminCard } from '@/src/features/institute/components';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteManageTeamScreen() {
  const insets = useSafeAreaInsets();
  const { members } = useInstituteTeam();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Manage Team</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Team</Text>
          <Text style={styles.subtitle}>
            Coordinate your institution&apos;s administrators, manage roles, and monitor engagement
            across the ScholarPath ecosystem.
          </Text>
        </View>

        <View style={styles.list}>
          {members.map((member) => (
            <InstituteTeamAdminCard key={member.id} member={member} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.profileBrand,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 48,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 28,
    color: '#464554',
    maxWidth: 576,
  },
  list: {
    gap: 16,
  },
});
