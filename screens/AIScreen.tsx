import { COLORS } from '@/constants/colors';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chess } from 'chess.js';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Chessboard from 'react-native-chessboard';
import type { RootStackParamList } from '../../ChessMeet/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AI'>;

const game = new Chess();

export default function AIScreen({ navigation }: Props) {
  const [fen, setFen] = useState(game.fen());

  const makeAIMove = () => {
    const moves = game.moves();
    if (moves.length > 0) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      game.move(move);
      setFen(game.fen());
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color={COLORS.white} />
      </TouchableOpacity>
      <Chessboard
        fen={fen}
        onMove={(move) => {
          const result = game.move(move);
          if (result) {
            setFen(game.fen());
            setTimeout(makeAIMove, 500);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black, justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
});
