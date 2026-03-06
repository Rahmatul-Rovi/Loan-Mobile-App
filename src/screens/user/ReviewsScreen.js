import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ReviewsScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/reviews').then(r => setReviews(r.data)).finally(() => setLoading(false));
  }, []);

  const submitReview = async () => {
    if (!comment.trim()) return Alert.alert('Error', 'Please write a comment');
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { rating, comment });
      setReviews(prev => [res.data, ...prev]);
      setModalVisible(false);
      setComment('');
      setRating(5);
      Alert.alert('Thanks!', 'Your review has been submitted.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => '⭐'.repeat(count) + '☆'.repeat(5 - count);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Review</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No reviews yet. Be the first!</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{item.user?.name?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewName}>{item.user?.name}</Text>
                <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.reviewStars}>{renderStars(item.rating)}</Text>
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        )}
      />

      {/* Add Review Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Write a Review</Text>

            <Text style={styles.ratingLabel}>Rating</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitReview} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4F46E5', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#4F46E5', fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  reviewAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  reviewName: { fontWeight: '600', color: '#1E293B' },
  reviewDate: { color: '#94A3B8', fontSize: 12 },
  reviewStars: { fontSize: 14 },
  reviewComment: { color: '#475569', lineHeight: 20 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94A3B8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  ratingLabel: { fontWeight: '600', color: '#374151', marginBottom: 8 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  star: { fontSize: 32 },
  commentInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 16 },
  submitBtn: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelModalBtn: { padding: 14, alignItems: 'center' },
  cancelModalText: { color: '#94A3B8' },
});
