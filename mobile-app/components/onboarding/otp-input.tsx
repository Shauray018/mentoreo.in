// OtpInput.tsx  — drop-in replacement for the OTP step
import { MotiView } from "moti";
import { useRef } from "react";
import { Dimensions, TextInput, View } from "react-native";
import { Easing, ZoomOut } from "react-native-reanimated";
import { Text } from "tamagui";

const { width } = Dimensions.get("window");
const OTP_LENGTH = 6;
const _cellSize = Math.floor((width - 80) / OTP_LENGTH);

const ORANGE = "#FF8000";

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
};

export function OtpInput({ value, onChange }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View>
      {/* Hidden real TextInput that captures keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) =>
          onChange(t.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))
        }
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        autoFocus
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
      />

      {/* Visual cells */}
      <View
        style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => {
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => {
          const char = value[i];
          const isFocused = i === value.length && value.length < OTP_LENGTH;

          return (
            <View
              key={i}
              style={{
                width: _cellSize,
                height: _cellSize,
                borderRadius: _cellSize,
                backgroundColor: "rgba(0,0,0,0.08)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {char ? (
                <MotiView
                  key={`otp-${i}-${char}`}
                  from={{ scale: 0, backgroundColor: ORANGE }}
                  animate={{ scale: 1, backgroundColor: ORANGE }}
                  exiting={ZoomOut.duration(150)}
                  transition={{
                    type: "timing",
                    duration: 300,
                    easing: Easing.elastic(1.1),
                  }}
                  style={{
                    flex: 1,
                    width: "100%",
                    borderRadius: _cellSize,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: _cellSize / 2.2,
                      color: "#fff",
                      fontWeight: "700",
                    }}
                  >
                    {char}
                  </Text>
                </MotiView>
              ) : isFocused ? (
                // Blinking cursor dot for the active empty cell
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ loop: true, type: "timing", duration: 900 }}
                  style={{
                    width: 2,
                    height: _cellSize * 0.45,
                    backgroundColor: ORANGE,
                    borderRadius: 2,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
