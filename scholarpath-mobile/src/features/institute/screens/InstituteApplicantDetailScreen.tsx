import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import {
  ApplicantAchievementsCard,
  ApplicantDecisionModal,
  ApplicantDetailHero,
  ApplicantDocumentRow,
  ApplicantMotivationCard,
  ApplicantSkillsCard,
} from '@/src/features/institute/components';
import { ApiError } from '@/src/services/api/client';
import { type ApplicantUploadedDocument } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type DecisionState = {
  action: 'accept' | 'reject';
  step: 1 | 2;
};

export function InstituteApplicantDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const { getApplicantDetailById, updateApplicantStatus, isUpdatingStatus } = useInstituteApplicants();
  const applicant = id ? getApplicantDetailById(id) : undefined;
  const [decision, setDecision] = useState<DecisionState | null>(null);

  if (!applicant) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>Applicant not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isPending = applicant.status === 'pending';

  const handleViewDocument = async (document: ApplicantUploadedDocument) => {
    Alert.alert(document.title, `View uploaded file (${document.sizeLabel})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'View File',
        onPress: async () => {
          if (!document.uri) {
            Alert.alert('File unavailable', 'Document preview is not available for this file.');
            return;
          }
          const canOpen = await Linking.canOpenURL(document.uri);
          if (canOpen) {
            await Linking.openURL(document.uri);
          } else {
            Alert.alert('Unable to open', 'Could not open this document on your device.');
          }
        },
      },
    ]);
  };

  const closeDecision = () => setDecision(null);

  const applyDecision = async (action: 'accept' | 'reject') => {
    try {
      await updateApplicantStatus(
        applicant.id,
        action === 'accept' ? 'accepted' : 'rejected'
      );

      Alert.alert(
        'Berhasil',
        action === 'accept'
          ? `${applicant.name} telah diterima.`
          : `${applicant.name} telah ditolak.`
      );
      closeDecision();
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Gagal memperbarui status pendaftar.';
      Alert.alert('Gagal', message);
    }
  };

  const handleAccept = () => setDecision({ action: 'accept', step: 1 });
  const handleReject = () => setDecision({ action: 'reject', step: 1 });

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Applicant Detail</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <ApplicantDetailHero applicant={applicant} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Profile</Text>
          <ApplicantMotivationCard motivationAnswer={applicant.motivationAnswer} />
          <ApplicantSkillsCard skills={applicant.skills} />
          <ApplicantAchievementsCard achievements={applicant.achievements} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          <View style={styles.documentsList}>
            {applicant.documents.map((document) => (
              <ApplicantDocumentRow
                key={document.id}
                document={document}
                onPress={() => handleViewDocument(document)}
              />
            ))}
          </View>
        </View>

        {!isPending ? (
          <View style={styles.decisionBanner}>
            <Text style={styles.decisionBannerText}>
              This applicant has already been{' '}
              {applicant.status === 'accepted' ? 'accepted' : 'rejected'}.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {isPending ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.rejectButton}
            onPress={handleReject}>
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.acceptButton}
            onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ApplicantDecisionModal
        visible={decision !== null}
        action={decision?.action ?? null}
        applicantName={applicant.name}
        step={decision?.step ?? 1}
        onCancel={() => {
          if (decision?.step === 2) {
            setDecision({ ...decision, step: 1 });
            return;
          }
          closeDecision();
        }}
        onContinue={() =>
          setDecision((current) => (current ? { ...current, step: 2 } : current))
        }
        onConfirm={() => {
          if (decision && !isUpdatingStatus) {
            void applyDecision(decision.action);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
    position: 'relative',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFound: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: AuthColors.textPrimary,
  },
  backLink: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.profileBrand,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  documentsList: {
    gap: 16,
  },
  decisionBanner: {
    backgroundColor: 'rgba(96, 99, 238, 0.08)',
    borderRadius: 12,
    padding: 16,
  },
  decisionBannerText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: AuthColors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 196, 215, 0.3)',
    zIndex: 2,
    elevation: 2,
  },
  rejectButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#BA1A1A',
    borderRadius: 12,
  },
  rejectText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#BA1A1A',
  },
  acceptButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4648D4',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  acceptText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.white,
  },
});
