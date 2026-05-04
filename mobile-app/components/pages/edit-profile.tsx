import { Colors, FontSize, Radius } from "@/constants/theme";
import { useUpdateMentorProfile } from "@/hooks/useUpdateMentorProfile";
import { mentorsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useWalletStore } from "@/stores/walletStore";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSendbirdChat } from "@sendbird/uikit-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Image, Text, View, XStack, YStack } from "tamagui";

const EXPERTISE_OPTIONS = ["JEE", "NEET", "CUET", "OTHERS"] as const;
type ExpertiseTag = (typeof EXPERTISE_OPTIONS)[number];

export default function MentorProfileScreen() {
  const { saveProfile, loading: saving } = useUpdateMentorProfile();
  const { user, signOut } = useAuthStore();
  const resetSession = useSessionStore((s) => s.reset);
  const resetWallet = useWalletStore((s) => s.reset);
  const { sdk } = useSendbirdChat();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [mentor, setMentor] = useState<any>(null);
  const [expertiseTag, setExpertiseTag] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [rate, setRate] = useState("");
  const [avatar, setAvatar] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await mentorsApi.getByEmail(user?.email || "");
      setMentor(data);

      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setCollege(data.college || "");
      setCourse(data.course || "");
      setLinkedin(data.linkedin || "");
      setRate(String(data.rate_per_minute || ""));
      setAvatar(data.avatar_url || "");
      setExpertiseTag((data.expertise_tags?.[0] as ExpertiseTag) ?? "JEE");
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!res.canceled) {
      setAvatar(res.assets[0].uri);
    }
  };
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await sdk.disconnect();
          resetSession();
          resetWallet();
          signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  };
  const handleSave = async () => {
    try {
      await saveProfile({
        email: user?.email || "",
        display_name: displayName,
        bio,
        college,
        course,
        linkedin,
        avatar_url: avatar,
        rate_per_minute: Number(rate),
        expertise_tags: [expertiseTag], // single pick, stored as array
      });

      Alert.alert("Saved", "Profile Updated");
      setEditing(false);
      loadProfile();
    } catch {
      Alert.alert("Error", "Could not save profile");
    }
  };

  const tierColor = (tier: string) => {
    if (tier === "gold") return "#F5B400";
    if (tier === "silver") return "#B8BEC9";
    return "#CD7F32";
  };

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <YStack padding={20} gap={18} paddingBottom={120}>
        {/* Header */}
        <YStack alignItems="center" marginTop={15}>
          <XStack justifyContent="flex-end" width={"100%"}>
            <TouchableOpacity onPress={() => setEditing(true)}>
              <FontAwesome6 name="edit" size={24} color="black" />
            </TouchableOpacity>
          </XStack>
          <TouchableOpacity disabled={!editing} onPress={pickImage}>
            {avatar ? (
              <Image
                src={avatar}
                width={110}
                height={110}
                borderRadius={100}
                borderWidth={2}
              />
            ) : (
              <View style={styles.avatar}>
                <Text color="white" fontSize={30}>
                  {displayName?.charAt(0) || "M"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>{displayName || "Mentor"}</Text>

          <XStack gap={8} marginTop={8}>
            <View
              style={[
                styles.badge,
                { backgroundColor: tierColor(mentor?.tier) },
              ]}
            >
              <Text color="white" fontSize={12}>
                {mentor?.tier?.toUpperCase()}
              </Text>
            </View>

            {mentor?.is_verified && (
              <View style={styles.verified}>
                <Text color="white" fontSize={12}>
                  VERIFIED
                </Text>
              </View>
            )}
          </XStack>
        </YStack>

        {/* Bio Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          {editing ? (
            <TextInput
              style={[styles.input, { height: 90 }]}
              multiline
              value={bio}
              onChangeText={setBio}
              placeholder="Write your bio"
            />
          ) : (
            <Text style={styles.body}>{bio || "No bio added yet."}</Text>
          )}
        </View>

        {/* Academic */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Academic Details</Text>

          {editing ? (
            <>
              <TextInput
                style={styles.input}
                value={college}
                onChangeText={setCollege}
                placeholder="College"
              />
              <TextInput
                style={styles.input}
                value={course}
                onChangeText={setCourse}
                placeholder="Course"
              />
            </>
          ) : (
            <>
              <Text style={styles.body}>{college}</Text>
              <Text style={styles.sub}>{course}</Text>
              <Text style={styles.sub}>Year {mentor?.year}</Text>
            </>
          )}
        </View>

        {/* Pricing */}
        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Pricing</Text>

          {editing ? (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={rate}
              onChangeText={setRate}
              placeholder="₹ per minute"
            />
          ) : (
            <Text style={styles.price}>₹{mentor?.rate_per_minute}/min</Text>
          )}
        </View> */}

        {/* Expertise */}
        {editing ? (
          <YStack>
            <Text
              paddingLeft={10}
              paddingBottom={4}
              fontSize={16}
              fontWeight={500}
            >
              Exam
            </Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen((p) => !p)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownTriggerText}>{expertiseTag}</Text>
              <FontAwesome6
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#6B7280"
              />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {EXPERTISE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      expertiseTag === option && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setExpertiseTag(option);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        expertiseTag === option &&
                          styles.dropdownItemTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {expertiseTag === option && (
                      <FontAwesome6 name="check" size={13} color="#FF6B00" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </YStack>
        ) : (
          <YStack>
            <Text paddingLeft={2} fontWeight={500} paddingBottom={4}>
              Exam
            </Text>
            <XStack flexWrap="wrap" gap={8}>
              {mentor?.expertise_tags?.length ? (
                mentor.expertise_tags.map((tag: string) => (
                  <View key={tag} style={styles.tag}>
                    <Text color="#FF6B00">{tag}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.sub}>No expertise added yet.</Text>
              )}
            </XStack>
          </YStack>
        )}
      </YStack>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        {editing ? (
          <XStack gap={10}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditing(false)}
            >
              <Text color="#263238" fontWeight="700">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text color="white" fontWeight="700">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </XStack>
        ) : (
          // <TouchableOpacity
          //   style={styles.saveBtnFull}
          //   // onPress={() => setEditing(true)}
          //   onPress={() => handleSignOut()}
          // >
          //   <Text color="white" fontWeight="700">
          //     LogOut
          //   </Text>
          // </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF8F3",
    marginTop: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  signOutBtn: {
    backgroundColor: Colors.error + "1A",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + "55",
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.error,
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 14,
    color: "#263238",
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
  },

  verified: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF6B00",
    marginBottom: 12,
  },

  body: {
    fontSize: 16,
    color: "#263238",
    lineHeight: 24,
  },

  sub: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },
  dropdownTrigger: {
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: "#263238",
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#FFF2E8",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#263238",
  },
  dropdownItemTextActive: {
    color: "#FF6B00",
    fontWeight: "700",
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: "#263238",
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },

  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF2E8",
    borderRadius: 999,
  },

  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
  },
  picker: {
    height: 52,
    color: "#263238",
  },

  saveBtnFull: {
    backgroundColor: "#FB2C36",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
