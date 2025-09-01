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
import { View, Text, ScrollView } from 'react-native';
import { MoveObj } from '../store/gameSlice';

export default function MoveList({
  moves,
  fullWidth = false,
}: {
  moves: MoveObj[];
  fullWidth?: boolean;
}) {
  return (
    <ScrollView
      style={{
        padding: 12,
        backgroundColor: 'white',
        borderLeftWidth: fullWidth ? 0 : 1,
        borderColor: '#e5e7eb',
        width: fullWidth ? '100%' : 200,
      }}
    >
      <Text style={{ fontWeight: '700', marginBottom: 8 }}>Historique</Text>
      {moves.map((m, i) => (
        <View
          key={i}
          style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
        >
          <Text>
            #{i + 1} {m.san || `${m.from}-${m.to}`}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
