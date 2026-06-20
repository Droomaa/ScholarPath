import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AiWizardHeader } from '@/src/features/student/ai-recommendation/components/AiWizardHeader';
import { AuthColors, FontFamily } from '@/src/theme';

type StepNeuralMatchingProps = {
  onRunMatching: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
};

type ProcessingStep = {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
  progress: number;
};

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 'interests', label: 'Matching Interests', status: 'completed', progress: 100 },
  { id: 'skills', label: 'Analyzing Skills', status: 'active', progress: 0 },
  { id: 'similarity', label: 'Calculating Similarity Score', status: 'pending', progress: 0 },
];

export function StepNeuralMatching({
  onRunMatching,
  error,
  isLoading,
  onRetry,
}: StepNeuralMatchingProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [overallProgress, setOverallProgress] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    void onRunMatching();
  }, [hasStarted, onRunMatching]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    const rotateLoop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 8000, useNativeDriver: true })
    );
    pulseLoop.start();
    rotateLoop.start();
    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulse, rotate]);

  useEffect(() => {
    if (error) {
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        setSteps([
          { id: 'interests', label: 'Matching Interests', status: 'completed', progress: 100 },
          { id: 'skills', label: 'Analyzing Skills', status: 'active', progress: 71 },
          { id: 'similarity', label: 'Calculating Similarity Score', status: 'pending', progress: 0 },
        ]);
        setOverallProgress(55);
      }, 900)
    );

    timers.push(
      setTimeout(() => {
        setSteps([
          { id: 'interests', label: 'Matching Interests', status: 'completed', progress: 100 },
          { id: 'skills', label: 'Analyzing Skills', status: 'completed', progress: 100 },
          {
            id: 'similarity',
            label: 'Calculating Similarity Score',
            status: 'active',
            progress: isLoading ? 68 : 100,
          },
        ]);
        setOverallProgress(isLoading ? 83 : 100);
      }, 2200)
    );

    if (!isLoading) {
      timers.push(
        setTimeout(() => {
          setSteps([
            { id: 'interests', label: 'Matching Interests', status: 'completed', progress: 100 },
            { id: 'skills', label: 'Analyzing Skills', status: 'completed', progress: 100 },
            {
              id: 'similarity',
              label: 'Calculating Similarity Score',
              status: 'completed',
              progress: 100,
            },
          ]);
          setOverallProgress(100);
        }, 2800)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [error, isLoading]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <AiWizardHeader rightLabel="Processing Data" showProcessing />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>SYSTEM ANALYSIS PHASE</Text>
          </View>
          <Text style={styles.heroTitle}>Synthesizing Profile Data</Text>
          <Text style={styles.heroSubtitle}>
            Running multi-vector comparison across 5,000+{'\n'}academic pathways.
          </Text>
        </View>

        <View style={styles.visualizer}>
          <View style={styles.orbitOuter} />
          <Animated.View style={[styles.orbitDashed, { transform: [{ rotate: spin }] }]} />
          <Animated.View style={[styles.core, { transform: [{ scale: pulse }] }]}>
            <MaterialCommunityIcons name="creation" size={36} color={AuthColors.white} />
          </Animated.View>

          <View style={[styles.floatLabel, styles.floatLabelTop]}>
            <View style={[styles.floatDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.floatLabelText}>ACADEMIC RECORDS</Text>
          </View>
          <View style={[styles.floatLabel, styles.floatLabelBottom]}>
            <View style={[styles.floatDot, { backgroundColor: AuthColors.loginGradientEnd }]} />
            <Text style={styles.floatLabelText}>CAREER TRENDS</Text>
          </View>
        </View>

        <View style={styles.stepsList}>
          {steps.map((step) => (
            <View
              key={step.id}
              style={[
                styles.stepCard,
                step.status === 'active' && styles.stepCardActive,
                step.status === 'pending' && styles.stepCardPending,
              ]}>
              {step.status === 'active' ? <View style={styles.activeAccent} /> : null}
              <View
                style={[
                  styles.stepIcon,
                  step.status === 'completed' && styles.stepIconDone,
                  step.status === 'active' && styles.stepIconActive,
                  step.status === 'pending' && styles.stepIconPending,
                ]}>
                {step.status === 'completed' ? (
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                ) : step.status === 'active' ? (
                  <MaterialCommunityIcons name="creation" size={20} color={AuthColors.brandPrimary} />
                ) : (
                  <Ionicons name="stats-chart-outline" size={18} color={AuthColors.textMuted} />
                )}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text
                    style={[
                      styles.stepLabel,
                      step.status === 'pending' && styles.stepLabelPending,
                    ]}>
                    {step.label}
                  </Text>
                  {step.status === 'completed' ? (
                    <Text style={styles.stepStatusDone}>COMPLETED</Text>
                  ) : step.status === 'active' ? (
                    <Text style={styles.stepStatusActive}>{step.progress}%</Text>
                  ) : null}
                </View>
                {step.status !== 'pending' ? (
                  <View style={styles.stepTrack}>
                    <View
                      style={[
                        styles.stepFill,
                        step.status === 'completed' ? styles.stepFillDone : styles.stepFillActive,
                        { width: `${step.progress}%` },
                      ]}
                    />
                  </View>
                ) : (
                  <View style={styles.stepPendingBar} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <View>
              <Text style={styles.overallLabel}>OVERALL NEURAL MATCH</Text>
              <Text style={styles.overallValue}>{overallProgress}%</Text>
            </View>
            <View style={styles.overallBars}>
              {[12, 20, 16, 24].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.overallBar,
                    { height, opacity: 0.3 + index * 0.2 },
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.overallTrack}>
            <LinearGradient
              colors={[AuthColors.brandPrimary, '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.overallFill, { width: `${overallProgress}%` }]}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#BA1A1A" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={onRetry} disabled={isLoading}>
              <Text style={styles.retryButtonText}>
                {isLoading ? 'Memproses...' : 'Coba Lagi'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FF' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 40 },
  hero: { alignItems: 'center', gap: 8 },
  phaseBadge: {
    backgroundColor: 'rgba(44, 42, 188, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(44, 42, 188, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 17,
    paddingVertical: 5,
  },
  phaseBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 1.1,
    color: AuthColors.brandPrimary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22.75,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  visualizer: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitOuter: {
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(44, 42, 188, 0.05)',
  },
  orbitDashed: {
    position: 'absolute',
    inset: 24,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(44, 42, 188, 0.1)',
    borderStyle: 'dashed',
  },
  core: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: AuthColors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AuthColors.brandPrimary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  floatLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#E4E1ED',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  floatLabelTop: { top: 16, left: 0 },
  floatLabelBottom: { bottom: 48, right: 0 },
  floatDot: { width: 6, height: 6, borderRadius: 3 },
  floatLabelText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: -0.25,
    color: AuthColors.textPrimary,
    textTransform: 'uppercase',
  },
  stepsList: { gap: 16 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#E4E1ED',
    borderRadius: 16,
    padding: 21,
    overflow: 'hidden',
  },
  stepCardActive: {
    borderWidth: 2,
    borderColor: 'rgba(44, 42, 188, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  stepCardPending: {
    backgroundColor: 'rgba(239, 236, 248, 0.3)',
    borderColor: 'transparent',
  },
  activeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: AuthColors.brandPrimary,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  stepIconActive: { backgroundColor: 'rgba(44, 42, 188, 0.1)' },
  stepIconPending: { backgroundColor: 'rgba(70, 69, 84, 0.1)' },
  stepContent: { flex: 1, gap: 6 },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
  },
  stepLabelPending: {
    fontFamily: FontFamily.medium,
    color: AuthColors.textSecondary,
  },
  stepStatusDone: {
    fontFamily: FontFamily.extraBold,
    fontSize: 10,
    lineHeight: 15,
    color: '#10B981',
    textTransform: 'uppercase',
  },
  stepStatusActive: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    lineHeight: 16.5,
    color: AuthColors.brandPrimary,
  },
  stepTrack: {
    height: 6,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileChipBackground,
    overflow: 'hidden',
  },
  stepFill: { height: '100%', borderRadius: 9999 },
  stepFillDone: { backgroundColor: '#10B981' },
  stepFillActive: { backgroundColor: AuthColors.brandPrimary },
  stepPendingBar: {
    width: 65,
    height: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(70, 69, 84, 0.1)',
  },
  overallCard: {
    backgroundColor: '#EFF4FF',
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.3)',
    borderRadius: 16,
    padding: 25,
    gap: 16,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  overallLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: 'rgba(70, 69, 84, 0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  overallValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: AuthColors.brandPrimary,
  },
  overallBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 32,
    paddingBottom: 8,
  },
  overallBar: {
    width: 4,
    borderRadius: 9999,
    backgroundColor: AuthColors.brandPrimary,
  },
  overallTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: AuthColors.progressInactive,
    overflow: 'hidden',
  },
  overallFill: { height: '100%', borderRadius: 9999 },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: AuthColors.brandPrimary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
});
