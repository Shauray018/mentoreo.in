import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Image, Text, YStack } from "tamagui";

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export type RoleType = "student" | "mentor";

const roleData = {
  student: {
    title: "I am a Student",
    desc: "I'm looking for verified college seniors and career guidance.",
    image: require("../../assets/images/studentRole.png"),
  },
  mentor: {
    title: "I am a Mentor",
    desc: "I want to guide students and share my experience.",
    image: require("../../assets/images/mentorRole.png"),
  },
};

export default function RoleCard({
  role,
  selected,
  onPress,
}: {
  role: RoleType;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(selected ? 1.03 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.03 : 1, {
      damping: 14,
      stiffness: 120,
    });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const data = roleData[role];

  return (
    <AnimatedYStack
      onPress={onPress}
      pressStyle={{ scale: 0.98 }}
      style={animatedStyle}
      padding={20}
      backgroundColor={selected ? "#F5EFE8" : "rgba(255,255,255)"}
      borderRadius={24}
      borderWidth={1.5}
      borderColor={selected ? "#FF8A00" : "#F1F1F1"}
      alignItems="center"
      gap={10}
      shadowColor="rgba(0,0,0,0.10)"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={1}
      shadowRadius={3}
      elevation={3}
      marginHorizontal={10}
      marginBottom={16}
    >
      <Image src={data.image} width={110} height={110} />

      <Text fontSize={22} fontWeight="700" color="#263238" textAlign="center">
        {data.title}
      </Text>

      {selected && (
        <Text
          fontSize={15}
          color="#7A7A7A"
          textAlign="center"
          maxWidth={230}
          lineHeight={22}
        >
          {data.desc}
        </Text>
      )}
    </AnimatedYStack>
  );
}
