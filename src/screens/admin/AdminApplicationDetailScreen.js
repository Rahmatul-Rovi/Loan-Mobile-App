import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import api from '../../utils/api';

export default function AdminApplicationDetailScreen({ route, navigation }) {
  const { appId } = route.params;
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'disburse'
  const [form, setForm] = useState({ approvedAmount: '', adminNote: '', repaymentDeadline: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchApp(); }, []);

  const fetchApp = async () => {
    try {
      const res = await api.get(`/admin/applications/${appId}`);
      setApp(res.data);
      setForm(prev => ({ ...prev, approvedAmount: String(res.data.requestedAmount) }));
    } catch (err) {
      Alert.alert('Error', 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status) => {
    if (status === 'approved') {
      if (!form.approvedAmount || !form.repaymentDeadline)
        return Alert.alert('Error', 'Approved amount and deadline are required');
    }
    setSubmitting(true);
    try {
      await api.put(`/admin/applications/${appId}/decision`, {
        status,
        approvedAmount: parseFloat(form.approvedAmount),
        adminNote: form.adminNote,
        repaymentDeadline: form.repaymentDeadline
      });
      Alert.alert('Success', `Application ${status}!`, [
        { text: 'OK', onPress: () => { setModalType(null); fetchApp(); } }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisburse = async () => {
    setSubmitting(true);
    try {
      await api.post(`/admin/applications/${appId}/disburse`);
      // Mark as active immediately
      await api.put(`/admin/applications/${appId}/confirm-disburse`);
      Alert.alert('Disbursed! 💸', 'Loan has been disbursed to the user.', [
        { text: 'OK', onPress: () => { setModalType(null); fetchApp(); } }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Disbursement failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;
  if (!app) return null;

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{app.user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{app.user?.name}</Text>
          <Text style={styles.userEmail}>{app.user?.email}</Text>
          <Text style={styles.userPhone}>{app.user?.phone}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{app.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Loan Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loan Application Details</Text>
        {[
          { label: 'Loan Type', value: app.loanType?.name },
          { label: 'Requested Amount', value: `৳${app.requestedAmount?.toLocaleString()}` },
          { label: 'Interest Rate', value: `${app.interestRate}% p.a.` },
          { label: 'Tenure', value: `${app.tenure} months` },
          { label: 'Purpose', value: app.purpose || '-' },
          { label: 'Monthly Income', value: `৳${app.monthlyIncome?.toLocaleString()}` },
          { label: 'Employment', value: app.employmentType || '-' },
          { label: 'Applied On', value: new Date(app.createdAt).toLocaleDateString() },
        ].map(r => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowValue}>{r.value}</Text>
          </View>
        ))}
      </View>

      {/* If Approved/Active */}
      {['approved', 'disbursed', 'active', 'completed'].includes(app.status) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Decision</Text>
          {[
            { label: 'Approved Amount', value: `৳${app.approvedAmount?.toLocaleString()}` },
            { label: 'Total Repayable', value: `৳${app.totalRepayable?.toLocaleString()}` },
            { label: 'Repayment Deadline', value: app.repaymentDeadline ? new Date(app.repaymentDeadline).toLocaleDateString() : '-' },
            { label: 'Admin Note', value: app.adminNote || '-' },
          ].map(r => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {app.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#059669' }]} onPress={() => setModalType('approve')}>
            <Text style={styles.actionBtnText}>✅ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} onPress={() => setModalType('reject')}>
            <Text style={styles.actionBtnText}>❌ Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {app.status === 'approved' && (
        <TouchableOpacity style={styles.disburseBtn} onPress={() => setModalType('disburse')}>
          <Text style={styles.disburseBtnText}>💸 Disburse Loan to User</Text>
        </TouchableOpacity>
      )}

      {/* Approve Modal */}
      <Modal visible={modalType === 'approve'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Approve Loan</Text>
            <Text style={styles.fieldLabel}>Approved Amount (৳)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.approvedAmount}
              onChangeText={v => setForm({ ...form, approvedAmount: v })} />
            <Text style={styles.fieldLabel}>Repayment Deadline (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-12-31" value={form.repaymentDeadline}
              onChangeText={v => setForm({ ...form, repaymentDeadline: v })} />
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput style={styles.input} placeholder="Any note for the user" value={form.adminNote}
              onChangeText={v => setForm({ ...form, adminNote: v })} />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#059669' }]}
              onPress={() => handleDecision('approved')} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Approve</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalType(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={modalType === 'reject'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <Text style={styles.fieldLabel}>Reason for rejection</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline placeholder="Explain the reason..."
              value={form.adminNote} onChangeText={v => setForm({ ...form, adminNote: v })} />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#DC2626' }]}
              onPress={() => handleDecision('rejected')} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm Reject</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalType(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Disburse Modal */}
      <Modal visible={modalType === 'disburse'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💸 Disburse Loan</Text>
            <Text style={styles.disburseInfo}>
              You are about to send{'\n'}
              <Text style={styles.disburseAmount}>৳{app.approvedAmount?.toLocaleString()}</Text>
              {'\n'}to {app.user?.name}
            </Text>
            <Text style={styles.disburseNote}>This will be processed via Stripe payment system.</Text>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4F46E5' }]}
              onPress={handleDisburse} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirm Disbursement</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalType(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { backgroundColor: '#059669', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 14 },
  userAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  userEmail: { color: '#A7F3D0', fontSize: 13 },
  userPhone: { color: '#A7F3D0', fontSize: 13 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  card: { margin: 16, marginBottom: 0, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLabel: { color: '#64748B', fontSize: 14 },
  rowValue: { color: '#1E293B', fontWeight: '600', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 12, margin: 16 },
  actionBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  disburseBtn: { margin: 16, backgroundColor: '#4F46E5', borderRadius: 14, padding: 18, alignItems: 'center' },
  disburseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 15, backgroundColor: '#F9FAFB', textAlignVertical: 'top' },
  modalBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelText: { color: '#94A3B8' },
  disburseInfo: { textAlign: 'center', fontSize: 16, color: '#374151', lineHeight: 28, marginBottom: 10 },
  disburseAmount: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5' },
  disburseNote: { textAlign: 'center', color: '#64748B', fontSize: 13, marginBottom: 10 },
});
