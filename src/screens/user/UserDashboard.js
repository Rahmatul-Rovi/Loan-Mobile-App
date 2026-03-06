import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function UserDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/loans/my-applications');
      const loans = res.data;
      setRecentLoans(loans.slice(0, 3));
      setStats({
        total: loans.length,
        active: loans.filter(l => l.status === 'active').length,
        completed: loans.filter(l => l.status === 'completed').length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        disbursed: loans.filter(l => l.status === 'disbursed').length,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B', approved: '#10B981', rejected: '#EF4444',
      disbursed: '#3B82F6', active: '#8B5CF6', completed: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusBg = (status) => {
    const colors = {
      pending: '#FEF3C7', approved: '#D1FAE5', rejected: '#FEE2E2',
      disbursed: '#DBEAFE', active: '#EDE9FE', completed: '#F3F4F6'
    };
    return colors[status] || '#F3F4F6';
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Manage your loans easily</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileInitial}>{user?.name?.[0]?.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Total', value: stats.total, color: '#4F46E5', bg: '#EEF2FF' },
          { label: 'Active', value: stats.active, color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'Pending', value: stats.pending, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Completed', value: stats.completed, color: '#10B981', bg: '#D1FAE5' },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('LoanTypes')}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Apply Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyLoans')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>My Loans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Reviews')}>
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionText}>Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Applications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyLoans')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentLoans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No loan applications yet</Text>
            <TouchableOpacity style={styles.applyNowBtn} onPress={() => navigation.navigate('LoanTypes')}>
              <Text style={styles.applyNowText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentLoans.map(loan => (
            <TouchableOpacity
              key={loan._id}
              style={styles.loanCard}
              onPress={() => navigation.navigate('LoanApplicationDetail', { loanId: loan._id })}
            >
              <View style={styles.loanCardLeft}>
                <Text style={styles.loanType}>{loan.loanType?.name}</Text>
                <Text style={styles.loanAmount}>৳{loan.requestedAmount?.toLocaleString()}</Text>
                <Text style={styles.loanDate}>{new Date(loan.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBg(loan.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                  {loan.status?.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#4F46E5' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 14, color: '#C7D2FE', marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#818CF8', justifyContent: 'center', alignItems: 'center' },
  profileInitial: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  statCard: { width: '47%', padding: 16, borderRadius: 14, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  seeAll: { color: '#4F46E5', fontWeight: '600' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  actionIcon: { fontSize: 32 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8 },
  loanCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  loanCardLeft: { flex: 1 },
  loanType: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  loanAmount: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5', marginTop: 2 },
  loanDate: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: '#94A3B8', marginTop: 10 },
  applyNowBtn: { backgroundColor: '#4F46E5', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10, marginTop: 14 },
  applyNowText: { color: '#fff', fontWeight: '600' },
});
