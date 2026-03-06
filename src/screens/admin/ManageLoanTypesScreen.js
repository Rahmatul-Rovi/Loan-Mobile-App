import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import api from '../../utils/api';

const emptyForm = { name: '', description: '', interestRate: '', minAmount: '', maxAmount: '', minTenure: '', maxTenure: '' };

export default function ManageLoanTypesScreen() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = () => api.get('/admin/loan-types').then(r => setTypes(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchTypes(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModalVisible(true); };
  const openEdit = (t) => {
    setForm({ name: t.name, description: t.description, interestRate: String(t.interestRate), minAmount: String(t.minAmount), maxAmount: String(t.maxAmount), minTenure: String(t.minTenure), maxTenure: String(t.maxTenure) });
    setEditId(t._id);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.interestRate) return Alert.alert('Error', 'Name and interest rate required');
    setSubmitting(true);
    try {
      const payload = { ...form, interestRate: parseFloat(form.interestRate), minAmount: parseFloat(form.minAmount), maxAmount: parseFloat(form.maxAmount), minTenure: parseInt(form.minTenure), maxTenure: parseInt(form.maxTenure) };
      if (editId) await api.put(`/admin/loan-types/${editId}`, payload);
      else await api.post('/admin/loan-types', payload);
      setModalVisible(false);
      fetchTypes();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Deactivate', 'Deactivate this loan type?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: () => api.delete(`/admin/loan-types/${id}`).then(fetchTypes) }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Loan Types</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={types}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.typeName}>{item.name}</Text>
              <Text style={styles.typeDesc}>{item.description}</Text>
              <Text style={styles.typeMeta}>{item.interestRate}% interest | ৳{item.minAmount?.toLocaleString()} - ৳{item.maxAmount?.toLocaleString()}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item._id)}>
                <Text style={styles.delBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editId ? 'Edit' : 'Add'} Loan Type</Text>
            {[
              { label: 'Name', key: 'name', placeholder: 'e.g. Personal Loan' },
              { label: 'Description', key: 'description', placeholder: 'Brief description' },
              { label: 'Interest Rate (%)', key: 'interestRate', placeholder: '12', keyboard: 'numeric' },
              { label: 'Min Amount (৳)', key: 'minAmount', placeholder: '10000', keyboard: 'numeric' },
              { label: 'Max Amount (৳)', key: 'maxAmount', placeholder: '500000', keyboard: 'numeric' },
              { label: 'Min Tenure (months)', key: 'minTenure', placeholder: '3', keyboard: 'numeric' },
              { label: 'Max Tenure (months)', key: 'maxTenure', placeholder: '36', keyboard: 'numeric' },
            ].map(f => (
              <View key={f.key}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput style={styles.input} placeholder={f.placeholder} value={form[f.key]}
                  onChangeText={v => setForm({ ...form, [f.key]: v })} keyboardType={f.keyboard || 'default'} />
              </View>
            ))}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{editId ? 'Update' : 'Add'} Loan Type</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#059669', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#059669', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', elevation: 2 },
  typeName: { fontWeight: '700', color: '#1E293B', fontSize: 15 },
  typeDesc: { color: '#64748B', fontSize: 13, marginTop: 2 },
  typeMeta: { color: '#059669', fontSize: 12, marginTop: 4, fontWeight: '600' },
  cardActions: { gap: 8, justifyContent: 'center' },
  editBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 12 },
  delBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  delBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 11, fontSize: 14, backgroundColor: '#F9FAFB' },
  submitBtn: { backgroundColor: '#059669', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 14 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelText: { color: '#94A3B8' },
});
