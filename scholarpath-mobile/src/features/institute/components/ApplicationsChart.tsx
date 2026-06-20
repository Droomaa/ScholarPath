import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  type AnalyticsPeriodMonths,
  buildAnalyticsChartData,
  getAnalyticsPeriodLabel,
  getAvailableAnalyticsPeriods,
  getDefaultAnalyticsPeriod,
  getMonthsSinceJoin,
} from '@/src/features/institute/utils/analytics-periods';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicationsChartProps = {
  memberSince: string;
};

export function ApplicationsChart({ memberSince }: ApplicationsChartProps) {
  const availablePeriods = useMemo(
    () => getAvailableAnalyticsPeriods(memberSince),
    [memberSince]
  );
  const tenureMonths = useMemo(() => getMonthsSinceJoin(memberSince), [memberSince]);
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriodMonths>(() =>
    getDefaultAnalyticsPeriod(memberSince)
  );
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    setSelectedPeriod(getDefaultAnalyticsPeriod(memberSince));
  }, [memberSince]);

  useEffect(() => {
    if (!availablePeriods.includes(selectedPeriod)) {
      setSelectedPeriod(getDefaultAnalyticsPeriod(memberSince));
    }
  }, [availablePeriods, memberSince, selectedPeriod]);

  const chartData = useMemo(
    () => buildAnalyticsChartData(selectedPeriod),
    [selectedPeriod]
  );

  const closePicker = () => setPickerVisible(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications Over Time</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.dropdown}
          onPress={() => setPickerVisible(true)}>
          <Text style={styles.dropdownText}>{getAnalyticsPeriodLabel(selectedPeriod)}</Text>
          <Ionicons name="chevron-down" size={14} color="#464554" />
        </TouchableOpacity>
      </View>
      <View style={styles.chartArea}>
        <LinearGradient
          colors={['rgba(70, 72, 212, 0.25)', 'rgba(70, 72, 212, 0.02)']}
          style={styles.chartFill}
        />
        <View style={styles.barsRow}>
          {chartData.map((item) => (
            <View key={item.month} style={styles.barCol}>
              <View style={[styles.bar, { height: 100 * item.value }]} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.labelsRow}>
        {chartData.map((item) => (
          <Text key={item.month} style={styles.monthLabel}>
            {item.month}
          </Text>
        ))}
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
        statusBarTranslucent>
        <View style={styles.pickerRoot}>
          <Pressable style={styles.pickerBackdrop} onPress={closePicker} accessibilityRole="button" />
          <View style={styles.pickerCenter} pointerEvents="box-none">
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select Period</Text>
              <Text style={styles.pickerSubtitle}>
                {tenureMonths <= 0
                  ? 'Your institution joined recently. Only recent data is available.'
                  : `Your institution has been registered for ${tenureMonths} month${tenureMonths === 1 ? '' : 's'}.`}
              </Text>
              {availablePeriods.map((period) => (
                <TouchableOpacity
                  key={period}
                  activeOpacity={0.85}
                  style={[styles.pickerOption, selectedPeriod === period && styles.pickerOptionActive]}
                  onPress={() => {
                    setSelectedPeriod(period);
                    closePicker();
                  }}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      selectedPeriod === period && styles.pickerOptionTextActive,
                    ]}>
                    {getAnalyticsPeriodLabel(period)}
                  </Text>
                  {selectedPeriod === period ? (
                    <Ionicons name="checkmark" size={18} color={AuthColors.profileBrand} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFECF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#464554',
  },
  chartArea: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  chartFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  barsRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 8,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    backgroundColor: '#4648D4',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 8,
    opacity: 0.85,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: AuthColors.textMuted,
  },
  pickerRoot: {
    flex: 1,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 27, 35, 0.45)',
  },
  pickerCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  pickerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: AuthColors.textPrimary,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  pickerSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: AuthColors.textMuted,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  pickerOptionActive: {
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
  },
  pickerOptionText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: '#464554',
  },
  pickerOptionTextActive: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.profileBrand,
  },
});
