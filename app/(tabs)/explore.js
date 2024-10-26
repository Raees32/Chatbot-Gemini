import React from 'react';
import { StyleSheet, View } from 'react-native';
import  GeminiChat from '../../components/ChatScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <GeminiChat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});