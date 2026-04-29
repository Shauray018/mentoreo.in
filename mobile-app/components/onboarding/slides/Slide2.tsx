// slides/Slide2.tsx
import { StyleSheet, Text, View } from "react-native";
import { Image } from "tamagui";

export default function Slide2() {
  return (
    <View style={styles.container}>
      <View style={styles.visual}>
        {/* Your illustration here */}
        {/* <Text style={{ fontSize: 80 }}>🎭</Text> */}
        <Image
          src={require("../../../assets/images/signin2.png")}
          width={"100%"}
          height={"450"}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Don't let others control your college{" "}
          <Text style={styles.bold}>Decision.</Text>
        </Text>
        <Text style={styles.subtitle}>
          "Ask yourself: Would I really listen to my neighbor's cousin for the
          biggest decision of my life?"
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    lineHeight: 32,
    marginBottom: 10,
  },
  bold: { fontWeight: "800", color: "#111" },
  subtitle: {
    fontSize: 12,
    color: "#888",
    lineHeight: 20,
    fontStyle: "italic",
  },
});
