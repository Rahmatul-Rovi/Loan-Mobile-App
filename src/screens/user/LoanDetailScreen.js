import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import api from '../../utils/api';

export default function LoanDetailScreen({ route, navigation }) {
  const { loanType } = route.params;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    requestedAmount: '',
    tenure: '',
    purpose: '',
    monthlyIncome: '',
    employmentType: 'Employed'
  });
  const [loading, setLoading] = useState(false);

  const calculateInterest = () => {
    const amount = parseFloat(form.requestedAmount) || 0;
    const months = parseFloat(form.tenure) || 0;
    const rate = loanType.interestRate / 100;
    const totalRepayable = Math.round(amount * (1 + (rate * months) / 12));
    const interest = totalRepayable - amount;
    return { totalRepayable, interest };
  };

  const handleApply = async () => {
    if (!form.requestedAmount || !form.tenure)
      return Alert.alert('Error', 'Amount and tenure are required');

    const amt = parseFloat(form.requestedAmount);
    if (amt < loanType.minAmount || amt > loanType.maxAmount)
      return Alert.alert('Error', `Amount must be between ৳${loanType.minAmount} and ৳${loanType.maxAmount}`);

    setLoading(true);
    try {
      await api.post('/loans/apply', {
        loanTypeId: loanType._id,
        requestedAmount: amt,
        tenure: parseInt(form.tenure),
        purpose: form.purpose,
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
        employmentType: form.employmentType
      });
      Alert.alert('Success! 🎉', 'Your loan application has been submitted. We will review it shortly.', [
        { text: 'View My Loans', onPress: () => navigation.navigate('MyLoans') }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  const { totalRepayable, interest } = calculateInterest();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: loanType.color }]}>
        <Text style={styles.headerTitle}>{loanType.name}</Text>
        <Text style={styles.headerDesc}>{loanType.description}</Text>
      </View>

      {/* Details */}
      <View style={styles.detailCard}>
        <Text style={styles.cardTitle}>Loan Details</Text>
        {[
          { label: 'Interest Rate', value: `${loanType.interestRate}% per annum` },
          { label: 'Min Amount', value: `৳${loanType.minAmount?.toLocaleString()}` },
          { label: 'Max Amount', value: `৳${loanType.maxAmount?.toLocaleString()}` },
          { label: 'Min Tenure', value: `${loanType.minTenure} months` },
          { label: 'Max Tenure', value: `${loanType.maxTenure} months` },
        ].map(d => (
          <View key={d.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue}>{d.value}</Text>
          </View>
        ))}
      </View>

      {/* Calculator preview */}
      {form.requestedAmount && form.tenure ? (
        <View style={styles.calcCard}>
          <Text style={styles.cardTitle}>💡 EMI Preview</Text>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Principal</Text>
            <Text style={styles.calcValue}>৳{parseFloat(form.requestedAmount)?.toLocaleString()}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Total Interest</Text>
            <Text style={[styles.calcValue, { color: '#F59E0B' }]}>৳{interest?.toLocaleString()}</Text>
          </View>
          <View style={[styles.calcRow, styles.calcTotal]}>
            <Text style={styles.calcTotalLabel}>Total Repayable</Text>
            <Text style={styles.calcTotalValue}>৳{totalRepayable?.toLocaleString()}</Text>
          </View>
        </View>
      ) : null}

      {/* Apply Form */}
      {!showForm ? (
        <TouchableOpacity style={[styles.applyBtn, { backgroundColor: loanType.color }]} onPress={() => setShowForm(true)}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Application Form</Text>

          <Text style={styles.label}>Loan Amount (৳) *</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder={`${loanType.minAmount} - ${loanType.maxAmount}`}
            value={form.requestedAmount} onChangeText={v => setForm({ ...form, requestedAmount: v })} />

          <Text style={styles.label}>Tenure (months) *</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder={`${loanType.minTenure} - ${loanType.maxTenure}`}
            value={form.tenure} onChangeText={v => setForm({ ...form, tenure: v })} />

          <Text style={styles.label}>Purpose</Text>
          <TextInput style={styles.input} placeholder="What will you use this loan for?"
            value={form.purpose} onChangeText={v => setForm({ ...form, purpose: v })} />

          <Text style={styles.label}>Monthly Income (৳)</Text>
          <TextInput style={styles.input} keyboardType="numeric" placeholder="Your monthly income"
            value={form.monthlyIncome} onChangeText={v => setForm({ ...form, monthlyIncome: v })} />

          <Text style={styles.label}>Employment Type</Text>
          <View style={styles.empRow}>
            {['Employed', 'Self-Employed', 'Business', 'Student', 'Other'].map(type => (
              <TouchableOpacity key={type} style={[styles.empBtn, form.employmentType === type && styles.empBtnActive]}
                onPress={() => setForm({ ...form, employmentType: type })}>
                <Text style={[styles.empBtnText, form.employmentType === type && styles.empBtnTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: loanType.color }]}
            onPress={handleApply} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { padding: 24, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerDesc: { color: 'rgba(255,255,255,0.8)', marginTop: 6, fontSize: 14 },
  detailCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { color: '#64748B', fontSize: 14 },
  detailValue: { color: '#1E293B', fontWeight: '600', fontSize: 14 },
  calcCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#EEF2FF', borderRadius: 16, padding: 18 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  calcLabel: { color: '#64748B' },
  calcValue: { fontWeight: '600', color: '#1E293B' },
  calcTotal: { borderTopWidth: 1.5, borderTopColor: '#C7D2FE', marginTop: 6, paddingTop: 10 },
  calcTotalLabel: { fontWeight: 'bold', color: '#4F46E5', fontSize: 15 },
  calcTotalValue: { fontWeight: 'bold', color: '#4F46E5', fontSize: 15 },
  applyBtn: { margin: 16, borderRadius: 14, padding: 18, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  formCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 13, fontSize: 15, backgroundColor: '#F9FAFB' },
  empRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  empBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0' },
  empBtnActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  empBtnText: { color: '#64748B', fontSize: 13 },
  empBtnTextActive: { color: '#4F46E5', fontWeight: '600' },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#94A3B8', fontSize: 14 },
});
