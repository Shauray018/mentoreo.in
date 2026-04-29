// slides/Slide3.tsx
import { StyleSheet, Text, View } from "react-native";
import { Image } from "tamagui";

export default function Slide3() {
  return (
    <View style={styles.container}>
      <View style={styles.visual}>
        <Image
          src={require("../../../assets/images/signin3.png")}
          width={"100%"}
          height={"450"}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Get the most honest truth from our{" "}
          <Text style={styles.accent}>verified mentors</Text>
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
  },
  content: { paddingHorizontal: 28, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", lineHeight: 32 },
  accent: { color: "#FF7A00", fontWeight: "800" },
});
