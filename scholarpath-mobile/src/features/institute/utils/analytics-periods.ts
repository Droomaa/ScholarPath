export type AnalyticsPeriodMonths = 1 | 3 | 6;

export type AnalyticsChartPoint = {
  month: string;
  value: number;
};

const PERIOD_LABELS: Record<AnalyticsPeriodMonths, string> = {
  1: 'Last 1 Month',
  3: 'Last 3 Months',
  6: 'Last 6 Months',
};

const MOCK_VALUES: Record<AnalyticsPeriodMonths, number[]> = {
  6: [0.45, 0.55, 0.5, 0.72, 0.65, 0.85],
  3: [0.5, 0.72, 0.85],
  1: [0.85],
};

export function getAnalyticsPeriodLabel(period: AnalyticsPeriodMonths) {
  return PERIOD_LABELS[period];
}

export function getMonthsSinceJoin(memberSinceIso: string) {
  const joined = new Date(memberSinceIso);
  if (Number.isNaN(joined.getTime())) return 0;

  const now = new Date();
  let months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());

  if (now.getDate() < joined.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

export function getAvailableAnalyticsPeriods(memberSinceIso: string): AnalyticsPeriodMonths[] {
  const tenureMonths = getMonthsSinceJoin(memberSinceIso);
  const options: AnalyticsPeriodMonths[] = [];

  if (tenureMonths >= 6) options.push(6);
  if (tenureMonths >= 3) options.push(3);
  if (tenureMonths >= 1 || options.length === 0) options.push(1);

  return options;
}

export function getDefaultAnalyticsPeriod(memberSinceIso: string): AnalyticsPeriodMonths {
  const options = getAvailableAnalyticsPeriods(memberSinceIso);
  return options[0];
}

export function buildAnalyticsChartData(period: AnalyticsPeriodMonths): AnalyticsChartPoint[] {
  const values = MOCK_VALUES[period];
  const now = new Date();

  return values.map((value, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (values.length - 1 - index), 1);
    return {
      month: date.toLocaleString('en-US', { month: 'short' }),
      value,
    };
  });
}
