import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AiCtaSection, AiFeatureBentoGrid, AiHeroSection } from '@/src/features/student/ai/components';
import { HomeTopBar } from '@/src/features/student/home/components';
import { AuthColors } from '@/src/theme';

export function StudentAiScreen() {
  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <AiHeroSection />
        <AiFeatureBentoGrid />
        <AiCtaSection onPress={() => router.push('/ai-recommendation' as Href)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
});
