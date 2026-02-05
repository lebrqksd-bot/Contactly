import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ProfileCardView } from '@/components/ProfileCardView';

// TODO: Replace with real user context or API
const user = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
  designation: 'Software Engineer',
  education: 'B.Sc. Computer Science',
  business: 'Tech Solutions Inc.',
  phone: '+91 9876543210',
  created_at: '2022-01-01',
};

export default function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ProfileCardView user={user} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 40,
  },
});
