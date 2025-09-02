/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
// ============================ components/MoveList.tsx ============================
// import React from 'react';
// import { View, Text, ScrollView } from 'react-native';
// import { MoveObj } from '../store/gameSlice';

// export default function MoveList({ moves }: { moves: MoveObj[] }) {
//   return (
//     <ScrollView
//       style={{
//         padding: 12,
//         backgroundColor: 'white',
//         borderLeftWidth: 1,
//         borderColor: '#e5e7eb',
//         width: 200,
//       }}
//     >
//       <Text style={{ fontWeight: '700', marginBottom: 8 }}>Historique</Text>
//       {moves.map((m, i) => (
//         <View
//           key={i}
//           style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
//         >
//           <Text>
//             #{i + 1} {m.san || `${m.from}-${m.to}`}
//           </Text>
//         </View>
//       ))}
//     </ScrollView>
//   );
// }
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MoveObj } from '../store/gameSlice';

export default function MoveList({
  moves,
  fullWidth = false,
}: {
  moves: MoveObj[];
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.container, { width: fullWidth ? '100%' : 220 }]}>
      <Text style={styles.title}>Move History</Text>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {moves.length === 0 ? (
          <Text style={styles.placeholderText}>No moves yet.</Text>
        ) : (
          moves.map((m, i) => (
            <View key={i} style={styles.moveItem}>
              <Text style={styles.moveNumber}>#{i + 1}</Text>
              <Text style={styles.moveText}>{m.san || `${m.from}-${m.to}`}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'rgba(40, 25, 15, 0.8)',
    borderWidth: 1,
    borderColor: '#6b4f3a',
    borderRadius: 8,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D4AF37',
    fontSize: 18,
    textAlign: 'center',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#6b4f3a',
  },
  scrollContainer: {
    flex: 1,
  },
  moveItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#6b4f3a',
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveNumber: {
    color: '#b0a090',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
    minWidth: 40,
  },
  moveText: {
    color: '#FFF8E1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#b0a090',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
