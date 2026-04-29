import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import {
  WalletTransaction,
  formatPaise,
  sessionsApi,
  studentsApi,
} from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Student Wallet ────────────────────────────────────────────────────────
function StudentWallet() {
  const { user } = useAuthStore();
  const {
    balance_paise,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    fetchAll,
  } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.token) fetchAll(user.token);
  }, [user?.token]);

  const handleRefresh = useCallback(async () => {
    if (!user?.token) return;
    setRefreshing(true);
    await fetchAll(user.token);
    setRefreshing(false);
  }, [user?.token]);

  const isLoading = isLoadingBalance && balance_paise === null;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.accent}
        />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.pageTitle}>My Wallet</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {balance_paise !== null ? formatPaise(balance_paise) : "—"}
            </Text>
            <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.85}>
              <Text style={styles.addMoneyBtnText}>＋ Add Money</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>
      }
      data={transactions}
      keyExtractor={(t) => t.id}
      renderItem={({ item }) => <TransactionRow tx={item} />}
      ListEmptyComponent={
        isLoadingTransactions ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )
      }
    />
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isDebit = tx.amount_paise < 0;
  return (
    <View style={styles.txRow}>
      <View
        style={[
          styles.txIcon,
          {
            backgroundColor: isDebit
              ? Colors.error + "22"
              : Colors.success + "22",
          },
        ]}
      >
        <Text style={{ fontSize: 18 }}>{isDebit ? "📤" : "📥"}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {tx.description}
        </Text>
        <Text style={styles.txDate}>
          {new Date(tx.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            { color: isDebit ? Colors.error : Colors.success },
          ]}
        >
          {isDebit ? "−" : "+"}
          {formatPaise(Math.abs(tx.amount_paise))}
        </Text>
        <Text style={styles.txBalance}>
          Bal: {formatPaise(tx.balance_after_paise)}
        </Text>
      </View>
    </View>
  );
}

// ─── Mentor Earnings ───────────────────────────────────────────────────────
function MentorEarnings() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await sessionsApi.getHistory(user.token);
      setSessions(res.sessions.filter((s) => s.status === "completed"));
    } catch (e) {
      console.error("💥 [earnings]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const totalEarned = sessions.reduce(
    (sum, s) => sum + Math.floor((s.total_amount_paise || 0) * 0.8),
    0,
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={Colors.accent}
        />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.pageTitle}>Earnings</Text>
          <View style={styles.earningsCard}>
            <View style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>Total Earned</Text>
            <Text style={styles.balanceAmount}>{formatPaise(totalEarned)}</Text>
            <Text style={styles.earningsSub}>80% of session revenue</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {Math.round(
                  sessions.reduce((s, x) => s + (x.duration_seconds || 0), 0) /
                    60,
                )}
                m
              </Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Session History</Text>
        </View>
      }
      data={sessions}
      keyExtractor={(s) => s.id}
      renderItem={({ item }) => <EarningRow session={item} />}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No completed sessions yet</Text>
        </View>
      }
    />
  );
}

function EarningRow({ session }: { session: any }) {
  const [studentName, setStudentName] = useState("Loading...");

  useEffect(() => {
    const getStudentName = async () => {
      try {
        const res = await studentsApi.getByEmail(session.student_email);
        setStudentName(res.student.name);
      } catch (err) {
        setStudentName(session.student_email);
      }
    };

    getStudentName();
  }, [session.student_email]);

  const earned = Math.floor((session.total_amount_paise || 0) * 0.8);

  const mins = session.duration_seconds
    ? Math.ceil(session.duration_seconds / 60)
    : 0;

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: Colors.success + "22" }]}>
        <Text style={{ fontSize: 18 }}>💼</Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>
          Session with {studentName}
        </Text>

        <Text style={styles.txDate}>
          {mins}m ·{" "}
          {new Date(session.ended_at || session.started_at).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
            },
          )}
        </Text>
      </View>

      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: Colors.success }]}>
          +{formatPaise(earned)}
        </Text>

        <Text style={styles.txBalance}>
          Total: {formatPaise(session.total_amount_paise || 0)}
        </Text>
      </View>
    </View>
  );
}

export default function WalletTab() {
  const { user } = useAuthStore();
  return user?.role === "student" ? <StudentWallet /> : <MentorEarnings />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  balanceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  balanceGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.accent,
    opacity: 0.08,
  },
  balanceLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  addMoneyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  addMoneyBtnText: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.bg,
  },
  earningsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  earningsSub: { fontSize: FontSize.sm, color: Colors.textMuted },
  statsRow: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txDesc: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  txDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: FontSize.md, fontWeight: "700" },
  txBalance: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  emptyWrap: { padding: Spacing.xl, alignItems: "center" },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
