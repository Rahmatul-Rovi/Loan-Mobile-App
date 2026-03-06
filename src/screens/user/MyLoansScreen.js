import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl
} from 'react-native';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  approved: { bg: '#D1FAE5', text: '#059669' },
  rejected: { bg: '#FEE2E2', text: '#DC2626' },
  disbursed: { bg: '#DBEAFE', text: '#2563EB' },
  active: { bg: '#EDE9FE', text: '#7C3AED' },
  completed: { bg: '#F3F4F6', text: '#4B5563' },
};

export default function MyLoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans/my-applications');
      setLoans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchLoans(); }, []);

  const filtered = filter === 'all' ? loans : loans.filter(l => l.status === filter);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Loan Applications</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'active', 'completed', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📭</Text><Text style={styles.emptyText}>No loans found</Text></View>}
        renderItem={({ item }) => {
          const sc = STATUS_COLORS[item.status] || { bg: '#F3F4F6', text: '#4B5563' };
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('LoanApplicationDetail', { loanId: item._id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.loanTypeName}>{item.loanType?.name}</Text>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.text }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.amount}>৳{item.requestedAmount?.toLocaleString()}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.meta}>📅 {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.meta}>📊 {item.interestRate}% p.a.</Text>
                <Text style={styles.meta}>⏱ {item.tenure} months</Text>
              </View>
              {item.status === 'active' && item.repaymentDeadline && (
                <View style={styles.deadlineRow}>
                  <Text style={styles.deadlineText}>
                    ⏰ Deadline: {new Date(item.repaymentDeadline).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, flexWrap: 'wrap', gap: 6, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9' },
  filterBtnActive: { backgroundColor: '#4F46E5' },
  filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  loanTypeName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', gap: 12 },
  meta: { fontSize: 12, color: '#64748B' },
  deadlineRow: { marginTop: 8, padding: 8, backgroundColor: '#FEF3C7', borderRadius: 8 },
  deadlineText: { fontSize: 12, color: '#D97706', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 15 },
});
