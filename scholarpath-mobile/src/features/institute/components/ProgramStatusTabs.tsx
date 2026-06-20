import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type InstituteProgramTab } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ProgramStatusTabsProps = {
  selected: InstituteProgramTab;
  onSelect: (tab: InstituteProgramTab) => void;
};

const TABS: { id: InstituteProgramTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'review', label: 'Review' },
  { id: 'closed', label: 'Closed' },
];

export function ProgramStatusTabs({ selected, onSelect }: ProgramStatusTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = selected === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(tab.id)}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EFECF8',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: AuthColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
  tabTextActive: {
    color: '#4648D4',
  },
});
