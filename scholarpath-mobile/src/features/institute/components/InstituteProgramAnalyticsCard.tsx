import { StyleSheet, Text, View } from 'react-native';

import { getProgramPendingCount } from '@/src/features/institute/constants/institute-programs';
import { type InstituteProgram } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProgramAnalyticsCardProps = {
  program: InstituteProgram;
};

type AnalyticsRowProps = {
  label: string;
  count: number;
  total: number;
  color: string;
};

function AnalyticsRow({ label, count, total, color }: AnalyticsRowProps) {
  const widthPercent = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.rowLabelWrap}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Text style={styles.rowCount}>{count}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${widthPercent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function AnalyticsDonut({ program }: { program: InstituteProgram }) {
  const pending = getProgramPendingCount(program);

  return (
    <View style={styles.donutWrap}>
      <View
        style={[
          styles.donutRing,
          {
            borderTopColor: '#10B981',
            borderRightColor: '#F59E0B',
            borderBottomColor: '#BA1A1A',
            borderLeftColor: pending > 0 ? '#E4E1ED' : '#10B981',
          },
        ]}
      />
      <View style={styles.donutInner} />
    </View>
  );
}

export function InstituteProgramAnalyticsCard({ program }: InstituteProgramAnalyticsCardProps) {
  const pending = getProgramPendingCount(program);
  const total = program.applicantCount;

  return (
    <View style={styles.card}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryText}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalLabel}>Total Processed</Text>
        </View>
        <AnalyticsDonut program={program} />
      </View>

      <View style={styles.rows}>
        <AnalyticsRow
          label="Accepted"
          count={program.acceptedCount}
          total={total}
          color="#10B981"
        />
        <AnalyticsRow label="Pending" count={pending} total={total} color="#F59E0B" />
        <AnalyticsRow
          label="Rejected"
          count={program.rejectedCount}
          total={total}
          color="#BA1A1A"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#C7C4D7',
    borderRadius: 16,
    padding: 25,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    gap: 4,
  },
  totalValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
    color: '#4648D4',
  },
  totalLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
  donutWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 10,
  },
  donutInner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AuthColors.white,
  },
  rows: {
    gap: 8,
  },
  row: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  rowCount: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  track: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: '#E4E1ED',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
  },
});
