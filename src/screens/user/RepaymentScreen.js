import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator
} from 'react-native';
import api from '../../utils/api';

export default function RepaymentScreen({ route, navigation }) {
  const { loanId, payment } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    Alert.alert(
      'Confirm Payment',
      `You are about to pay ৳${payment.totalDue?.toLocaleString()}. This includes:\n\n• Loan: ৳${payment.remaining?.toLocaleString()}\n• Late Fee: ৳${payment.lateFee?.toLocaleString()}\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: processPayment }
      ]
    );
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      // In production, use Stripe's PaymentSheet here
      // For testing, we directly confirm
      const res = await api.post(`/payment/repay/${loanId}`);
      const { paymentIntentId, totalDue } = res.data;

      // Confirm payment (in production, Stripe handles this)
      await api.post(`/payment/confirm-repayment/${loanId}`, {
        paymentIntentId,
        amountPaid: totalDue
      });

      Alert.alert('Payment Successful! 🎉', 'Your loan repayment has been processed.', [
        { text: 'OK', onPress: () => navigation.navigate('MyLoans') }
      ]);
    } catch (err) {
      Alert.alert('Payment Failed', err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loan Repayment</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Principal Remaining</Text>
          <Text style={styles.rowValue}>৳{payment.remaining?.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Interest ({payment.interestRate}% p.a.)</Text>
          <Text style={styles.rowValue}>Included</Text>
        </View>
        {payment.lateFee > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Late Fee ({payment.daysLate} days × ৳100)</Text>
            <Text style={[styles.rowValue, { color: '#DC2626' }]}>৳{payment.lateFee?.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalAmount}>৳{payment.totalDue?.toLocaleString()}</Text>
        </View>
      </View>

      {payment.isOverdue && (
        <View style={styles.lateAlert}>
          <Text style={styles.lateTitle}>⚠️ Payment Overdue!</Text>
          <Text style={styles.lateDesc}>
            Your payment is {payment.daysLate} days overdue. A late fee of ৳100/day has been added.
            Pay now to stop additional charges.
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📅 Deadline</Text>
        <Text style={styles.infoValue}>
          {payment.deadline ? new Date(payment.deadline).toLocaleDateString('en-BD', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }) : 'N/A'}
        </Text>
      </View>

      <View style={styles.stripeCard}>
        <Text style={styles.stripeTitle}>💳 Payment Method</Text>
        <Text style={styles.stripeDesc}>Secure payment powered by Stripe</Text>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>🔒 SSL Secured</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.payBtnText}>Pay ৳{payment.totalDue?.toLocaleString()} via Stripe</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  summaryCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLabel: { color: '#64748B', fontSize: 14 },
  rowValue: { color: '#1E293B', fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
  totalAmount: { fontSize: 22, fontWeight: 'bold', color: '#4F46E5' },
  lateAlert: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FEE2E2', borderRadius: 14, padding: 16 },
  lateTitle: { fontSize: 15, fontWeight: 'bold', color: '#DC2626' },
  lateDesc: { color: '#991B1B', fontSize: 13, marginTop: 6, lineHeight: 20 },
  infoCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, elevation: 2 },
  infoTitle: { fontWeight: '600', color: '#374151', marginBottom: 4 },
  infoValue: { color: '#4F46E5', fontWeight: '600' },
  stripeCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16 },
  stripeTitle: { fontWeight: 'bold', color: '#166534', fontSize: 15 },
  stripeDesc: { color: '#16A34A', fontSize: 13, marginTop: 4 },
  cardBadge: { marginTop: 8, backgroundColor: '#DCFCE7', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  cardBadgeText: { color: '#166534', fontSize: 12, fontWeight: '600' },
  payBtn: { marginHorizontal: 16, backgroundColor: '#4F46E5', borderRadius: 14, padding: 18, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});
