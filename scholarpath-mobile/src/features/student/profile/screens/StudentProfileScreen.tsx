import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  ProfileCardIcon,
  ProfileChipList,
  ProfileField,
  ProfileHeaderSection,
  ProfileInfoCard,
  ProfileLogoutButton,
} from '@/src/features/student/profile/components';
import {
  formatEducationLevel,
  formatMajor,
} from '@/src/features/student/profile/utils/format-profile-fields';
import { HomeTopBar } from '@/src/features/student/home/components';
import { useProfilePhotoPicker } from '@/src/features/student/profile/hooks/useProfilePhotoPicker';
import { AuthColors } from '@/src/theme';

export function StudentProfileScreen() {
  const { pickPhoto } = useProfilePhotoPicker();
  const {
    fullName,
    email,
    educationLevel,
    major,
    interests,
    skills,
    bio,
    profilePhotoUri,
    signOut,
  } = useStudentSession();

  const handleLogout = () => {
    signOut();
    router.replace('/register');
  };

  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ProfileHeaderSection
          fullName={fullName}
          bio={bio}
          profilePhotoUri={profilePhotoUri}
          onEditProfilePress={() => router.push('/edit-profile' as Href)}
          onEditPhotoPress={pickPhoto}
        />

        <View style={styles.grid}>
          <ProfileInfoCard
            fullWidth
            icon={<ProfileCardIcon name="person" />}
            title="Personal Data">
            <ProfileField label="Full Name" value={fullName} />
            <ProfileField label="Email Address" value={email} />
          </ProfileInfoCard>

          <ProfileInfoCard
            fullWidth
            icon={<ProfileCardIcon name="school" />}
            title="Academic Info">
            <View style={styles.academicRow}>
              <View style={styles.academicCol}>
                <ProfileField label="Grade" value={formatEducationLevel(educationLevel)} />
              </View>
              <View style={styles.academicCol}>
                <ProfileField label="Major" value={formatMajor(major, educationLevel)} />
              </View>
            </View>
          </ProfileInfoCard>

          <View style={styles.halfRow}>
            <ProfileInfoCard
              flexible
              compactTitle
              icon={<ProfileCardIcon name="interests" />}
              title="Interests">
              <ProfileChipList items={interests} variant="interests" />
            </ProfileInfoCard>
            <ProfileInfoCard
              flexible
              compactTitle
              icon={<ProfileCardIcon name="skills" />}
              title="Skills">
              <ProfileChipList items={skills} variant="skills" />
            </ProfileInfoCard>
          </View>
        </View>

        <ProfileLogoutButton onPress={handleLogout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  grid: {
    gap: 16,
  },
  academicRow: {
    flexDirection: 'row',
    gap: 16,
  },
  academicCol: {
    flex: 1,
  },
  halfRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
