import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput
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

export default function AdminApplicationsScreen({ navigation, route }) {
  const initialFilter = route.params?.filterStatus || 'all';
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  const fetchApps = async () => {
    try {
      const res = await api.get(`/admin/applications?status=${filter}&search=${search}`);
      setApps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchApps(); }, [filter, search]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchApps(); }, [filter]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loan Applications</Text>
        <Text style={styles.subtitle}>{apps.length} applications</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'disbursed', 'active', 'completed', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={apps}
        keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<View style={styles.empty}><Text>No applications found</Text></View>}
        renderItem={({ item }) => {
          const sc = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
          return (
            <TouchableOpacity style={styles.card}
              onPress={() => navigation.navigate('ApplicationDetail', { appId: item._id })}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.userName}>{item.user?.name}</Text>
                  <Text style={styles.userEmail}>{item.user?.email}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.badgeText, { color: sc.text }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.loanType}>{item.loanType?.name}</Text>
                <Text style={styles.amount}>৳{item.requestedAmount?.toLocaleString()}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>📅 {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.metaText}>📊 {item.interestRate}% p.a.</Text>
                <Text style={styles.metaText}>⏱ {item.tenure}mo</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#A7F3D0', marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#D1FAE5' },
  filterBtnActive: { backgroundColor: '#059669' },
  filterText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  userName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  userEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  loanType: { color: '#64748B', fontSize: 14 },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 12, color: '#94A3B8' },
  empty: { padding: 40, alignItems: 'center' },
});
