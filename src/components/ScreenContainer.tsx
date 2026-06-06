import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, ArrowLeft } from 'lucide-react-native';
import { Text } from 'react-native';
import { theme } from '../constants/theme';

interface ScreenContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  headerRight?: ReactNode;
}

export default function ScreenContainer({
  children,
  title,
  subtitle,
  onMenuPress,
  onBackPress,
  scrollable = true,
  style,
  contentStyle,
  headerRight,
}: ScreenContainerProps) {
  const content = (
    <>
      {(title || onMenuPress || onBackPress) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBackPress && (
              <TouchableOpacity onPress={onBackPress} style={styles.iconBtn}>
                <ArrowLeft size={22} color={theme.text} />
              </TouchableOpacity>
            )}
            {onMenuPress && (
              <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
                <Menu size={22} color={theme.text} />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
            </View>
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flexFill}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flexFill: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    flexShrink: 1,
    gap: 10,
  },
  titleContainer: {
    flex: 1,
    flexShrink: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
    marginTop: 2,
  },
  iconBtn: {
    padding: 4,
    marginTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.text,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
