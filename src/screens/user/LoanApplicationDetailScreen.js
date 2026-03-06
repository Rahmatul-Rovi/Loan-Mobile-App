import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import api from '../../utils/api';

const STATUS_INFO = {
  pending: { color: '#D97706', bg: '#FEF3C7', icon: '⏳', label: 'Pending Review' },
  approved: { color: '#059669', bg: '#D1FAE5', icon: '✅', label: 'Approved' },
  rejected: { color: '#DC2626', bg: '#FEE2E2', icon: '❌', label: 'Rejected' },
  disbursed: { color: '#2563EB', bg: '#DBEAFE', icon: '💸', label: 'Disbursed' },
  active: { color: '#7C3AED', bg: '#EDE9FE', icon: '🔄', label: 'Active' },
  completed: { color: '#4B5563', bg: '#F3F4F6', icon: '🎉', label: 'Completed' },
};

export default function LoanApplicationDetailScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const [loanRes] = await Promise.all([
        api.get(`/loans/${loanId}`)
      ]);
      setLoan(loanRes.data);

      if (['active', 'disbursed'].includes(loanRes.data.status)) {
        const payRes = await api.get(`/payment/calculate/${loanId}`);
        setPayment(payRes.data);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (!loan) return <View style={styles.center}><Text>Not found</Text></View>;

  const si = STATUS_INFO[loan.status] || STATUS_INFO.pending;

  return (
    <ScrollView style={styles.container}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: si.bg }]}>
        <Text style={styles.statusIcon}>{si.icon}</Text>
        <Text style={[styles.statusLabel, { color: si.color }]}>{si.label}</Text>
        {loan.adminNote ? <Text style={styles.adminNote}>Admin Note: {loan.adminNote}</Text> : null}
      </View>

      {/* Loan Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loan Information</Text>
        {[
          { label: 'Loan Type', value: loan.loanType?.name },
          { label: 'Requested Amount', value: `৳${loan.requestedAmount?.toLocaleString()}` },
          { label: 'Tenure', value: `${loan.tenure} months` },
          { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
          { label: 'Purpose', value: loan.purpose || '-' },
          { label: 'Applied On', value: new Date(loan.createdAt).toLocaleDateString() },
        ].map(r => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowValue}>{r.value}</Text>
          </View>
        ))}
      </View>

      {/* If Approved/Active - show repayment info */}
      {['approved', 'disbursed', 'active'].includes(loan.status) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Repayment Details</Text>
          {[
            { label: 'Approved Amount', value: `৳${loan.approvedAmount?.toLocaleString()}` },
            { label: 'Total Repayable', value: `৳${loan.totalRepayable?.toLocaleString()}` },
            { label: 'Repayment Deadline', value: loan.repaymentDeadline ? new Date(loan.repaymentDeadline).toLocaleDateString() : '-' },
          ].map(r => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowValue}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Payment Calculator for Active Loans */}
      {payment && (
        <View style={[styles.card, { backgroundColor: '#EEF2FF' }]}>
          <Text style={styles.cardTitle}>💳 Payment Summary</Text>
          {[
            { label: 'Total Repayable', value: `৳${payment.totalRepayable?.toLocaleString()}` },
            { label: 'Already Paid', value: `৳${payment.paidAmount?.toLocaleString()}`, color: '#059669' },
            { label: 'Remaining', value: `৳${payment.remaining?.toLocaleString()}` },
            { label: 'Late Fee', value: `৳${payment.lateFee?.toLocaleString()}`, color: payment.lateFee > 0 ? '#DC2626' : '#4B5563' },
          ].map(r => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={[styles.rowValue, r.color && { color: r.color }]}>{r.value}</Text>
            </View>
          ))}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Due Now</Text>
            <Text style={styles.totalValue}>৳{payment.totalDue?.toLocaleString()}</Text>
          </View>

          {payment.isOverdue && (
            <View style={styles.overdueAlert}>
              <Text style={styles.overdueText}>⚠️ Overdue by {payment.daysLate} days! +৳100/day late fee</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => navigation.navigate('Repayment', { loanId: loan._id, payment })}
          >
            <Text style={styles.payBtnText}>Pay Now ৳{payment.totalDue?.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* If disbursed - show disbursement info */}
      {(loan.status === 'disbursed' || loan.status === 'active' || loan.status === 'completed') && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Disbursement Info</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Disbursed Amount</Text>
            <Text style={[styles.rowValue, { color: '#059669', fontWeight: 'bold' }]}>৳{loan.disbursedAmount?.toLocaleString()}</Text>
          </View>
          {loan.disbursedAt && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Disbursed On</Text>
              <Text style={styles.rowValue}>{new Date(loan.disbursedAt).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBanner: { padding: 24, alignItems: 'center' },
  statusIcon: { fontSize: 48 },
  statusLabel: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  adminNote: { marginTop: 8, color: '#64748B', fontSize: 13, textAlign: 'center' },
  card: { margin: 16, marginTop: 0, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLabel: { color: '#64748B', fontSize: 14 },
  rowValue: { color: '#1E293B', fontWeight: '600', fontSize: 14 },
  totalRow: { borderBottomWidth: 0, marginTop: 4, borderTopWidth: 2, borderTopColor: '#C7D2FE', paddingTop: 12 },
  totalLabel: { color: '#4F46E5', fontWeight: 'bold', fontSize: 15 },
  totalValue: { color: '#4F46E5', fontWeight: 'bold', fontSize: 18 },
  overdueAlert: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginTop: 10 },
  overdueText: { color: '#DC2626', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  payBtn: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 14 },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
