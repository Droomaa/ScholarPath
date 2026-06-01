import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  AiSimilarityCard,
  AiWizardFooter,
  AiWizardHeader,
  AiWizardProgress,
} from '@/src/features/student/ai-recommendation/components';
import { CUSTOM_SKILL_SUGGESTIONS } from '@/src/features/student/ai-recommendation/constants/skill-suggestions';
import {
  INTEREST_FIELD_OPTIONS,
  TECHNICAL_SKILL_OPTIONS,
} from '@/src/features/student/ai-recommendation/constants/wizard-options';
import { type AiWizardFormData } from '@/src/types/student/ai-recommendation';
import { AuthColors, FontFamily } from '@/src/theme';

type StepInterestsSkillsProps = {
  formData: AiWizardFormData;
  onChange: (updates: Partial<AiWizardFormData>) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
  canContinue: boolean;
};

export function StepInterestsSkills({
  formData,
  onChange,
  onBackPress,
  onContinuePress,
  canContinue,
}: StepInterestsSkillsProps) {
  const [customSkillInput, setCustomSkillInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const selectedSkillLabels = useMemo(() => {
    const technicalLabels = TECHNICAL_SKILL_OPTIONS.filter((option) =>
      formData.technicalSkills.includes(option.id)
    ).map((option) => option.label.toLowerCase());

    return new Set([
      ...technicalLabels,
      ...formData.customSkills.map((skill) => skill.toLowerCase()),
    ]);
  }, [formData.customSkills, formData.technicalSkills]);

  const skillSuggestions = useMemo(() => {
    const query = customSkillInput.trim().toLowerCase();
    if (query.length === 0) return [];

    return CUSTOM_SKILL_SUGGESTIONS.filter((skill) => {
      const normalized = skill.toLowerCase();
      return normalized.startsWith(query) && !selectedSkillLabels.has(normalized);
    }).slice(0, 5);
  }, [customSkillInput, selectedSkillLabels]);

  const toggleInterest = (id: string) => {
    const next = formData.interestFields.includes(id)
      ? formData.interestFields.filter((item) => item !== id)
      : [...formData.interestFields, id];
    onChange({ interestFields: next });
  };

  const toggleSkill = (id: string) => {
    const next = formData.technicalSkills.includes(id)
      ? formData.technicalSkills.filter((item) => item !== id)
      : [...formData.technicalSkills, id];
    onChange({ technicalSkills: next });
  };

  const addCustomSkill = (skill?: string) => {
    const trimmed = (skill ?? customSkillInput).trim();
    if (!trimmed) return;
    if (formData.customSkills.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setCustomSkillInput('');
      return;
    }
    onChange({ customSkills: [...formData.customSkills, trimmed] });
    setCustomSkillInput('');
  };

  const selectSuggestion = (skill: string) => {
    addCustomSkill(skill);
  };

  const removeCustomSkill = (skill: string) => {
    onChange({ customSkills: formData.customSkills.filter((item) => item !== skill) });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <AiWizardHeader />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <AiWizardProgress step={1} title="Interests & Skills" />

        <Text style={styles.intro}>
          What sparks your curiosity? Choose your academic fields and technical skills to find
          your perfect <Text style={styles.introHighlight}>Scholarship Match</Text>.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>INTEREST FIELDS</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SELECT ONE OR MULTIPLE</Text>
            </View>
          </View>
          <View style={styles.chipWrap}>
            {INTEREST_FIELD_OPTIONS.map((option) => {
              const selected = formData.interestFields.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  style={[styles.interestChip, selected && styles.interestChipSelected]}
                  onPress={() => toggleInterest(option.id)}>
                  {option.iconFamily === 'material' ? (
                    <MaterialCommunityIcons
                      name={option.icon as 'flask-outline'}
                      size={16}
                      color={selected ? AuthColors.brandPrimary : AuthColors.textPrimary}
                    />
                  ) : (
                    <Ionicons
                      name={option.icon as 'flask-outline'}
                      size={16}
                      color={selected ? AuthColors.brandPrimary : AuthColors.textPrimary}
                    />
                  )}
                  <Text style={[styles.interestChipText, selected && styles.interestChipTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TECHNICAL SKILLS</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PICK STRENGTHS</Text>
            </View>
          </View>

          <View style={styles.skillList}>
            {TECHNICAL_SKILL_OPTIONS.map((option) => {
              const selected = formData.technicalSkills.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  style={[styles.skillCard, selected && styles.skillCardSelected]}
                  onPress={() => toggleSkill(option.id)}>
                  <View style={styles.skillIconWrap}>
                    <Ionicons name={option.icon as 'code-slash-outline'} size={20} color={AuthColors.profileBrand} />
                  </View>
                  <View style={styles.skillTextCol}>
                    <Text style={styles.skillTitle}>{option.label}</Text>
                    <Text style={styles.skillDescription}>{option.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.customSkillSection}>
            <Text style={styles.customSkillLabel}>Other skills?</Text>
            <View style={styles.customSkillInputWrap}>
              <View style={styles.customSkillRow}>
                <TextInput
                  style={styles.customSkillInput}
                  placeholder="e.g. Public Speaking..."
                  placeholderTextColor="rgba(70, 69, 84, 0.4)"
                  value={customSkillInput}
                  onChangeText={setCustomSkillInput}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                  onSubmitEditing={() => addCustomSkill()}
                  returnKeyType="done"
                />
                <Pressable onPress={() => addCustomSkill()}>
                  <LinearGradient
                    colors={[AuthColors.brandPrimary, AuthColors.loginGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {skillSuggestions.length > 0 ? (
                <View style={styles.suggestionList}>
                  {skillSuggestions.map((skill, index) => (
                    <Pressable
                      key={skill}
                      style={[
                        styles.suggestionItem,
                        index === skillSuggestions.length - 1 && styles.suggestionItemLast,
                      ]}
                      onPress={() => selectSuggestion(skill)}>
                      <Ionicons name="search-outline" size={14} color={AuthColors.textMuted} />
                      <Text style={styles.suggestionText}>{skill}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            {formData.customSkills.length > 0 ? (
              <View style={styles.customSkillChips}>
                {formData.customSkills.map((skill) => (
                  <Pressable
                    key={skill}
                    style={styles.customSkillChip}
                    onPress={() => removeCustomSkill(skill)}>
                    <Text style={styles.customSkillChipText}>{skill}</Text>
                    <Ionicons name="close" size={14} color={AuthColors.profileBrand} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <AiSimilarityCard />
      </ScrollView>

      <AiWizardFooter
        onBackPress={onBackPress}
        onContinuePress={onContinuePress}
        continueDisabled={!canContinue}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 220,
    gap: 32,
  },
  intro: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: AuthColors.textSecondary,
  },
  introHighlight: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.brandPrimary,
  },
  section: {
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: AuthColors.textSecondary,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: '#F0DBFF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    color: AuthColors.loginGradientEnd,
    textTransform: 'uppercase',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 21,
    paddingVertical: 13,
  },
  interestChipSelected: {
    backgroundColor: '#E1E0FF',
    borderColor: AuthColors.brandPrimary,
  },
  interestChipText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  interestChipTextSelected: {
    color: AuthColors.brandPrimary,
    fontFamily: FontFamily.semiBold,
  },
  skillList: {
    gap: 16,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 24,
    padding: 21,
  },
  skillCardSelected: {
    backgroundColor: '#E1E0FF',
    borderColor: AuthColors.brandPrimary,
  },
  skillIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillTextCol: {
    flex: 1,
    gap: 2,
  },
  skillTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  skillDescription: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    fontStyle: 'italic',
    color: 'rgba(70, 69, 84, 0.7)',
  },
  customSkillSection: {
    gap: 8,
    paddingTop: 7,
  },
  customSkillInputWrap: {
    position: 'relative',
    zIndex: 2,
  },
  customSkillLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: AuthColors.textSecondary,
  },
  customSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 12,
    paddingRight: 6,
  },
  customSkillInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: AuthColors.textPrimary,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  addButtonText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.white,
  },
  customSkillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  customSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AuthColors.profileChipBackground,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  customSkillChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: AuthColors.profileBrand,
  },
  suggestionList: {
    marginTop: 4,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.6)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198, 197, 215, 0.3)',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
});
