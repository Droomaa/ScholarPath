const PATH_TAG_PATTERN = /\[Path:\s*([^\]]+)\]/gi;
const ACTIVITY_TAG_PATTERN = /\[Activity:\s*([^\]]+)\]/gi;
const METADATA_LINE_PATTERN = /^\[(Path|Activity):/i;

export type ParsedDeskripsi = {
  description: string;
  longDescription: string;
  path?: string;
  activityType?: string;
};

function extractTagValue(text: string, pattern: RegExp): string | undefined {
  const match = pattern.exec(text);
  pattern.lastIndex = 0;
  return match?.[1]?.trim() || undefined;
}

function stripMetadataTags(text: string): string {
  return text
    .replace(PATH_TAG_PATTERN, '')
    .replace(ACTIVITY_TAG_PATTERN, '')
    .split('\n\n')
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !METADATA_LINE_PATTERN.test(block))
    .join('\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseDeskripsi(raw: string): ParsedDeskripsi {
  const source = raw.trim();
  const path = extractTagValue(source, PATH_TAG_PATTERN);
  const activityType = extractTagValue(source, ACTIVITY_TAG_PATTERN);
  const cleaned = stripMetadataTags(source);
  const description = cleaned.replace(/\n+/g, ' ').trim();

  return {
    description,
    longDescription: cleaned || description,
    path,
    activityType,
  };
}
