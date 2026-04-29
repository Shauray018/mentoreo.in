import { useUpdateMentorProfile } from "@/hooks/useUpdateMentorProfile";
import { mentorsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useWalletStore } from "@/stores/walletStore";
import { useSendbirdChat } from "@sendbird/uikit-react-native";
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

import { Colors, FontSize, Radius } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image, Text, View, XStack, YStack } from "tamagui";

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

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [rate, setRate] = useState("");
  const [avatar, setAvatar] = useState("");

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
        <View style={styles.card}>
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
        </View>

        {/* LinkedIn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LinkedIn</Text>

          {editing ? (
            <TextInput
              style={styles.input}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder="LinkedIn URL"
            />
          ) : (
            <Text style={styles.body}>{linkedin || "Not Added"}</Text>
          )}
        </View>

        {/* Expertise */}
        {!!mentor?.expertise_tags?.length && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expertise</Text>

            <XStack flexWrap="wrap" gap={8}>
              {mentor.expertise_tags.map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text color="#FF6B00">{tag}</Text>
                </View>
              ))}
            </XStack>
          </View>
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
