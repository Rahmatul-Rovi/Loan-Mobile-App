import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/applications?status=pending')
      ]);
      setStats(statsRes.data);
      setRecentApps(appsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel 🛡️</Text>
          <Text style={styles.subGreeting}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Stats Row */}
      <View style={styles.mainStatsRow}>
        <View style={[styles.mainStatCard, { backgroundColor: '#4F46E5' }]}>
          <Text style={styles.mainStatValue}>{stats?.totalLoans || 0}</Text>
          <Text style={styles.mainStatLabel}>Total Loans</Text>
        </View>
        <View style={[styles.mainStatCard, { backgroundColor: '#059669' }]}>
          <Text style={styles.mainStatValue}>{stats?.totalUsers || 0}</Text>
          <Text style={styles.mainStatLabel}>Total Users</Text>
        </View>
      </View>

      {/* Amount Stats */}
      <View style={styles.amountRow}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Disbursed</Text>
          <Text style={styles.amountValue}>৳{(stats?.totalDisbursed || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Collected</Text>
          <Text style={styles.amountValue}>৳{(stats?.totalCollected || 0).toLocaleString()}</Text>
        </View>
      </View>

      {/* Status Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Status Overview</Text>
        <View style={styles.statusGrid}>
          {[
            { label: 'Pending', value: stats?.pending, color: '#F59E0B', bg: '#FEF3C7', filter: 'pending' },
            { label: 'Approved', value: stats?.approved, color: '#059669', bg: '#D1FAE5', filter: 'approved' },
            { label: 'Rejected', value: stats?.rejected, color: '#DC2626', bg: '#FEE2E2', filter: 'rejected' },
            { label: 'Disbursed', value: stats?.disbursed, color: '#2563EB', bg: '#DBEAFE', filter: 'disbursed' },
            { label: 'Active', value: stats?.active, color: '#7C3AED', bg: '#EDE9FE', filter: 'active' },
            { label: 'Completed', value: stats?.completed, color: '#4B5563', bg: '#F3F4F6', filter: 'completed' },
          ].map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.statusCard, { backgroundColor: s.bg }]}
              onPress={() => navigation.navigate('Applications', { filterStatus: s.filter })}
            >
              <Text style={[styles.statusValue, { color: s.color }]}>{s.value || 0}</Text>
              <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {[
            { label: 'All Applications', icon: '📋', screen: 'Applications' },
            { label: 'Pending Review', icon: '⏳', screen: 'Applications', params: { filterStatus: 'pending' } },
            { label: 'Manage Loans', icon: '💰', screen: 'ManageLoanTypes' },
            { label: 'All Users', icon: '👥', screen: 'Users' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen, a.params || {})}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pending Applications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Applications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Applications', { filterStatus: 'pending' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentApps.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>✅ No pending applications!</Text>
          </View>
        ) : (
          recentApps.map(app => (
            <TouchableOpacity key={app._id} style={styles.appCard}
              onPress={() => navigation.navigate('ApplicationDetail', { appId: app._id })}>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.user?.name}</Text>
                <Text style={styles.appType}>{app.loanType?.name}</Text>
                <Text style={styles.appDate}>{new Date(app.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.appRight}>
                <Text style={styles.appAmount}>৳{app.requestedAmount?.toLocaleString()}</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>PENDING</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subGreeting: { color: '#A7F3D0', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#fff', fontWeight: '600' },
  mainStatsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  mainStatCard: { flex: 1, borderRadius: 16, padding: 20, alignItems: 'center' },
  mainStatValue: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  mainStatLabel: { color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  amountRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  amountCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  amountLabel: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  amountValue: { color: '#059669', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  seeAll: { color: '#059669', fontWeight: '600' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusCard: { width: '30%', padding: 14, borderRadius: 14, alignItems: 'center', flex: 1 },
  statusValue: { fontSize: 26, fontWeight: 'bold' },
  statusLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  actionIcon: { fontSize: 30 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8, textAlign: 'center' },
  appCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  appInfo: { flex: 1 },
  appName: { fontWeight: '700', color: '#1E293B', fontSize: 15 },
  appType: { color: '#64748B', fontSize: 13, marginTop: 2 },
  appDate: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  appRight: { alignItems: 'flex-end' },
  appAmount: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginTop: 4 },
  pendingText: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  emptyCard: { backgroundColor: '#D1FAE5', borderRadius: 14, padding: 20, alignItems: 'center' },
  emptyText: { color: '#059669', fontWeight: '600' },
});
