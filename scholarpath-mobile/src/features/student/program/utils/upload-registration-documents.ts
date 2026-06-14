import type { ProgramDocumentRequirement, UploadedDocument } from '@/src/types/shared/program-registration';
import type { CreatePendaftaranDocumentInput } from '@/src/types/shared/registration-api';
import { uploadPdfFile } from '@/src/services/api/upload-api';
import {
  MANDATORY_CV_DOCUMENT_ID,
  MANDATORY_CV_REQUIREMENT,
} from '@/src/features/student/program/constants/mandatory-registration-documents';

type UploadRegistrationDocumentsInput = {
  token: string;
  draftDocuments: Record<string, UploadedDocument>;
  requiredDocuments: ProgramDocumentRequirement[];
  includeMandatoryCv: boolean;
};

export async function uploadRegistrationDocuments({
  token,
  draftDocuments,
  requiredDocuments,
  includeMandatoryCv,
}: UploadRegistrationDocumentsInput): Promise<CreatePendaftaranDocumentInput[]> {
  const uploads: Array<{
    documentKey: string;
    title: string;
    isMandatory: boolean;
    file: UploadedDocument;
  }> = [];

  if (includeMandatoryCv) {
    const cvFile = draftDocuments[MANDATORY_CV_DOCUMENT_ID];
    if (cvFile) {
      uploads.push({
        documentKey: MANDATORY_CV_DOCUMENT_ID,
        title: MANDATORY_CV_REQUIREMENT.title,
        isMandatory: true,
        file: cvFile,
      });
    }
  }

  for (const requirement of requiredDocuments) {
    const file = draftDocuments[requirement.id];
    if (!file) {
      continue;
    }

    uploads.push({
      documentKey: requirement.id,
      title: requirement.title,
      isMandatory: !requirement.optional,
      file,
    });
  }

  const results: CreatePendaftaranDocumentInput[] = [];

  for (const item of uploads) {
    const uploaded = await uploadPdfFile(token, item.file);
    results.push({
      document_key: item.documentKey,
      title: item.title,
      is_mandatory: item.isMandatory,
      file_url: uploaded.file_url,
      file_name: uploaded.file_name,
      file_size: item.file.size,
    });
  }

  return results;
}
