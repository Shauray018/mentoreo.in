// slides/Slide1.tsx
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Image } from "tamagui";

export default function Slide1() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <View style={styles.visual}>
        <Image
          src={require("../../../assets/images/signin1.png")}
          width={"100%"}
          height={"450"}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Don't know which college reviews to{" "}
          <Text style={styles.accent}>trust?</Text>
        </Text>
        <Text style={styles.subtitle}>
          P.S. Most of those are PAID reviews.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  visual: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  content: { paddingHorizontal: 28, paddingTop: 24 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    lineHeight: 32,
    marginBottom: 10,
  },
  accent: { color: "#FF7A00", textDecorationLine: "underline" },
  subtitle: { fontSize: 13, color: "#888", lineHeight: 20 },
});
