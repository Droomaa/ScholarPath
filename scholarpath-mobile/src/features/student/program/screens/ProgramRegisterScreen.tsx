import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { useProgramById } from '@/src/hooks/useProgramById';
import {
  EligibilityTermsSection,
  MandatoryDocumentSection,
  RegistrationFooter,
  RegistrationHeader,
  RegistrationHeroSection,
  RegistrationProfileSection,
  RegistrationProgressSteps,
  RequiredDocumentsSection,
  type RegistrationStep,
} from '@/src/features/student/program/components';
import { formatDaysLeftLabel } from '@/src/features/student/program/utils/deadline-countdown';
import { pickPdfDocument } from '@/src/features/student/program/utils/pick-pdf-document';
import {
  MANDATORY_CV_DOCUMENT_ID,
  requiresMandatoryCv,
} from '@/src/features/student/program/constants/mandatory-registration-documents';
import { uploadRegistrationDocuments } from '@/src/features/student/program/utils/upload-registration-documents';
import { getProgramRegistrationConfig } from '@/src/features/student/program/utils/program-registration-config';
import { ApiError } from '@/src/services/api/client';
import { parseProgramCompositeId, parsedProgramIdToApiPayload } from '@/src/services/explore';
import { buildUpdatePayload, getJenjangList, updateProfile } from '@/src/services/profile';
import { createPendaftaran } from '@/src/services/registration';
import { type ActiveProgramStatus } from '@/src/types/shared/application';
import type { EducationLevel } from '@/src/types/shared/program';
import {
  type ProgramRegistrationDraft,
  type UploadedDocument,
} from '@/src/types/shared/program-registration';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

function createEmptyDraft(
  fullName = '',
  educationLevel: EducationLevel | '' = ''
): ProgramRegistrationDraft {
  return {
    agreedToTerms: false,
    fullName,
    schoolOrigin: '',
    educationLevel,
    documents: {},
    motivationAnswer: '',
  };
}

function isProfileStepComplete(draft: ProgramRegistrationDraft) {
  return (
    draft.fullName.trim().length > 0 &&
    draft.schoolOrigin.trim().length > 0 &&
    !!draft.educationLevel
  );
}

function resolveActiveProgramStatus(
  draft: ProgramRegistrationDraft,
  requiredDocumentIds: string[],
  needsMandatoryCv: boolean
): ActiveProgramStatus {
  const mandatoryCvReady = !needsMandatoryCv || Boolean(draft.documents[MANDATORY_CV_DOCUMENT_ID]);
  const requiredUploaded =
    mandatoryCvReady && requiredDocumentIds.every((docId) => Boolean(draft.documents[docId]));
  const hasProgress =
    draft.agreedToTerms ||
    isProfileStepComplete(draft) ||
    Object.keys(draft.documents).length > 0 ||
    draft.motivationAnswer.trim().length > 0;

  if (!hasProgress) {
    return 'incomplete_form';
  }
  if (!requiredUploaded || !draft.motivationAnswer.trim()) {
    return 'incomplete_documents';
  }
  return 'incomplete_documents';
}

