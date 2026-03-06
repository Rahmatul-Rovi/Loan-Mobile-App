import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    nidNumber: user?.nidNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      await updateUser({ ...user, ...res.data });
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#4F46E5" /> :
              <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>}
          </TouchableOpacity>
        </View>

        {[
          { label: 'Full Name', key: 'name' },
          { label: 'Phone', key: 'phone', keyboard: 'phone-pad' },
          { label: 'Address', key: 'address' },
          { label: 'NID Number', key: 'nidNumber', keyboard: 'numeric' },
        ].map(field => (
          <View key={field.key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {editing ? (
              <TextInput
                style={styles.fieldInput}
                value={form[field.key]}
                onChangeText={v => setForm({ ...form, [field.key]: v })}
                keyboardType={field.keyboard || 'default'}
              />
            ) : (
              <Text style={styles.fieldValue}>{form[field.key] || '-'}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditing(false)}>
            <Text style={styles.cancelEditText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{user?.email}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Member Since</Text>
          <Text style={styles.fieldValue}>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { backgroundColor: '#4F46E5', paddingTop: 50, paddingBottom: 30, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#818CF8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { color: '#C7D2FE', marginTop: 4 },
  roleBadge: { marginTop: 8, backgroundColor: '#818CF8', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  card: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginTop: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  editBtn: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
  fieldRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  fieldLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  fieldValue: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  fieldInput: { fontSize: 15, color: '#1E293B', borderBottomWidth: 1.5, borderBottomColor: '#4F46E5', paddingVertical: 4 },
  cancelEditBtn: { marginTop: 12, padding: 10, alignItems: 'center' },
  cancelEditText: { color: '#94A3B8' },
  logoutBtn: { margin: 16, marginTop: 20, backgroundColor: '#FEE2E2', borderRadius: 14, padding: 16, alignItems: 'center' },
  logoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
});
