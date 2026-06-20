import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import { useInstituteTeam } from '@/src/context/institute/InstituteTeamContext';
import {
  InstituteSettingsCheckbox,
  InstituteTeamMemberRow,
} from '@/src/features/institute/components';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useInstituteSession();
  const { members } = useInstituteTeam();
  const [newApplicantsEnabled, setNewApplicantsEnabled] = useState(true);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.replace('/login' as Href);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage your institutional preferences and team.
          </Text>
        </View>

        <View style={styles.teamSection}>
          <Pressable
            style={styles.teamHeader}
            onPress={() => router.push('/institute-manage-team' as Href)}>
            <View style={styles.teamHeaderLeft}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color={AuthColors.profileBrand}
              />
              <Text style={styles.sectionLabel}>Team Management</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={AuthColors.textMuted} />
          </Pressable>

          <View style={styles.teamList}>
            {members.map((member) => (
              <InstituteTeamMemberRow key={member.id} member={member} />
            ))}
          </View>
        </View>

        <View style={styles.notificationsCard}>
          <View style={styles.notificationsHeader}>
            <Ionicons name="notifications-outline" size={20} color={AuthColors.profileBrand} />
            <Text style={styles.sectionLabel}>Notifications</Text>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>New Applicants</Text>
            <InstituteSettingsCheckbox
              checked={newApplicantsEnabled}
              onPress={() => setNewApplicantsEnabled((prev) => !prev)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Push Alerts</Text>
            <InstituteSettingsCheckbox
              checked={pushAlertsEnabled}
              onPress={() => setPushAlertsEnabled((prev) => !prev)}
            />
          </View>
        </View>

        <Pressable style={styles.signOutCard} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#BA1A1A" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 3,
    paddingBottom: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: '#464554',
  },
  teamSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E1ED',
  },
  teamHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
    color: AuthColors.textPrimary,
  },
  teamList: {
    backgroundColor: 'rgba(245, 242, 254, 0.5)',
    padding: 12,
    gap: 8,
  },
  notificationsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 25,
    gap: 24,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: '#464554',
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 24,
  },
  signOutText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
    color: '#BA1A1A',
  },
});