export function ProgramRegisterScreen() {
  const { id, activeId } = useLocalSearchParams<{ id: string; activeId?: string }>();
  const { token, fullName, email, educationLevel, major, interests, skills, updateProfile: syncSessionProfile } =
    useStudentSession();
  const { program, isLoading, error } = useProgramById(id ?? '');
  const {
    activePrograms,
    upsertActiveProgram,
    findActiveProgramByProgramId,
    saveRegistrationDraft,
    getRegistrationDraft,
    removeActiveProgram,
    refreshRegistrations,
    updateActiveProgramStatus,
  } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('detail');
  const [educationPickerVisible, setEducationPickerVisible] = useState(false);

  const registrationConfig = program ? getProgramRegistrationConfig(program) : null;

  const requiredDocumentIds = useMemo(
    () =>
      (registrationConfig?.requiredDocuments ?? [])
        .filter((doc) => !doc.optional)
        .map((doc) => doc.id),
    [registrationConfig]
  );

  const [draft, setDraft] = useState<ProgramRegistrationDraft>(() =>
    program ? (getRegistrationDraft(program.id) ?? createEmptyDraft()) : createEmptyDraft()
  );

  useEffect(() => {
    if (!program) return;

    const stored = getRegistrationDraft(program.id);
    if (stored) {
      setDraft({
        ...createEmptyDraft(fullName, educationLevel),
        ...stored,
        fullName: stored.fullName?.trim() || fullName,
        schoolOrigin: stored.schoolOrigin ?? '',
        educationLevel: stored.educationLevel || educationLevel,
      });
      return;
    }

    setDraft(createEmptyDraft(fullName, educationLevel));
  }, [program?.id, fullName, educationLevel]);

  useEffect(() => {
    if (!program || !registrationConfig) return;
    if (findActiveProgramByProgramId(program.id)) return;

    upsertActiveProgram({
      id: `active-${program.id}-${Date.now()}`,
      title: program.title,
      provider: program.provider,
      status: 'incomplete_form',
      programId: program.id,
      daysLeft: formatDaysLeftLabel(registrationConfig.deadlineAt),
    });
  }, [program?.id, registrationConfig?.deadlineAt]);

  const activeProgram = useMemo(() => {
    if (activeId) {
      return activePrograms.find((item) => item.id === activeId);
    }
    return program ? findActiveProgramByProgramId(program.id) : undefined;
  }, [activeId, activePrograms, program?.id]);

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={AuthColors.profileBrand} />
      </View>
    );
  }

  if (!program || !registrationConfig) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>{error ?? 'Program tidak ditemukan.'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const documentsEnabled = draft.agreedToTerms && isProfileStepComplete(draft);
  const needsMandatoryCv = requiresMandatoryCv(program.category);

  const isSubmitReady =
    draft.agreedToTerms &&
    isProfileStepComplete(draft) &&
    (!needsMandatoryCv || Boolean(draft.documents[MANDATORY_CV_DOCUMENT_ID])) &&
    requiredDocumentIds.every((docId) => Boolean(draft.documents[docId])) &&
    draft.motivationAnswer.trim().length > 0;

  const syncDraft = (nextDraft: ProgramRegistrationDraft, showAlert = false) => {
    setDraft(nextDraft);
    saveRegistrationDraft(program.id, nextDraft);

    const status = resolveActiveProgramStatus(nextDraft, requiredDocumentIds, needsMandatoryCv);
    const activeIdToUse = activeProgram?.id ?? `active-${program.id}-${Date.now()}`;

    upsertActiveProgram({
      id: activeIdToUse,
      title: program.title,
      provider: program.provider,
      status,
      programId: program.id,
      daysLeft: formatDaysLeftLabel(registrationConfig.deadlineAt),
    });

    if (activeProgram) {
      updateActiveProgramStatus(activeProgram.id, status);
    }

    if (showAlert) {
      Alert.alert('Draft tersimpan', 'Progress pendaftaranmu telah disimpan.');
    }
  };

  const handleUpload = async (documentId: string) => {
    if (!documentsEnabled) return;

    const uploaded = await pickPdfDocument();
    if (!uploaded) return;

    syncDraft({
      ...draft,
      documents: {
        ...draft.documents,
        [documentId]: uploaded,
      },
    });
  };

  const handleSaveDraft = () => {
    syncDraft(draft, false);
    router.replace('/(tabs)/application' as Href);
  };

  const persistRegistrationProfile = async () => {
    if (!token) {
      throw new ApiError('Sesi tidak valid. Silakan login kembali.', 401);
    }

    const jenjangList = await getJenjangList(token, true);
    const payload = buildUpdatePayload(
      {
        fullName: draft.fullName.trim(),
        educationLevel: draft.educationLevel,
        schoolOrigin: draft.schoolOrigin.trim(),
        major,
        interests,
        skills,
      },
      jenjangList
    );

    await updateProfile(token, payload);
    await syncSessionProfile({
      fullName: draft.fullName.trim(),
      educationLevel: draft.educationLevel,
    });
  };

  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Alert.alert(
        'Form belum lengkap',
        needsMandatoryCv
          ? 'Lengkapi data diri, setujui syarat, unggah CV wajib, semua dokumen wajib program, dan isi motivasi sebelum submit.'
          : 'Lengkapi data diri, setujui syarat, unggah semua dokumen wajib program, dan isi motivasi sebelum submit.'
      );
      return;
    }

    const activeIdToUse = activeProgram?.id ?? findActiveProgramByProgramId(program.id)?.id;

    if (!activeIdToUse) {
      Alert.alert('Error', 'Program aktif tidak ditemukan.');
      return;
    }

    if (!token) {
      Alert.alert('Login diperlukan', 'Silakan login untuk mendaftar program.');
      return;
    }

    const parsed = parseProgramCompositeId(program.id);
    if (!parsed) {
      Alert.alert('Error', 'Program tidak valid.');
      return;
    }

    setIsSubmitting(true);

    try {
      await persistRegistrationProfile();

      const documents = await uploadRegistrationDocuments({
        token,
        draftDocuments: draft.documents,
        requiredDocuments: registrationConfig.requiredDocuments,
        includeMandatoryCv: needsMandatoryCv,
      });

      await createPendaftaran(token, {
        ...parsedProgramIdToApiPayload(parsed),
        motivation_text: draft.motivationAnswer.trim(),
        documents,
      });
      removeActiveProgram(activeIdToUse);
      await refreshRegistrations();

      Alert.alert('Berhasil', 'Pendaftaran berhasil dikirim.', [
        {
          text: 'OK',
          onPress: () => router.replace('/application' as Href),
        },
      ]);
    } catch (submitError) {
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : 'Gagal mengirim pendaftaran. Coba lagi.';
      Alert.alert('Pendaftaran gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailContinue = () => {
    if (!draft.agreedToTerms) {
      Alert.alert('Syarat & ketentuan', 'Setujui syarat dan ketentuan untuk melanjutkan.');
      return;
    }
    syncDraft(draft);
    setCurrentStep('profile');
  };

  const handleProfileContinue = () => {
    if (!isProfileStepComplete(draft)) {
      Alert.alert('Data diri belum lengkap', 'Isi nama lengkap, asal sekolah, dan jenjang pendidikan.');
      return;
    }
    syncDraft(draft);
    setCurrentStep('documents');
  };

  const footerProps =
    currentStep === 'detail'
      ? {
          showSecondary: false,
          primaryLabel: 'Lanjut',
          onPrimaryPress: handleDetailContinue,
          primaryDisabled: !draft.agreedToTerms,
        }
      : currentStep === 'profile'
        ? {
            secondaryLabel: 'Kembali',
            onSecondaryPress: () => setCurrentStep('detail'),
            primaryLabel: 'Lanjut',
            onPrimaryPress: handleProfileContinue,
            primaryDisabled: !isProfileStepComplete(draft),
          }
        : {
            secondaryLabel: 'Save Draft',
            onSecondaryPress: handleSaveDraft,
            primaryLabel: 'Submit Application',
            onPrimaryPress: () => {
              void handleSubmit();
            },
            primaryDisabled: !isSubmitReady,
            isSubmitting,
          };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <RegistrationHeader onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <RegistrationHeroSection
          title={program.title}
          deadlineAt={registrationConfig.deadlineAt}
        />

        <RegistrationProgressSteps currentStep={currentStep} />

        {currentStep === 'detail' ? (
          <EligibilityTermsSection
            terms={registrationConfig.eligibilityTerms}
            agreed={draft.agreedToTerms}
            onAgreedChange={(agreed) => syncDraft({ ...draft, agreedToTerms: agreed })}
          />
        ) : null}

        {currentStep === 'profile' ? (
          <RegistrationProfileSection
            fullName={draft.fullName}
            email={email}
            schoolOrigin={draft.schoolOrigin}
            educationLevel={draft.educationLevel}
            onFullNameChange={(value) => setDraft((prev) => ({ ...prev, fullName: value }))}
            onSchoolOriginChange={(value) => setDraft((prev) => ({ ...prev, schoolOrigin: value }))}
            onEducationLevelChange={(value) =>
              setDraft((prev) => ({ ...prev, educationLevel: value }))
            }
            educationPickerVisible={educationPickerVisible}
            onEducationPickerOpen={() => setEducationPickerVisible(true)}
            onEducationPickerClose={() => setEducationPickerVisible(false)}
          />
        ) : null}

        {currentStep === 'documents' ? (
          <>
            {needsMandatoryCv ? (
              <MandatoryDocumentSection
                disabled={!documentsEnabled}
                uploaded={draft.documents[MANDATORY_CV_DOCUMENT_ID] as UploadedDocument | undefined}
                onUploadPress={() => handleUpload(MANDATORY_CV_DOCUMENT_ID)}
              />
            ) : null}

            <RequiredDocumentsSection
              disabled={!documentsEnabled}
              requirements={registrationConfig.requiredDocuments}
              documents={draft.documents}
              onUploadPress={handleUpload}
            />

            <View style={[styles.section, !documentsEnabled && styles.sectionDisabled]}>
              <Text style={styles.motivationLabel}>{registrationConfig.motivationQuestion}</Text>
              <TextInput
                style={styles.motivationInput}
                placeholder="Answer here..."
                placeholderTextColor={AuthColors.textPlaceholder}
                multiline
                textAlignVertical="top"
                editable={documentsEnabled}
                value={draft.motivationAnswer}
                onChangeText={(motivationAnswer) =>
                  setDraft((prev) => ({ ...prev, motivationAnswer }))
                }
                onBlur={() => {
                  if (documentsEnabled) {
                    syncDraft(draft);
                  }
                }}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <RegistrationFooter {...footerProps} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  section: {
    gap: 14,
  },
  sectionDisabled: {
    opacity: 0.55,
  },
  motivationLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
    paddingHorizontal: 4,
  },
  motivationInput: {
    minHeight: 120,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 17,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  notFound: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  backLink: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
  },
});
