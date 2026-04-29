// components/onboarding/StepTitle.tsx
import { StyleSheet, View } from "react-native";
import { Text, YStack } from "tamagui";

interface StepTitleProps {
  pre?: string; // text before the keyword
  keyword: string; // bold + yellow underline word
  post?: string; // text after the keyword (on same line as keyword)
  subtitle?: string;
}

export function StepTitle({ pre, keyword, post, subtitle }: StepTitleProps) {
  return (
    <YStack marginBottom={28}>
      <Text color="#263238" fontSize={36} fontWeight="300" lineHeight={44}>
        {pre && `${pre}\n`}
        <Text fontWeight="700" color="#263238">
          {keyword}
        </Text>
        {post && (
          <Text fontWeight="300" color="#263238">
            {post}
          </Text>
        )}
      </Text>
      {!!subtitle && (
        <Text
          marginTop={6}
          fontSize={14}
          fontWeight="300"
          color="#7A7A7A"
          lineHeight={20}
        >
          {subtitle}
        </Text>
      )}
    </YStack>
  );
}

// Yellow underline keyword — rendered inline
export function KeywordUnderline({ children }: { children: string }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.text}>{children}</Text>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 36,
    fontWeight: "700",
    color: "#263238",
  },
  underline: {
    height: 5,
    backgroundColor: "#F5C518",
    borderRadius: 3,
    marginTop: -4,
  },
});
