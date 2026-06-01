import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import {
  ApplicationEmptyState,
  TrackApplicationCard,
} from '@/src/features/student/application/components';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export function TrackApplicationScreen() {
  const insets = useSafeAreaInsets();
  const { registrations } = useApplications();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Track Application</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Status Pendaftaran</Text>
          <Text style={styles.pageSubtitle}>
            Pantau perkembangan aplikasi beasiswa dan kompetisi kamu.
          </Text>
        </View>

        {registrations.length === 0 ? (
          <ApplicationEmptyState />
        ) : (
          <View style={styles.list}>
            {registrations.map((application) => (
              <TrackApplicationCard key={application.id} application={application} />
            ))}
          </View>
        )}

        {registrations.length > 0 ? (
          <Pressable style={styles.historyButton}>
            <Ionicons name="time-outline" size={18} color={AuthColors.textSecondary} />
            <Text style={styles.historyText}>Lihat Riwayat Selesai</Text>
          </Pressable>
        ) : null}
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
    backgroundColor: AuthColors.profileHeaderBlur,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  topBarTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  pageSubtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
  },
  list: {
    gap: 16,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  historyText: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
});
