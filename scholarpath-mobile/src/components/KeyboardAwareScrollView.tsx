import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  extraBottomPadding?: number;
};

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  extraBottomPadding = 40,
  ...scrollProps
}: KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();
  const offset =
    keyboardVerticalOffset + (Platform.OS === 'ios' ? insets.top + 8 : 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + extraBottomPadding },
          contentContainerStyle,
        ]}
        {...scrollProps}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
