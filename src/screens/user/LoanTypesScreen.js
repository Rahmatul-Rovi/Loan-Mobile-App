import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../../utils/api';

export default function LoanTypesScreen({ navigation }) {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/loans/types')
      .then(r => setLoanTypes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Loan Type</Text>
        <Text style={styles.subtitle}>Select the type of loan you need</Text>
      </View>
      <FlatList
        data={loanTypes}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LoanDetail', { loanType: item })}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.icon}>💰</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
                  <Text style={[styles.badgeText, { color: item.color }]}>{item.interestRate}% Interest</Text>
                </View>
                <Text style={styles.range}>৳{(item.minAmount/1000).toFixed(0)}K - ৳{(item.maxAmount/1000).toFixed(0)}K</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#C7D2FE', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  iconBox: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  icon: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  range: { fontSize: 12, color: '#64748B' },
  arrow: { fontSize: 24, color: '#CBD5E1', marginLeft: 8 },
});
