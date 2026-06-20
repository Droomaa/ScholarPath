import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteTeam } from '@/src/context/institute/InstituteTeamContext';
import { InstituteTeamAvatar } from '@/src/features/institute/components/InstituteTeamAvatar';
import {
  INSTITUTE_TEAM_ROLES,
  type InstituteTeamRole,
} from '@/src/features/institute/constants/institute-team-members';
import { ProfileTextField } from '@/src/features/student/profile/components/ProfileTextField';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteEditTeamMemberScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMemberById, updateMember } = useInstituteTeam();
  const member = id ? getMemberById(id) : undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InstituteTeamRole>('Reviewer');
  const [avatarUri, setAvatarUri] = useState<string | undefined>();

  useEffect(() => {
    if (!member) return;
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setAvatarUri(member.avatarUri);
  }, [member]);

  if (!member) {
    return (
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
          </Pressable>
          <Text style={styles.topBarTitle}>Edit Member</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.missingState}>
          <Text style={styles.missingText}>Team member not found.</Text>
        </View>
      </View>
    );
  }

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Allow gallery access to update the profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Incomplete Form', 'Name and email are required.');
      return;
    }

    updateMember(member.id, {
      name: trimmedName,
      email: trimmedEmail,
      role,
      avatarUri,
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Edit Member</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <InstituteTeamAvatar
              member={{
                ...member,
                name: name.trim() || member.name,
                avatarUri,
              }}
              size={96}
            />
            <Pressable style={styles.changePhotoButton} onPress={handlePickPhoto}>
              <Ionicons name="camera-outline" size={16} color={AuthColors.white} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <ProfileTextField
            label="Full Name"
            placeholder="Enter member name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <ProfileTextField
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleChips}>
              {INSTITUTE_TEAM_ROLES.map((option) => {
                const isActive = role === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.roleChip, isActive && styles.roleChipActive]}
                    onPress={() => setRole(option)}>
                    <Text style={[styles.roleChipText, isActive && styles.roleChipTextActive]}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  flex: {
    flex: 1,
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
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  photoSection: {
    alignItems: 'center',
    gap: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changePhotoText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
  roleSection: {
    gap: 10,
  },
  roleLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: AuthColors.textSecondary,
    paddingLeft: 4,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#EFECF8',
  },
  roleChipActive: {
    backgroundColor: '#4648D4',
  },
  roleChipText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: '#464554',
  },
  roleChipTextActive: {
    color: AuthColors.white,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: AuthColors.white,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: AuthColors.textSecondary,
  },
});
