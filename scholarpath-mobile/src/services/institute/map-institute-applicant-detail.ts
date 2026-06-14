import { resolveUploadUrl } from '@/src/services/api/resolve-upload-url';
import { parseKeahlian } from '@/src/services/profile/map-profile';
import {
  mapStatusIdToApplicantStatus,
  buildProgramId,
} from '@/src/services/institute/map-institute-applicants';
import type {
  ApplicantAchievement,
  ApplicantDocumentIconType,
  ApplicantSkill,
  ApplicantUploadedDocument,
  InstituteApplicantDetail,
} from '@/src/types/institute/institute';
import type { InstansiApplicantDetailRecord } from '@/src/types/shared/institute-api';

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes >= 10240 ? 0 : 1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveDocumentIconType(documentKey: string): ApplicantDocumentIconType {
  const key = documentKey.toLowerCase();

  if (key.includes('id') || key.includes('ktp') || key.includes('passport')) {
    return 'id';
  }

  if (
    key.includes('recommendation') ||
    key.includes('letter') ||
    key.includes('essay') ||
    key.includes('motivation')
  ) {
    return 'letter';
  }

  if (
    key.includes('certificate') ||
    key.includes('achievement') ||
    key.includes('ielts') ||
    key.includes('proficiency')
  ) {
    return 'certificate';
  }

  return 'pdf';
}

function mapApplicantDocument(
  record: InstansiApplicantDetailRecord['mandatory_documents'][number]
): ApplicantUploadedDocument {
  return {
    id: `doc-${record.id}`,
    title: record.title,
    verificationStatus: record.verification_status === 'pending' ? 'pending' : 'verified',
    sizeLabel: formatFileSize(record.file_size),
    uri: resolveUploadUrl(record.file_url),
    iconType: resolveDocumentIconType(record.document_key),
  };
}

function buildSkillsFromKeahlian(keahlian: string): ApplicantSkill[] {
  const parsed = parseKeahlian(keahlian);
  if (!parsed.skills.length) {
    return [];
  }

  return parsed.skills.map((name) => ({ name, level: 'Advanced' as const }));
}

function buildAchievementsFromKeahlian(keahlian: string): ApplicantAchievement[] {
  const parsed = parseKeahlian(keahlian);
  if (!parsed.interests.length) {
    return [];
  }

  return parsed.interests.map((interest) => ({
    title: interest,
    description: 'Listed in student profile interests.',
  }));
}

export function mapInstansiApplicantDetail(
  record: InstansiApplicantDetailRecord
): InstituteApplicantDetail {
  const major =
    record.major?.trim() && record.major !== '—'
      ? record.major
      : parseKeahlian(record.keahlian ?? '').major || '—';

  return {
    id: `pendaftaran-${record.pendaftaran_id}`,
    pendaftaranId: record.pendaftaran_id,
    name: record.student_name,
    major,
    programId: buildProgramId(record.program_type, record.program_title),
    programTitle: record.program_title,
    programType: record.program_type,
    status: mapStatusIdToApplicantStatus(record.status_id),
    statusId: record.status_id,
    studentEmail: record.student_email,
    keahlian: record.keahlian,
    submittedAt: record.tanggal_daftar,
    email: record.student_email,
    educationLevel: record.jenjang_nama?.trim() || '—',
    trackLabel: `${major} Track`,
    skills: buildSkillsFromKeahlian(record.keahlian ?? ''),
    achievements: buildAchievementsFromKeahlian(record.keahlian ?? ''),
    mandatoryDocuments: (record.mandatory_documents ?? []).map(mapApplicantDocument),
    otherDocuments: (record.other_documents ?? []).map(mapApplicantDocument),
  };
}
