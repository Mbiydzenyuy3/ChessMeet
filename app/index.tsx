import { StyleSheet, View } from 'react-native';

export default function App() {
  return <View style={styles.container}>{/* Your content */}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
