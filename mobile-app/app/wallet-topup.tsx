import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { formatPaise, walletApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import RazorpayCheckout from "react-native-razorpay";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TopupPack = {
  amount: number;
  bonus: number;
  badge?: string;
  subtitle?: string;
};

const TOPUP_PACKS: TopupPack[] = [
  { amount: 100, bonus: 0, subtitle: "Standard pack" },
  { amount: 200, bonus: 20 },
  { amount: 500, bonus: 100, badge: "Most Popular" },
  { amount: 1000, bonus: 250 },
];

export default function WalletTopupScreen() {
  const user = useAuthStore((s) => s.user);
  const fetchAll = useWalletStore((s) => s.fetchAll);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const selectedPack = useMemo(
    () => TOPUP_PACKS.find((pack) => pack.amount === selectedAmount) ?? null,
    [selectedAmount],
  );

  const resolvedAmount = useMemo(() => {
    if (selectedAmount !== null) return selectedAmount;
    return Number(customAmount.trim());
  }, [customAmount, selectedAmount]);

  const handlePackPress = useCallback((amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  }, []);

  const handleCustomAmountChange = useCallback((value: string) => {
    setSelectedAmount(null);
    setCustomAmount(value.replace(/[^0-9]/g, ""));
  }, []);

  const handlePay = useCallback(async () => {
    if (!user?.token || user.role !== "student") return;

    if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
      Alert.alert("Invalid Amount", "Enter a valid amount in rupees.");
      return;
    }

    if (resolvedAmount < 10) {
      Alert.alert("Invalid Amount", "Minimum wallet top-up is Rs 10.");
      return;
    }

    const amountRupees = Math.round(resolvedAmount);

    try {
      setIsPaying(true);

      const order = await walletApi.createTopupOrder(amountRupees, user.token);
      const result = await RazorpayCheckout.open({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Mentoreo",
        description: `Wallet top-up of Rs ${amountRupees}`,
        order_id: order.orderId,
        prefill: {
          email: user.email,
          name: user.name,
        },
        notes: {
          student_email: user.email,
          purpose: "wallet_topup",
        },
        theme: {
          color: Colors.accent,
        },
      });

      const verifyRes = await walletApi.verifyTopupPayment(result, user.token);
      await fetchAll(user.token);
      router.back();
      Alert.alert(
        "Balance Added",
        `Your new wallet balance is ${formatPaise(verifyRes.balance_paise)}.`,
      );
    } catch (error: any) {
      const description =
        error?.description ||
        error?.message ||
        "Payment could not be completed.";
      const cancelled =
        error?.code === 0 ||
        error?.reason === "payment_cancelled" ||
        /cancel/i.test(description);

      if (!cancelled) {
        Alert.alert("Payment Failed", description);
      }
    } finally {
      setIsPaying(false);
    }
  }, [fetchAll, resolvedAmount, user]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            disabled={isPaying}
          >
            <Text style={styles.closeButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Wallet Top-Up</Text>
            <Text style={styles.title}>Choose your recharge pack.</Text>
            <Text style={styles.subtitle}>
              Quick amounts for fast checkout, or enter a custom value below.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          {TOPUP_PACKS.map((pack) => {
            const isSelected = selectedAmount === pack.amount;
            return (
              <TouchableOpacity
                key={pack.amount}
                activeOpacity={0.9}
                style={[
                  styles.packCard,
                  isSelected && styles.packCardSelected,
                ]}
                onPress={() => handlePackPress(pack.amount)}
                disabled={isPaying}
              >
                {pack.badge ? (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{pack.badge}</Text>
                  </View>
                ) : null}

                <Text style={styles.packAmount}>₹{pack.amount}</Text>

                {pack.bonus > 0 ? (
                  <View style={styles.bonusPill}>
                    <Text style={styles.bonusPillText}>+ ₹{pack.bonus} Extra</Text>
                  </View>
                ) : (
                  <Text style={styles.packSubtitle}>
                    {pack.subtitle ?? "Direct recharge"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.customCard}>
          <Text style={styles.customTitle}>Custom amount</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.amountInput}
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              keyboardType="number-pad"
              editable={!isPaying}
              placeholder="Enter amount (min ₹10)"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              style={[
                styles.useButton,
                (!customAmount || isPaying) && styles.useButtonDisabled,
              ]}
              onPress={() => setSelectedAmount(null)}
              disabled={!customAmount || isPaying}
            >
              <Text
                style={[
                  styles.useButtonText,
                  (!customAmount || isPaying) && styles.useButtonTextDisabled,
                ]}
              >
                Use
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>You pay</Text>
          <Text style={styles.summaryAmount}>
            ₹{Number.isFinite(resolvedAmount) && resolvedAmount > 0 ? Math.round(resolvedAmount) : 0}
          </Text>
          <Text style={styles.summaryText}>
            {selectedPack?.bonus
              ? `Selected bonus pack shows ₹${selectedPack.bonus} extra styling.`
              : "Custom amounts recharge the exact amount you enter."}
          </Text>
          <Text style={styles.summaryTextMuted}>
            Current backend credits the paid amount. Bonus-credit rules need backend support before going live.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={isPaying}
          activeOpacity={0.9}
        >
          <Text style={styles.payButtonText}>
            {isPaying
              ? "Opening Razorpay..."
              : `Proceed to Pay ₹${Number.isFinite(resolvedAmount) && resolvedAmount > 0 ? Math.round(resolvedAmount) : 0}`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: 28,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
  },
  closeButtonText: {
    fontSize: 28,
    color: Colors.textPrimary,
    marginTop: -2,
  },
  headerCopy: {
    gap: 6,
  },
  eyebrow: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  packCard: {
    width: "48%",
    minHeight: 132,
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    justifyContent: "space-between",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  packCardSelected: {
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOpacity: 0.18,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: 16,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  popularBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  packAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  packSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  bonusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#EFFFF1",
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#C9F1D3",
  },
  bonusPillText: {
    color: "#19A34A",
    fontSize: 12,
    fontWeight: "800",
  },
  customCard: {
    borderWidth: 2,
    borderColor: "#D8C8FF",
    borderStyle: "dashed",
    borderRadius: 24,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: "#FCFAFF",
  },
  customTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D6C6FF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  useButton: {
    minWidth: 64,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
  },
  useButtonDisabled: {
    backgroundColor: "#F1F1F1",
  },
  useButtonText: {
    color: Colors.accentMuted,
    fontSize: FontSize.md,
    fontWeight: "800",
  },
  useButtonTextDisabled: {
    color: "#A7ADB5",
  },
  summaryCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FFD8BA",
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  summaryText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  summaryTextMuted: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === "ios" ? 28 : Spacing.md,
    backgroundColor: Colors.bg,
  },
  payButton: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 20,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
});
